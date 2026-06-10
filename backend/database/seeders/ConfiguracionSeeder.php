<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::updateOrCreate(
            ['id' => 1],
            [
                'empresa_nombre' => 'Techos Estrella SRL',
                'empresa_rnc' => null,
                'empresa_telefono' => null,
                'empresa_direccion' => 'Santiago de los Caballeros, República Dominicana',
                'empresa_email' => null,
                'itbis_activo' => true,
                'itbis_porcentaje' => 18.00,
                'moneda' => 'DOP',
                'clima_umbral_apto' => 30,
                'clima_umbral_precaucion' => 60,
                'color_primario' => '#1E7FC2',
                'color_acento' => '#E03030',
            ],
        );
    }
}
