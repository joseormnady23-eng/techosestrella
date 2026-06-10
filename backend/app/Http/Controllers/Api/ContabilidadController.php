<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Factura;
use App\Models\GastoContable;
use App\Models\SolicitudCambio;
use App\Services\EcfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContabilidadController extends Controller
{
    public function __construct(private readonly EcfService $ecf)
    {
    }

    /** Resumen financiero del dashboard. */
    public function resumen(Request $request): JsonResponse
    {
        $periodo = $request->input('periodo', now()->format('Y-m'));
        [$ano, $mes] = explode('-', $periodo);

        $ingresos = Factura::where('anulada', false)
            ->whereYear('fecha_emision', $ano)->whereMonth('fecha_emision', $mes)->sum('total');

        $gastos = GastoContable::whereYear('fecha', $ano)->whereMonth('fecha', $mes)->sum('monto');

        $porCobrar = Factura::where('anulada', false)->where('pagada', false)->sum('total');

        $rechazadas = Factura::where('estado_ecf', 'rechazado')->count();

        $solicitudesPendientes = SolicitudCambio::where('estado', 'pendiente')->count();

        return response()->json([
            'periodo' => $periodo,
            'ingresos' => round($ingresos, 2),
            'gastos' => round($gastos, 2),
            'utilidad' => round($ingresos - $gastos, 2),
            'por_cobrar' => round($porCobrar, 2),
            'facturas_rechazadas_dgii' => $rechazadas,
            'solicitudes_pendientes' => $solicitudesPendientes,
        ]);
    }

    /** Estado del certificado .p12 de la DGII (solo dueño). */
    public function certificadoEstado(): JsonResponse
    {
        return response()->json($this->ecf->certificadoEstado());
    }
}
