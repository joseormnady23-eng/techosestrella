<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Obra;
use App\Services\CotizadorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CotizadorTest extends TestCase
{
    use RefreshDatabase;

    private function svc(): CotizadorService
    {
        return app(CotizadorService::class);
    }

    public function test_formula_calcula_cantidad_correcta(): void
    {
        // ceil((100 × 2 × 1.10) ÷ 5) = ceil(44.0) = 44  (sin inflar por float)
        $item = $this->svc()->calcularItem([
            'descripcion' => 'Membrana',
            'metros_cuadrados' => 100, 'manos' => 2, 'factor_desperdicio' => 1.10,
            'rendimiento_usado' => 5, 'unidad' => 'galón', 'precio_unitario' => 850,
        ]);

        $this->assertSame(44, $item['cantidad']);
        $this->assertSame(37400.0, $item['importe']);
    }

    public function test_item_manual_usa_cantidad_directa(): void
    {
        $item = $this->svc()->calcularItem([
            'descripcion' => 'Mano de obra', 'cantidad' => 1,
            'unidad' => 'servicio', 'precio_unitario' => 15000,
        ]);

        $this->assertEquals(1, $item['cantidad']);
        $this->assertSame(15000.0, $item['importe']);
    }

    public function test_totales_con_descuento_porcentaje_e_itbis(): void
    {
        $items = [
            ['importe' => 37400],
            ['importe' => 15000],
        ];

        $tot = $this->svc()->calcularTotales($items, [
            'descuento_tipo' => 'porcentaje', 'descuento_valor' => 10, 'itbis_activo' => true,
        ]);

        $this->assertSame(52400.0, $tot['subtotal']);
        $this->assertSame(5240.0, $tot['descuento_aplicado']);
        $this->assertSame(47160.0, $tot['base_imponible']);
        $this->assertSame(8488.8, $tot['itbis']);          // 18% de 47160
        $this->assertSame(55648.8, $tot['total']);
    }

    public function test_descuento_monto_fijo_no_excede_subtotal(): void
    {
        $tot = $this->svc()->calcularTotales([['importe' => 1000]], [
            'descuento_tipo' => 'monto', 'descuento_valor' => 5000, 'itbis_activo' => false,
        ]);

        $this->assertSame(1000.0, $tot['descuento_aplicado']); // tope = subtotal
        $this->assertSame(0.0, $tot['base_imponible']);
    }

    public function test_aplicar_congela_factor_y_rendimiento(): void
    {
        $cli = Cliente::create(['nombre' => 'C', 'tipo' => 'persona', 'telefono' => '1']);
        $obra = Obra::create(['cliente_id' => $cli->id, 'codigo' => 'OB-X', 'titulo' => 'T', 'estado' => 'cotizada']);
        $cot = Cotizacion::create(['obra_id' => $obra->id, 'cliente_id' => $cli->id, 'tipo' => 'obra']);

        $this->svc()->aplicar($cot, [
            ['descripcion' => 'Membrana', 'metros_cuadrados' => 100, 'manos' => 2, 'factor_desperdicio' => 1.10, 'rendimiento_usado' => 5, 'unidad' => 'galón', 'precio_unitario' => 850],
        ], []);

        $this->assertDatabaseHas('cotizacion_items', [
            'cotizacion_id' => $cot->id,
            'cantidad' => 44,
            'factor_desperdicio' => 1.10,
            'rendimiento_usado' => 5,
        ]);

        $this->assertEqualsWithDelta(44132.0, (float) $cot->fresh()->total, 0.01); // 37400 + 18%
    }
}
