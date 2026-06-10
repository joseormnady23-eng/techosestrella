<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventarioTest extends TestCase
{
    use RefreshDatabase;

    private function dueno(): Usuario
    {
        return Usuario::create([
            'nombre' => 'Dueño', 'telefono' => '8090000009', 'password' => Hash::make('x'),
            'rol' => 'dueno', 'activo' => true,
        ]);
    }

    private function material(float $stock = 10): Material
    {
        return Material::create([
            'nombre' => 'Membrana', 'categoria' => 'membrana', 'unidad' => 'rollo',
            'stock_actual' => $stock, 'stock_minimo' => 5,
        ]);
    }

    public function test_entrada_suma_stock(): void
    {
        Sanctum::actingAs($this->dueno());
        $mat = $this->material(10);

        $this->postJson('/api/movimientos-inventario', [
            'material_id' => $mat->id, 'tipo' => 'entrada', 'cantidad' => 5,
        ])->assertStatus(201);

        $this->assertEquals(15, $mat->fresh()->stock_actual);
    }

    public function test_salida_resta_stock(): void
    {
        Sanctum::actingAs($this->dueno());
        $mat = $this->material(10);

        $this->postJson('/api/movimientos-inventario', [
            'material_id' => $mat->id, 'tipo' => 'salida', 'cantidad' => 3,
        ])->assertStatus(201);

        $this->assertEquals(7, $mat->fresh()->stock_actual);
    }

    public function test_ajuste_fija_stock(): void
    {
        Sanctum::actingAs($this->dueno());
        $mat = $this->material(10);

        $this->postJson('/api/movimientos-inventario', [
            'material_id' => $mat->id, 'tipo' => 'ajuste', 'cantidad' => 25,
        ])->assertStatus(201);

        $this->assertEquals(25, $mat->fresh()->stock_actual);
    }

    public function test_scope_bajo_minimo_filtra(): void
    {
        $this->material(3);  // bajo (3 <= 5)
        $this->material(10); // ok

        $this->assertEquals(1, Material::bajoMinimo()->count());
    }

    public function test_generar_codigo_es_unico_y_se_busca(): void
    {
        Sanctum::actingAs($this->dueno());
        $mat = $this->material(10);

        $res = $this->postJson("/api/materiales/{$mat->id}/generar-codigo")->assertOk();
        $codigo = $res->json('codigo_barras');
        $this->assertNotEmpty($codigo);

        $this->getJson("/api/materiales/buscar-codigo/{$codigo}")
            ->assertOk()
            ->assertJsonPath('id', $mat->id);
    }
}
