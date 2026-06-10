<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Asistencia::with(['obra:id,codigo,titulo', 'usuario:id,nombre']);

        if ($request->filled('obra_id')) {
            $q->where('obra_id', $request->obra_id);
        }
        if ($request->filled('usuario_id')) {
            $q->where('usuario_id', $request->usuario_id);
        }
        if ($request->filled('fecha')) {
            $q->whereDate('fecha', $request->fecha);
        }

        return response()->json($q->latest('fecha')->get());
    }

    /** Check-in del aplicador (solo para sí mismo) con GPS. */
    public function checkin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'obra_id' => ['required', 'exists:obras,id'],
            'latitud' => ['nullable', 'numeric'],
            'longitud' => ['nullable', 'numeric'],
        ]);

        $asistencia = Asistencia::firstOrNew([
            'obra_id' => $data['obra_id'],
            'usuario_id' => $request->user()->id,
            'fecha' => now()->toDateString(),
        ]);

        if ($asistencia->hora_entrada) {
            return response()->json(['message' => 'Ya hiciste check-in hoy en esta obra.', 'asistencia' => $asistencia], 422);
        }

        $asistencia->fill([
            'hora_entrada' => now(),
            'latitud' => $data['latitud'] ?? null,
            'longitud' => $data['longitud'] ?? null,
        ])->save();

        return response()->json(['message' => 'Check-in registrado a las '.now()->format('h:i A'), 'asistencia' => $asistencia], 201);
    }

    /** Check-out del aplicador. */
    public function checkout(Request $request): JsonResponse
    {
        $data = $request->validate(['obra_id' => ['required', 'exists:obras,id']]);

        $asistencia = Asistencia::where([
            'obra_id' => $data['obra_id'],
            'usuario_id' => $request->user()->id,
            'fecha' => now()->toDateString(),
        ])->first();

        if (! $asistencia || ! $asistencia->hora_entrada) {
            return response()->json(['message' => 'No tienes un check-in abierto hoy.'], 422);
        }

        $asistencia->update(['hora_salida' => now()]);

        return response()->json(['message' => 'Check-out registrado a las '.now()->format('h:i A'), 'asistencia' => $asistencia]);
    }

    /** Corrección de check-in/out por supervisor o dueño. */
    public function corregir(Request $request, Asistencia $asistencia): JsonResponse
    {
        $data = $request->validate([
            'hora_entrada' => ['nullable', 'date'],
            'hora_salida' => ['nullable', 'date'],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        $asistencia->update($data);

        return response()->json($asistencia);
    }
}
