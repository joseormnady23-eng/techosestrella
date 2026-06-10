<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClienteAcceso;
use App\Models\Cotizacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PortalController extends Controller
{
    /** (Autenticado) Genera un link de acceso por token para el cliente. */
    public function generarAcceso(Request $request, Cotizacion $cotizacion): JsonResponse
    {
        $data = $request->validate([
            'canal' => ['required', Rule::in(['whatsapp', 'correo'])],
            'dias_validez' => ['nullable', 'integer', 'min:1', 'max:90'],
        ]);

        if (! $cotizacion->cliente_id && ! $cotizacion->obra?->cliente_id) {
            return response()->json(['message' => 'La cotización no tiene cliente asociado.'], 422);
        }

        $acceso = ClienteAcceso::create([
            'cliente_id' => $cotizacion->cliente_id ?? $cotizacion->obra->cliente_id,
            'obra_id' => $cotizacion->obra_id,
            'token' => Str::random(48),
            'canal' => $data['canal'],
            'expira_en' => now()->addDays($data['dias_validez'] ?? 30),
        ]);

        return response()->json([
            'token' => $acceso->token,
            'url' => url("/portal/{$acceso->token}"),
            'expira_en' => $acceso->expira_en,
        ], 201);
    }

    /** (Público) El cliente ve su cotización + galería de avances visibles. */
    public function ver(string $token): JsonResponse
    {
        $acceso = $this->accesoVigente($token);
        if (! $acceso) {
            return response()->json(['message' => 'Enlace inválido o expirado.'], 404);
        }

        $acceso->update(['ultimo_acceso' => now()]);

        $cotizacion = Cotizacion::with(['items', 'cliente:id,nombre'])
            ->where('obra_id', $acceso->obra_id)
            ->orWhere('cliente_id', $acceso->cliente_id)
            ->latest()->first();

        if ($cotizacion) {
            $cotizacion->update(['estado_cliente' => 'vista']);
        }

        $fotos = $acceso->obra
            ? $acceso->obra->fotos()->where('visible_cliente', true)->latest('tomada_en')->get()
            : collect();

        return response()->json([
            'cliente' => $acceso->cliente?->only(['nombre']),
            'cotizacion' => $cotizacion,
            'avances' => $fotos,
        ]);
    }

    /** (Público) El cliente aprueba / pide cambios / rechaza (completa o por etapa). */
    public function aprobar(Request $request, string $token): JsonResponse
    {
        $acceso = $this->accesoVigente($token);
        if (! $acceso) {
            return response()->json(['message' => 'Enlace inválido o expirado.'], 404);
        }

        $data = $request->validate([
            'cotizacion_id' => ['required', 'exists:cotizaciones,id'],
            'alcance' => ['required', Rule::in(['completa', 'etapa'])],
            'etapa' => ['nullable', 'integer'],
            'decision' => ['required', Rule::in(['aprobada', 'cambios', 'rechazada'])],
            'comentario' => ['nullable', 'string'],
        ]);

        $cotizacion = Cotizacion::findOrFail($data['cotizacion_id']);

        $cotizacion->aprobaciones()->create([
            'cliente_acceso_id' => $acceso->id,
            'alcance' => $data['alcance'],
            'etapa' => $data['etapa'] ?? null,
            'decision' => $data['decision'],
            'comentario' => $data['comentario'] ?? null,
            'ip' => $request->ip(),
            'decidido_en' => now(),
        ]);

        $cotizacion->update([
            'estado_cliente' => match ($data['decision']) {
                'aprobada' => 'aprobada',
                'cambios' => 'cambios_pedidos',
                'rechazada' => 'rechazada',
            },
            'estado' => $data['decision'] === 'aprobada' ? 'aprobada' : $cotizacion->estado,
        ]);

        return response()->json(['message' => 'Decisión registrada. ¡Gracias!']);
    }

    private function accesoVigente(string $token): ?ClienteAcceso
    {
        $acceso = ClienteAcceso::with('obra')->where('token', $token)->first();

        return $acceso && $acceso->vigente() ? $acceso : null;
    }
}
