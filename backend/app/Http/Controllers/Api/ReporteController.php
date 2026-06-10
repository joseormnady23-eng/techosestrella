<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Factura;
use App\Models\GastoContable;
use App\Models\Material;
use App\Models\Obra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReporteController extends Controller
{
    /** 606 — Compras de bienes y servicios (desde gastos_contables con NCF). */
    public function dgii606(Request $request): JsonResponse
    {
        return response()->json([
            'periodo' => $this->periodo($request),
            'registros' => $this->datos606($request),
        ]);
    }

    /** 607 — Ventas de bienes y servicios (desde facturas emitidas). */
    public function dgii607(Request $request): JsonResponse
    {
        return response()->json([
            'periodo' => $this->periodo($request),
            'registros' => $this->datos607($request),
        ]);
    }

    /** TXT del 606 listo para subir a la oficina virtual de la DGII. */
    public function txt606(Request $request): Response
    {
        $registros = $this->datos606($request);
        $periodo = str_replace('-', '', $this->periodo($request)); // YYYYMM
        $rnc = config('app.empresa_rnc', '');

        $lineas = ["606|{$rnc}|{$periodo}|".count($registros)];
        foreach ($registros as $r) {
            $lineas[] = implode('|', [
                $r['rnc_proveedor'], $r['tipo_id'], $r['tipo_comprobante'], $r['ncf'],
                str_replace('-', '', $r['fecha_comprobante']),
                $r['fecha_pago'] ? str_replace('-', '', $r['fecha_pago']) : '',
                number_format($r['monto_servicios'], 2, '.', ''),
                number_format($r['monto_bienes'], 2, '.', ''),
                number_format($r['total_monto'], 2, '.', ''),
                number_format($r['itbis_facturado'], 2, '.', ''),
            ]);
        }

        return $this->descargaTxt(implode("\n", $lineas), "606_{$periodo}.txt");
    }

    /** TXT del 607. */
    public function txt607(Request $request): Response
    {
        $registros = $this->datos607($request);
        $periodo = str_replace('-', '', $this->periodo($request));
        $rnc = config('app.empresa_rnc', '');

        $lineas = ["607|{$rnc}|{$periodo}|".count($registros)];
        foreach ($registros as $r) {
            $lineas[] = implode('|', [
                $r['rnc_ncf'] ?? '', $r['tipo_id'] ?? '', $r['ncf'], $r['ncf_modificado'] ?? '',
                $r['tipo_comprobante'], str_replace('-', '', $r['fecha_comprobante']),
                number_format($r['monto_facturado'], 2, '.', ''),
                number_format($r['itbis_facturado'], 2, '.', ''),
            ]);
        }

        return $this->descargaTxt(implode("\n", $lineas), "607_{$periodo}.txt");
    }

    // --- Reportes operativos (solo dueño) ---

    /** Rentabilidad por obra: ingresos (facturas) - gastos. */
    public function rentabilidad(Request $request): JsonResponse
    {
        $obras = Obra::with(['cliente:id,nombre'])
            ->withSum(['pagos as ingresos' => fn ($q) => $q], 'monto')
            ->get()
            ->map(function ($obra) {
                $facturado = Factura::where('obra_id', $obra->id)->where('anulada', false)->sum('total');
                $gastos = GastoContable::where('obra_id', $obra->id)->sum('monto');

                return [
                    'obra_id' => $obra->id,
                    'codigo' => $obra->codigo,
                    'titulo' => $obra->titulo,
                    'cliente' => $obra->cliente?->nombre,
                    'facturado' => round($facturado, 2),
                    'gastos' => round($gastos, 2),
                    'utilidad' => round($facturado - $gastos, 2),
                ];
            });

        return response()->json($obras);
    }

    /** Resumen de obras por estado. */
    public function resumenObras(): JsonResponse
    {
        return response()->json(
            Obra::query()->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->pluck('total', 'estado')
        );
    }

    /** Materiales bajo el stock mínimo. */
    public function stockBajo(): JsonResponse
    {
        return response()->json(Material::bajoMinimo()->orderBy('nombre')->get());
    }

    /** Asistencia mensual por empleado. */
    public function asistenciaMensual(Request $request): JsonResponse
    {
        $periodo = $this->periodo($request);
        [$ano, $mes] = explode('-', $periodo);

        $datos = Asistencia::query()
            ->whereYear('fecha', $ano)->whereMonth('fecha', $mes)
            ->whereNotNull('hora_entrada')
            ->selectRaw('usuario_id, COUNT(*) as dias_trabajados')
            ->groupBy('usuario_id')
            ->with('usuario:id,nombre')
            ->get()
            ->map(fn ($r) => [
                'usuario_id' => $r->usuario_id,
                'nombre' => $r->usuario?->nombre,
                'dias_trabajados' => $r->dias_trabajados,
            ]);

        return response()->json(['periodo' => $periodo, 'registros' => $datos]);
    }

    // --- helpers ---

    private function periodo(Request $request): string
    {
        return $request->input('periodo', now()->format('Y-m'));
    }

    private function datos606(Request $request): array
    {
        [$ano, $mes] = explode('-', $this->periodo($request));

        return GastoContable::query()
            ->whereNotNull('ncf_proveedor')
            ->whereYear('fecha', $ano)->whereMonth('fecha', $mes)
            ->get()
            ->map(fn ($g) => [
                'rnc_proveedor' => $g->rnc_proveedor,
                'tipo_id' => strlen((string) $g->rnc_proveedor) === 9 ? '1' : '2',
                'ncf' => $g->ncf_proveedor,
                'tipo_comprobante' => $g->comprobante_tipo ?? '02',
                'fecha_comprobante' => $g->fecha->toDateString(),
                'fecha_pago' => $g->fecha->toDateString(),
                'monto_servicios' => 0,
                'monto_bienes' => (float) $g->monto,
                'total_monto' => (float) $g->monto,
                'itbis_facturado' => (float) $g->itbis_pagado,
                'itbis_retenido' => 0,
            ])->all();
    }

    private function datos607(Request $request): array
    {
        [$ano, $mes] = explode('-', $this->periodo($request));

        return Factura::query()
            ->where('anulada', false)
            ->whereYear('fecha_emision', $ano)->whereMonth('fecha_emision', $mes)
            ->get()
            ->map(fn ($f) => [
                'rnc_ncf' => $f->cliente_rnc,
                'tipo_id' => $f->cliente_rnc ? (strlen((string) $f->cliente_rnc) === 9 ? '1' : '2') : null,
                'ncf' => $f->ncf,
                'ncf_modificado' => $f->ncf_modificado,
                'tipo_comprobante' => $f->tipo_comprobante,
                'fecha_comprobante' => $f->fecha_emision->toDateString(),
                'monto_facturado' => (float) $f->base_imponible,
                'itbis_facturado' => (float) $f->itbis,
            ])->all();
    }

    private function descargaTxt(string $contenido, string $nombre): Response
    {
        return response($contenido, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$nombre}\"",
        ]);
    }
}
