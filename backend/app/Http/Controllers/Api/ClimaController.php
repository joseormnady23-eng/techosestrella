<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClimaDia;
use App\Models\Obra;
use App\Services\ClimaService;
use Illuminate\Http\JsonResponse;

class ClimaController extends Controller
{
    public function __construct(private readonly ClimaService $clima)
    {
    }

    /** Clima de 14 días para la ubicación de una obra (refresca si hace falta). */
    public function obra(Obra $obra): JsonResponse
    {
        if (! $obra->latitud || ! $obra->longitud) {
            return response()->json(['message' => 'La obra no tiene coordenadas.'], 422);
        }

        $existentes = ClimaDia::where('latitud', $obra->latitud)
            ->where('longitud', $obra->longitud)
            ->where('fecha', '>=', now()->toDateString())
            ->count();

        if ($existentes < 7) {
            $this->clima->actualizarParaCoordenada((float) $obra->latitud, (float) $obra->longitud, 14);
        }

        $dias = ClimaDia::where('latitud', $obra->latitud)
            ->where('longitud', $obra->longitud)
            ->where('fecha', '>=', now()->toDateString())
            ->orderBy('fecha')->limit(14)->get();

        return response()->json($dias);
    }
}
