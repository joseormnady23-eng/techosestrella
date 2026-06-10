<?php

namespace Database\Seeders;

use App\Models\SecuenciaNcf;
use Illuminate\Database\Seeder;

class SecuenciaNcfSeeder extends Seeder
{
    public function run(): void
    {
        $secuencias = [
            ['tipo_comprobante' => 'B01', 'prefijo' => 'E31', 'secuencia_actual' => 1, 'secuencia_fin' => 500],
            ['tipo_comprobante' => 'B02', 'prefijo' => 'E32', 'secuencia_actual' => 1, 'secuencia_fin' => 500],
            ['tipo_comprobante' => 'B04', 'prefijo' => 'E34', 'secuencia_actual' => 1, 'secuencia_fin' => 100],
        ];

        foreach ($secuencias as $s) {
            SecuenciaNcf::updateOrCreate(
                ['tipo_comprobante' => $s['tipo_comprobante']],
                $s + ['activa' => true],
            );
        }
    }
}
