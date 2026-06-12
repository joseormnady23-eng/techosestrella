<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UbicacionConductor;
use App\Models\Vehiculo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UbicacionConductorController extends Controller
{
    /**
     * El conductor/aplicador envía su posición GPS.
     * POST /api/mi/ubicacion
     */
    public function ping(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitud'    => ['required', 'numeric', 'between:-90,90'],
            'longitud'   => ['required', 'numeric', 'between:-180,180'],
            'precision_m' => ['nullable', 'integer', 'min:0'],
        ]);

        $usuario = $request->user();

        // Buscar el vehículo asignado a la cuadrilla del conductor (si tiene)
        $vehiculoId = null;
        if ($usuario->cuadrillas()->exists()) {
            $cuadrillaId = $usuario->cuadrillas()->first()?->id;
            if ($cuadrillaId) {
                $vehiculoId = Vehiculo::where('cuadrilla_id', $cuadrillaId)->value('id');
            }
        }

        UbicacionConductor::updateOrCreate(
            ['usuario_id' => $usuario->id],
            [
                'vehiculo_id' => $vehiculoId,
                'latitud'     => $data['latitud'],
                'longitud'    => $data['longitud'],
                'precision_m' => $data['precision_m'] ?? 0,
                'activo'      => true,
            ]
        );

        return response()->json(['ok' => true]);
    }

    /**
     * El ERP consulta todas las ubicaciones activas (últ. 10 min).
     * GET /api/vehiculos/ubicaciones
     */
    public function index(): JsonResponse
    {
        $umbral = now()->subMinutes(10);

        $ubicaciones = UbicacionConductor::with(['usuario:id,nombre,rol', 'vehiculo:id,placa,tipo,modelo'])
            ->where('activo', true)
            ->where('updated_at', '>=', $umbral)
            ->get()
            ->map(fn ($u) => [
                'usuario_id'  => $u->usuario_id,
                'nombre'      => $u->usuario?->nombre,
                'rol'         => $u->usuario?->rol,
                'vehiculo'    => $u->vehiculo ? "{$u->vehiculo->tipo} {$u->vehiculo->modelo} ({$u->vehiculo->placa})" : null,
                'placa'       => $u->vehiculo?->placa,
                'latitud'     => (float) $u->latitud,
                'longitud'    => (float) $u->longitud,
                'precision_m' => $u->precision_m,
                'ultimo_ping' => $u->updated_at->diffForHumans(),
            ]);

        return response()->json($ubicaciones);
    }

    /**
     * El conductor marca que ya no está en ruta (logout / checkout).
     * POST /api/mi/ubicacion/desactivar
     */
    public function desactivar(Request $request): JsonResponse
    {
        UbicacionConductor::where('usuario_id', $request->user()->id)
            ->update(['activo' => false]);

        return response()->json(['ok' => true]);
    }
}
