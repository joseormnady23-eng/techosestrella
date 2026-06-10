<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClimaDia;
use App\Models\ObraDia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ObraDiaController extends Controller
{
    /** Planificador del mes: días programados + clima, con detección de conflictos. */
    public function index(Request $request): JsonResponse
    {
        $mes = $request->input('mes', now()->format('Y-m'));
        [$ano, $m] = explode('-', $mes);

        $dias = ObraDia::with(['obra:id,codigo,titulo,cuadrilla_id,latitud,longitud', 'clima'])
            ->whereYear('fecha', $ano)->whereMonth('fecha', $m)
            ->get()
            ->map(function ($dia) {
                $clima = $dia->clima;
                // Conflicto: obra programada en día bloqueado por lluvia.
                $conflicto = $clima && $clima->estado === 'bloqueado'
                    && in_array($dia->estado, ['programado', 'reprogramado'], true);

                return [
                    'id' => $dia->id,
                    'obra_id' => $dia->obra_id,
                    'obra' => $dia->obra,
                    'fecha' => $dia->fecha->toDateString(),
                    'estado' => $dia->estado,
                    'cuadrilla_incompleta' => $dia->cuadrilla_incompleta,
                    'clima' => $clima ? [
                        'estado' => $clima->estado,
                        'prob_lluvia' => $clima->prob_lluvia,
                    ] : null,
                    'conflicto' => $conflicto,
                    'nota' => $dia->nota,
                ];
            });

        return response()->json(['mes' => $mes, 'dias' => $dias]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'obra_id' => ['required', 'exists:obras,id'],
            'fecha' => ['required', 'date'],
            'estado' => ['sometimes', Rule::in(['programado', 'trabajado', 'reprogramado', 'cancelado_clima', 'descanso'])],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        $data['estado'] ??= 'programado';
        // Enlaza con el clima de esa fecha/coordenada si existe.
        $obra = \App\Models\Obra::find($data['obra_id']);
        if ($obra && $obra->latitud) {
            $clima = ClimaDia::where('fecha', $data['fecha'])
                ->where('latitud', $obra->latitud)->where('longitud', $obra->longitud)->first();
            $data['clima_dia_id'] = $clima?->id;
        }

        $dia = ObraDia::create($data);

        return response()->json($dia->load('clima'), 201);
    }

    public function update(Request $request, ObraDia $obraDia): JsonResponse
    {
        $data = $request->validate([
            'fecha' => ['sometimes', 'date'],
            'estado' => ['sometimes', Rule::in(['programado', 'trabajado', 'reprogramado', 'cancelado_clima', 'descanso'])],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        $obraDia->update($data);

        return response()->json($obraDia);
    }

    public function destroy(ObraDia $obraDia): JsonResponse
    {
        $obraDia->delete();

        return response()->json(['message' => 'Día eliminado del planificador.']);
    }
}
