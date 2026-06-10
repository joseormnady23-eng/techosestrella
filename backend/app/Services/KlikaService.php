<?php

namespace App\Services;

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
     * Envía un prompt a Klika y devuelve la respuesta.
     *
     * @return array{ok: bool, respuesta: string, modelo: string}
     */
    public function generar(string $prompt, ?string $sistema = null): array
    {
        try {
            $resp = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/api/generate", [
                    'model' => $this->modelo,
                    'prompt' => $prompt,
                    'system' => $sistema ?? $this->promptSistema(),
                    'stream' => false,
                ]);

            if ($resp->ok()) {
                return [
                    'ok' => true,
                    'respuesta' => trim($resp->json('response', '')),
                    'modelo' => $this->modelo,
                ];
            }

            Log::warning('KlikaService: respuesta no OK', ['status' => $resp->status()]);
        } catch (\Throwable $e) {
            Log::warning('KlikaService: cnsia no respondió', ['error' => $e->getMessage()]);
        }

        return [
            'ok' => false,
            'respuesta' => 'Klika no está disponible en este momento (no pude conectar con el servidor de IA). Intenta de nuevo en un momento.',
            'modelo' => $this->modelo,
        ];
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

    protected function promptSistema(): string
    {
        return 'Eres Klika, el asistente de IA del ERP de Techos Estrella SRL, una empresa '
            .'dominicana de impermeabilización de techos. Ayudas con cotizaciones, reprogramaciones '
            .'por clima, inventario y dudas sobre las obras. Responde en español dominicano, claro y directo.';
    }
}
