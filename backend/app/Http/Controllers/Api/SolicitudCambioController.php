<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SolicitudCambio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SolicitudCambioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = SolicitudCambio::with(['solicitante:id,nombre', 'revisor:id,nombre']);
        if ($request->filled('estado')) {
            $q->where('estado', $request->estado);
        }

        return response()->json($q->latest()->get());
    }

    /** Crea una solicitud de cambio sensible (ej. precio de material). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'modelo' => ['required', 'string', 'max:50'],
            'modelo_id' => ['required', 'integer'],
            'campo' => ['required', 'string', 'max:50'],
            'valor_actual' => ['nullable', 'string'],
            'valor_nuevo' => ['required', 'string'],
            'motivo' => ['nullable', 'string', 'max:200'],
        ]);

        $solicitud = SolicitudCambio::create($data + [
            'estado' => 'pendiente',
            'solicitado_por' => $request->user()->id,
        ]);

        return response()->json($solicitud, 201);
    }

    /** Aprueba y aplica el cambio al modelo objetivo (solo dueño). */
    public function aprobar(Request $request, SolicitudCambio $solicitud): JsonResponse
    {
        DB::transaction(function () use ($solicitud, $request) {
            $clase = "App\\Models\\{$solicitud->modelo}";
            if (class_exists($clase)) {
                $registro = $clase::find($solicitud->modelo_id);
                $registro?->update([$solicitud->campo => $solicitud->valor_nuevo]);
            }

            $solicitud->update([
                'estado' => 'aprobado',
                'revisado_por' => $request->user()->id,
                'revisado_en' => now(),
            ]);
        });

        return response()->json(['message' => 'Cambio aprobado y aplicado.', 'solicitud' => $solicitud->fresh()]);
    }

    public function rechazar(Request $request, SolicitudCambio $solicitud): JsonResponse
    {
        $data = $request->validate(['motivo_rechazo' => ['required', 'string', 'max:200']]);

        $solicitud->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => $data['motivo_rechazo'],
            'revisado_por' => $request->user()->id,
            'revisado_en' => now(),
        ]);

        return response()->json(['message' => 'Solicitud rechazada.', 'solicitud' => $solicitud]);
    }
}
