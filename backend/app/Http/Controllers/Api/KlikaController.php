<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KlikaConversacion;
use App\Services\KlikaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KlikaController extends Controller
{
    public function __construct(private readonly KlikaService $klika)
    {
    }

    /** Chat con Klika (llama a Ollama en cnsia). Persiste el hilo. */
    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mensaje' => ['required', 'string'],
            'conversacion_id' => ['nullable', 'exists:klika_conversaciones,id'],
        ]);

        $conversacion = isset($data['conversacion_id'])
            ? KlikaConversacion::findOrFail($data['conversacion_id'])
            : KlikaConversacion::create([
                'usuario_id' => $request->user()->id,
                'titulo' => mb_substr($data['mensaje'], 0, 60),
            ]);

        $conversacion->mensajes()->create(['rol' => 'user', 'contenido' => $data['mensaje']]);

        $resultado = $this->klika->generarConContexto($data['mensaje'], $request->user());

        $conversacion->mensajes()->create(['rol' => 'assistant', 'contenido' => $resultado['respuesta']]);

        return response()->json([
            'conversacion_id' => $conversacion->id,
            'ok' => $resultado['ok'],
            'respuesta' => $resultado['respuesta'],
        ]);
    }

    public function conversaciones(Request $request): JsonResponse
    {
        return response()->json(
            KlikaConversacion::where('usuario_id', $request->user()->id)
                ->with(['mensajes' => fn ($q) => $q->latest()->limit(1)])
                ->latest()->get()
        );
    }

    public function show(KlikaConversacion $conversacion): JsonResponse
    {
        return response()->json($conversacion->load('mensajes'));
    }
}
