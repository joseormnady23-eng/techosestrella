<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Cuadrilla;
use App\Models\Material;
use App\Models\Obra;
use App\Models\Usuario;
use App\Models\Vehiculo;
use Illuminate\Database\Seeder;

/**
 * Datos de demostración realistas para ver el sistema con contenido.
 * Ejecutar con: php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // --- Materiales típicos de impermeabilización ---
        $materiales = [
            ['nombre' => 'Membrana asfáltica 4mm', 'categoria' => 'membrana', 'unidad' => 'rollo', 'rendimiento' => 10, 'rendimiento_unidad' => 'm²/rollo', 'stock_actual' => 45, 'stock_minimo' => 15, 'costo_promedio' => 2800],
            ['nombre' => 'Primer asfáltico', 'categoria' => 'primer', 'unidad' => 'galón', 'rendimiento' => 5, 'rendimiento_unidad' => 'm²/galón', 'stock_actual' => 8, 'stock_minimo' => 12, 'costo_promedio' => 950],
            ['nombre' => 'Sellador elastomérico', 'categoria' => 'sellador', 'unidad' => 'galón', 'rendimiento' => 4, 'rendimiento_unidad' => 'm²/galón', 'stock_actual' => 30, 'stock_minimo' => 10, 'costo_promedio' => 1650],
            ['nombre' => 'Pintura impermeabilizante blanca', 'categoria' => 'sellador', 'unidad' => 'cubeta', 'rendimiento' => 18, 'rendimiento_unidad' => 'm²/cubeta', 'stock_actual' => 22, 'stock_minimo' => 8, 'costo_promedio' => 4200],
            ['nombre' => 'Soplete de gas', 'categoria' => 'herramienta', 'unidad' => 'unidad', 'stock_actual' => 5, 'stock_minimo' => 2, 'costo_promedio' => 3500, 'es_herramienta' => true],
        ];
        foreach ($materiales as $m) {
            Material::firstOrCreate(['nombre' => $m['nombre']], $m);
        }

        // --- Clientes ---
        $cli1 = Cliente::firstOrCreate(['nombre' => 'Residencial Villa Olga'], [
            'tipo' => 'empresa', 'telefono' => '8092340011', 'ciudad' => 'Santiago',
            'rnc_cedula' => '131234567', 'direccion' => 'Av. 27 de Febrero #45, Villa Olga',
        ]);
        $cli2 = Cliente::firstOrCreate(['nombre' => 'María Fernández'], [
            'tipo' => 'persona', 'telefono' => '8095670022', 'ciudad' => 'Santiago',
            'rnc_cedula' => '03100123456', 'direccion' => 'Calle Restauración #12',
        ]);

        // --- Cuadrilla con miembros y vehículo ---
        $supervisor = Usuario::where('rol', 'supervisor')->first();
        $aplicador = Usuario::where('rol', 'aplicador')->first();

        $cuadrilla = Cuadrilla::firstOrCreate(['nombre' => 'Cuadrilla Norte'], [
            'jefe_id' => $supervisor?->id, 'activa' => true,
        ]);
        if ($aplicador) {
            $cuadrilla->miembros()->syncWithoutDetaching([$aplicador->id]);
        }
        Vehiculo::firstOrCreate(['placa' => 'L123456'], [
            'cuadrilla_id' => $cuadrilla->id, 'tipo' => 'pickup', 'modelo' => 'Toyota Hilux 2019',
        ]);

        // --- Obra con secciones ---
        $obra = Obra::firstOrCreate(['codigo' => 'OB-0001'], [
            'cliente_id' => $cli1->id,
            'titulo' => 'Impermeabilización techo principal Villa Olga',
            'direccion_obra' => 'Av. 27 de Febrero #45, Villa Olga, Santiago',
            'latitud' => 19.4517, 'longitud' => -70.6970,
            'metros_cuadrados' => 180, 'estado' => 'en_proceso',
            'cuadrilla_id' => $cuadrilla->id, 'supervisor_id' => $supervisor?->id,
            'fecha_inicio_estimada' => now()->toDateString(),
            'fecha_fin_estimada' => now()->addDays(10)->toDateString(),
        ]);
        if ($obra->secciones()->count() === 0) {
            $obra->secciones()->createMany([
                ['nombre' => 'Techo principal', 'metros_cuadrados' => 140, 'condicion' => 'regular', 'factor_desperdicio' => 1.10],
                ['nombre' => 'Marquesina', 'metros_cuadrados' => 40, 'condicion' => 'danado', 'factor_desperdicio' => 1.20],
            ]);
        }

        Obra::firstOrCreate(['codigo' => 'OB-0002'], [
            'cliente_id' => $cli2->id,
            'titulo' => 'Sellado de filtraciones - casa Fernández',
            'direccion_obra' => 'Calle Restauración #12, Santiago',
            'latitud' => 19.4600, 'longitud' => -70.7100,
            'metros_cuadrados' => 65, 'estado' => 'cotizada',
        ]);

        $this->command?->info('DemoSeeder: 5 materiales, 2 clientes, 1 cuadrilla, 2 obras creados.');
    }
}
