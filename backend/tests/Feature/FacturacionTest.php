<?php

namespace Tests\Feature;

use App\Models\SecuenciaNcf;
use App\Services\EcfService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacturacionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        SecuenciaNcf::create(['tipo_comprobante' => 'B01', 'prefijo' => 'E31', 'secuencia_actual' => 1, 'secuencia_fin' => 500]);
    }

    public function test_ncf_se_emite_consecutivo_y_con_formato(): void
    {
        $ecf = app(EcfService::class);

        $ncf1 = $ecf->siguienteNcf('B01');
        $ncf2 = $ecf->siguienteNcf('B01');

        $this->assertSame('E310000000001', $ncf1);
        $this->assertSame('E310000000002', $ncf2);
        $this->assertEquals(3, SecuenciaNcf::where('tipo_comprobante', 'B01')->first()->secuencia_actual);
    }

    public function test_secuencia_agotada_lanza_error(): void
    {
        SecuenciaNcf::where('tipo_comprobante', 'B01')->update(['secuencia_actual' => 501, 'secuencia_fin' => 500]);

        $this->expectException(\RuntimeException::class);
        app(EcfService::class)->siguienteNcf('B01');
    }

    public function test_factura_no_requiere_ecf_queda_no_aplica(): void
    {
        $factura = \App\Models\Factura::create([
            'tipo_comprobante' => 'B02', 'ncf' => 'E320000000001', 'requiere_ecf' => false,
            'estado_ecf' => 'pendiente', 'fecha_emision' => now()->toDateString(),
            'subtotal' => 100, 'base_imponible' => 100, 'itbis' => 18, 'total' => 118,
        ]);

        $res = app(EcfService::class)->enviarDgii($factura);

        $this->assertSame('no_aplica', $res['estado_ecf']);
        $this->assertSame('no_aplica', $factura->fresh()->estado_ecf);
    }

    public function test_disponibles_calcula_bien(): void
    {
        $sec = SecuenciaNcf::where('tipo_comprobante', 'B01')->first();
        $this->assertSame(500, $sec->disponibles());
    }
}
