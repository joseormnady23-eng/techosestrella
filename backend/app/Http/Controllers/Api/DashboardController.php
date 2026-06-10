<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClimaDia;
use App\Models\Cotizacion;
use App\Models\Material;
use App\Models\Obra;
use App\Models\ObraDia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** Resumen del inicio: obras, cotizaciones, clima y stock. */
    public function index(Request $request): JsonResponse
    {
        $hoy = now()->toDateString();

        $obrasActivas = Obra::whereIn('estado', ['aprobada', 'en_proceso'])->count();

        $obrasHoy = ObraDia::with('obra:id,codigo,titulo')
            ->whereDate('fecha', $hoy)
            ->whereIn('estado', ['programado', 'trabajado', 'reprogramado'])
            ->get();

        $cotizacionesPendientes = Cotizacion::whereIn('estado', ['borrador', 'enviada'])->count();

        // Próximos días bloqueados por clima (alertas).
        $diasBloqueados = ClimaDia::where('fecha', '>=', $hoy)
            ->where('estado', 'bloqueado')
            ->orderBy('fecha')->limit(7)->get(['fecha', 'prob_lluvia', 'estado']);

        $materialesBajos = Material::bajoMinimo()->get(['id', 'nombre', 'stock_actual', 'stock_minimo', 'unidad']);

        return response()->json([
            'obras_activas' => $obrasActivas,
            'obras_hoy' => $obrasHoy,
            'cotizaciones_pendientes' => $cotizacionesPendientes,
            'alertas_clima' => $diasBloqueados,
            'materiales_bajo_minimo' => $materialesBajos,
        ]);
    }
}
