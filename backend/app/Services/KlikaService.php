<?php

namespace App\Services;

use App\Models\ClimaDia;
use App\Models\Cotizacion;
use App\Models\Cuadrilla;
use App\Models\Factura;
use App\Models\Gasto;
use App\Models\Material;
use App\Models\Obra;
use App\Models\Usuario;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente del asistente Klika IA. Habla con Ollama en cnsia (10.0.0.237:11434).
 * Si cnsia no responde, devuelve un mensaje amable en vez de reventar.
 */
class KlikaService
{
    protected string $baseUrl;
    protected string $modelo;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.ollama.url', env('KLIKA_OLLAMA_URL', 'http://10.0.0.237:11434')), '/');
        $this->modelo = config('services.ollama.model', env('KLIKA_OLLAMA_MODEL', 'klika:latest'));
        $this->timeout = (int) config('services.ollama.timeout', env('KLIKA_OLLAMA_TIMEOUT', 120));
    }

    /**
     * Genera una respuesta con contexto real de la base de datos según el rol del usuario.
     *
     * @return array{ok: bool, respuesta: string, modelo: string}
     */
    public function generarConContexto(string $prompt, Usuario $user): array
    {
        $contexto = $this->buildContexto($user);
        $sistema = $this->promptSistema($user->rol);

        // Usamos /api/chat con un turno de "priming": el modelo recibe los datos
        // como mensaje de usuario y confirma que los vio antes de responder la pregunta real.
        // Esto es mucho más fiable que inyectar en el system prompt.
        $messages = [
            ['role' => 'system',    'content' => $sistema],
            ['role' => 'user',      'content' => "Estos son los datos actuales del negocio:\n\n{$contexto}"],
            ['role' => 'assistant', 'content' => "Entendido. Ya tengo toda la información actual del negocio."],
            ['role' => 'user',      'content' => $prompt],
        ];

        return $this->chat($messages);
    }

    /**
     * Llama a /api/chat de Ollama con un array de mensajes.
     *
     * @param  array<array{role: string, content: string}>  $messages
     * @return array{ok: bool, respuesta: string, modelo: string}
     */
    public function chat(array $messages): array
    {
        try {
            $resp = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/api/chat", [
                    'model'    => $this->modelo,
                    'messages' => $messages,
                    'stream'   => false,
                ]);

            if ($resp->ok()) {
                $content = $resp->json('message.content', '');
                return [
                    'ok'        => true,
                    'respuesta' => trim($content),
                    'modelo'    => $this->modelo,
                ];
            }

            Log::warning('KlikaService: respuesta no OK', ['status' => $resp->status()]);
        } catch (\Throwable $e) {
            Log::warning('KlikaService: cnsia no respondió', ['error' => $e->getMessage()]);
        }

        return [
            'ok'        => false,
            'respuesta' => 'Klika no está disponible en este momento. Intenta de nuevo en un momento.',
            'modelo'    => $this->modelo,
        ];
    }

    /**
     * Envía un prompt simple a Klika (sin contexto de BD).
     *
     * @return array{ok: bool, respuesta: string, modelo: string}
     */
    public function generar(string $prompt, ?string $sistema = null): array
    {
        return $this->chat([
            ['role' => 'system', 'content' => $sistema ?? $this->promptSistema()],
            ['role' => 'user',   'content' => $prompt],
        ]);
    }

    /**
     * ¿Está vivo el servidor de Ollama?
     */
    public function disponible(): bool
    {
        try {
            return Http::timeout(5)->get("{$this->baseUrl}/api/tags")->ok();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Construye el contexto de datos reales para inyectarlo en el prompt de sistema.
     * El dueño recibe datos financieros; supervisor y dueño reciben info de cuadrillas.
     */
    protected function buildContexto(Usuario $user): string
    {
        $partes = [];
        $hoy = now()->toDateString();

        // --- Obras en proceso (todos los roles) ---
        $obras = Obra::with(['cliente', 'cuadrilla'])
            ->where('estado', 'en_proceso')
            ->orderBy('fecha_fin_estimada')
            ->get();

        if ($obras->isNotEmpty()) {
            $partes[] = "OBRAS EN PROCESO ({$obras->count()}):";
            foreach ($obras as $o) {
                $inicio = $o->fecha_inicio_estimada ? $o->fecha_inicio_estimada->format('d/m/Y') : 'sin fecha';
                $fin = $o->fecha_fin_estimada ? $o->fecha_fin_estimada->format('d/m/Y') : 'sin fecha';
                $partes[] = "• {$o->codigo}: {$o->titulo}"
                    . " · Cliente: {$o->cliente?->nombre}"
                    . " · Cuadrilla: {$o->cuadrilla?->nombre}"
                    . " · Inicio est.: {$inicio}"
                    . " · Fin est.: {$fin}"
                    . " · Dirección: {$o->direccion_obra}";
            }
        } else {
            $partes[] = "OBRAS EN PROCESO: Ninguna actualmente.";
        }

        // --- Inventario bajo mínimo (todos) ---
        $bajoMin = Material::bajoMinimo()->where('es_herramienta', false)->get();
        if ($bajoMin->isNotEmpty()) {
            $partes[] = "\nMATERIALES BAJO MÍNIMO ({$bajoMin->count()}):";
            foreach ($bajoMin as $m) {
                $partes[] = "- {$m->nombre}: {$m->stock_actual} / mínimo {$m->stock_minimo} {$m->unidad}";
            }
        } else {
            $partes[] = "\nINVENTARIO: Todos los materiales están sobre el mínimo.";
        }

        // --- Clima próximos 7 días (todos) ---
        $clima = ClimaDia::where('fecha', '>=', $hoy)
            ->orderBy('fecha')
            ->limit(7)
            ->get();

        if ($clima->isNotEmpty()) {
            $partes[] = "\nCLIMA PRÓXIMOS DÍAS:";
            foreach ($clima as $c) {
                $fecha = $c->fecha->format('d/m/Y');
                $partes[] = "- {$fecha}: {$c->estado} · Prob. lluvia: {$c->prob_lluvia}% · Precipitación: {$c->precipitacion_mm}mm";
            }
        } else {
            $partes[] = "\nCLIMA: Sin datos disponibles.";
        }

        // --- Cotizaciones pendientes (todos) ---
        $cotizaciones = Cotizacion::with(['obra', 'cliente'])
            ->where('estado', 'pendiente')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        if ($cotizaciones->isNotEmpty()) {
            $partes[] = "\nCOTIZACIONES PENDIENTES ({$cotizaciones->count()}):";
            foreach ($cotizaciones as $c) {
                $nombre = $c->obra?->titulo ?? $c->cliente_nombre ?? 'Sin nombre';
                $partes[] = "- COT-{$c->id}: {$nombre} · Total: RD\$ " . number_format($c->total, 2, '.', ',');
            }
        }

        // --- Cuadrillas (supervisor y dueño) ---
        if (in_array($user->rol, ['dueno', 'supervisor'])) {
            $cuadrillas = Cuadrilla::with(['obras' => fn ($q) => $q->where('estado', 'en_proceso')])
                ->where('activa', true)
                ->get();

            if ($cuadrillas->isNotEmpty()) {
                $partes[] = "\nCUADRILLAS ACTIVAS:";
                foreach ($cuadrillas as $c) {
                    $obraActual = $c->obras->first();
                    $estado = $obraActual ? "trabajando en: {$obraActual->titulo}" : "disponible";
                    $partes[] = "- {$c->nombre}: {$estado}";
                }
            }
        }

        // --- Finanzas del mes (dueño ÚNICAMENTE) ---
        if ($user->rol === 'dueno') {
            $inicioMes = now()->startOfMonth()->toDateString();
            $finMes = now()->endOfMonth()->toDateString();

            $ingresos = Factura::whereBetween('fecha_emision', [$inicioMes, $finMes])
                ->where('anulada', false)
                ->sum('total');

            $gastos = Gasto::whereBetween('fecha', [$inicioMes, $finMes])
                ->sum('monto');

            $balance = $ingresos - $gastos;
            $signo = $balance >= 0 ? '+' : '';

            $partes[] = "\nFINANZAS DEL MES ACTUAL (CONFIDENCIAL — solo para el dueño):";
            $partes[] = "- Ingresos por facturas: RD\$ " . number_format($ingresos, 2, '.', ',');
            $partes[] = "- Gastos registrados: RD\$ " . number_format($gastos, 2, '.', ',');
            $partes[] = "- Balance: {$signo}RD\$ " . number_format($balance, 2, '.', ',');
        }

        return implode("\n", $partes);
    }

    protected function promptSistema(?string $rol = null): string
    {
        $base = 'Eres Klika, el asistente de IA del ERP de Techos Estrella SRL, una empresa '
            . 'dominicana de impermeabilización de techos en Santiago, RD. '
            . 'En el bloque DATOS EN TIEMPO REAL que recibes tienes TODA la información actual del negocio: '
            . 'obras activas, inventario, clima, cotizaciones y cuadrillas. '
            . 'REGLA CRÍTICA: NUNCA le pidas al usuario datos que ya están en ese bloque. '
            . 'Si el usuario pregunta por obras, clima o inventario, responde directamente con los datos que tienes. '
            . 'Si hay varias obras y el usuario no especifica cuál, lista las opciones del contexto y pregunta cuál. '
            . 'Puedes sugerir acciones (reagendar, pedir materiales, etc.) pero aclara que los cambios los hace el usuario en el ERP. '
            . 'Responde en español dominicano, claro y directo. No inventes datos fuera del contexto provisto. '
            . 'NO te presentes en cada mensaje ("Soy Klika", "Hola", etc.) — el usuario ya sabe quién eres. Ve directo al punto. '
            . 'FORMATO: No uses markdown. No uses #, ##, ###, **, *, ni guiones para listas. '
            . 'Usa texto plano con saltos de línea para separar secciones. Para listas usa "• " al inicio de cada ítem.';

        return match ($rol) {
            'dueno' => $base . ' Tienes acceso completo: obras, inventario, clima, cuadrillas y finanzas.',
            'secretaria' => $base . ' Puedes consultar obras, inventario, cotizaciones y clima.',
            'supervisor' => $base . ' Puedes consultar obras, cuadrillas, inventario y clima. No tienes acceso a datos financieros.',
            'aplicador' => $base . ' Solo puedes consultar el estado de las obras en proceso y el clima.',
            default => $base,
        };
    }
}
