<?php

namespace App\Services;

use App\Models\Configuracion;
use App\Models\Cotizacion;
use App\Models\Material;
use Illuminate\Support\Facades\DB;

/**
 * Motor de cálculo de cotizaciones.
 *
 * Fórmula por ítem calculado desde sección + material:
 *   cantidad = ceil( (m² × manos × factor_desperdicio) ÷ rendimiento )
 *
 * Al APLICAR, el factor y el rendimiento se CONGELAN en cotizacion_items
 * para que cambios futuros en el material no alteren cotizaciones pasadas.
 */
class CotizadorService
{
    /**
     * Calcula un ítem individual y devuelve el desglose (sin guardar).
     *
     * @param  array  $item  [descripcion, metros_cuadrados, manos, factor_desperdicio,
     *                         rendimiento_usado, material_id?, cantidad?, unidad, precio_unitario]
     */
    public function calcularItem(array $item): array
    {
        $manos = max(1, (int) ($item['manos'] ?? 1));
        $factor = (float) ($item['factor_desperdicio'] ?? 1.0);
        $m2 = isset($item['metros_cuadrados']) ? (float) $item['metros_cuadrados'] : null;
        $rendimiento = isset($item['rendimiento_usado']) ? (float) $item['rendimiento_usado'] : null;
        $precio = (float) ($item['precio_unitario'] ?? 0);

        // Ítem calculado (sección + material con rendimiento) vs. ítem manual (cantidad directa).
        $esCalculado = $m2 !== null && $rendimiento !== null && $rendimiento > 0;

        if ($esCalculado) {
            // Redondear el bruto antes del ceil evita que el ruido de punto flotante
            // (p. ej. 100×2×1.10 = 220.00000000000003) inflate la cantidad en 1.
            $bruto = round(($m2 * $manos * $factor) / $rendimiento, 4);
            $cantidad = (int) ceil($bruto);
        } else {
            $cantidad = (float) ($item['cantidad'] ?? 0);
        }

        $importe = round($cantidad * $precio, 2);

        return [
            'descripcion' => $item['descripcion'] ?? '',
            'obra_seccion_id' => $item['obra_seccion_id'] ?? null,
            'material_id' => $item['material_id'] ?? null,
            'metros_cuadrados' => $m2,
            'manos' => $manos,
            'factor_desperdicio' => round($factor, 2),
            'rendimiento_usado' => $rendimiento,
            'cantidad' => $cantidad,
            'unidad' => $item['unidad'] ?? 'und',
            'precio_unitario' => round($precio, 2),
            'importe' => $importe,
            'formula' => $esCalculado
                ? sprintf('ceil((%.2f m² × %d manos × %.2f factor) ÷ %.2f rend.) = %d', $m2, $manos, $factor, $rendimiento, $cantidad)
                : 'ítem manual',
        ];
    }

    /**
     * Calcula los totales de una cotización (sin guardar): subtotal, descuento,
     * base imponible, ITBIS y total.
     *
     * @param  array  $items  ítems ya calculados (con 'importe')
     * @param  array  $opts  [descuento_tipo, descuento_valor, itbis_activo?]
     */
    public function calcularTotales(array $items, array $opts = []): array
    {
        $config = Configuracion::actual();

        $subtotal = round(array_sum(array_column($items, 'importe')), 2);

        $descuentoTipo = $opts['descuento_tipo'] ?? 'ninguno';
        $descuentoValor = (float) ($opts['descuento_valor'] ?? 0);

        $descuentoAplicado = match ($descuentoTipo) {
            'porcentaje' => round($subtotal * ($descuentoValor / 100), 2),
            'monto' => round(min($descuentoValor, $subtotal), 2),
            default => 0.0,
        };

        $baseImponible = round($subtotal - $descuentoAplicado, 2);

        $itbisActivo = $opts['itbis_activo'] ?? $config->itbis_activo;
        $itbis = $itbisActivo
            ? round($baseImponible * ((float) $config->itbis_porcentaje / 100), 2)
            : 0.0;

        $total = round($baseImponible + $itbis, 2);

        return [
            'subtotal' => $subtotal,
            'descuento_tipo' => $descuentoTipo,
            'descuento_valor' => $descuentoValor,
            'descuento_aplicado' => $descuentoAplicado,
            'base_imponible' => $baseImponible,
            'itbis_porcentaje' => (float) $config->itbis_porcentaje,
            'itbis' => $itbis,
            'total' => $total,
        ];
    }

    /**
     * Calcula una cotización completa (ítems + totales) sin persistir. Vista previa.
     */
    public function preview(array $items, array $opts = []): array
    {
        $calculados = array_map(fn ($i) => $this->calcularItem($i), $items);
        $totales = $this->calcularTotales($calculados, $opts);

        return ['items' => $calculados, 'totales' => $totales];
    }

    /**
     * Aplica (persiste) la cotización: recalcula, congela factor/rendimiento en los
     * ítems y guarda los totales. Todo en una transacción.
     */
    public function aplicar(Cotizacion $cotizacion, array $items, array $opts = []): Cotizacion
    {
        return DB::transaction(function () use ($cotizacion, $items, $opts) {
            $calculados = array_map(fn ($i) => $this->calcularItem($i), $items);
            $totales = $this->calcularTotales($calculados, $opts);

            // Reemplaza los ítems existentes por los nuevos (congelados).
            $cotizacion->items()->delete();
            foreach ($calculados as $item) {
                $cotizacion->items()->create([
                    'obra_seccion_id' => $item['obra_seccion_id'],
                    'material_id' => $item['material_id'],
                    'descripcion' => $item['descripcion'],
                    'metros_cuadrados' => $item['metros_cuadrados'],
                    'manos' => $item['manos'],
                    'factor_desperdicio' => $item['factor_desperdicio'],   // CONGELADO
                    'rendimiento_usado' => $item['rendimiento_usado'],     // CONGELADO
                    'cantidad' => $item['cantidad'],
                    'unidad' => $item['unidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'importe' => $item['importe'],
                ]);
            }

            $cotizacion->update([
                'subtotal' => $totales['subtotal'],
                'descuento_tipo' => $totales['descuento_tipo'],
                'descuento_valor' => $totales['descuento_valor'],
                'descuento_aplicado' => $totales['descuento_aplicado'],
                'base_imponible' => $totales['base_imponible'],
                'itbis' => $totales['itbis'],
                'total' => $totales['total'],
            ]);

            return $cotizacion->fresh('items');
        });
    }

    /**
     * Sugiere el rendimiento de un material (para prellenar el motor desde la obra).
     */
    public function rendimientoDe(int $materialId): ?float
    {
        return Material::find($materialId)?->rendimiento !== null
            ? (float) Material::find($materialId)->rendimiento
            : null;
    }
}
