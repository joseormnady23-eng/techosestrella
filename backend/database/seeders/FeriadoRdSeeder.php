<?php

namespace Database\Seeders;

use App\Models\FeriadoRd;
use Illuminate\Database\Seeder;

class FeriadoRdSeeder extends Seeder
{
    public function run(): void
    {
        // Feriados nacionales de RD. Las fechas movibles (Viernes Santo, Corpus Christi)
        // se calculan a partir de la Pascua; las demás son las fechas canónicas del handoff.
        // Nota: no se aplica la "ley de traslado al lunes" — se usan las fechas base.
        $feriados = [
            2026 => [
                ['2026-01-01', 'Año Nuevo'],
                ['2026-01-06', 'Día de Reyes'],
                ['2026-01-21', 'Nuestra Señora de la Altagracia'],
                ['2026-01-26', 'Día de Duarte'],
                ['2026-02-27', 'Día de la Independencia'],
                ['2026-04-03', 'Viernes Santo'],
                ['2026-05-01', 'Día del Trabajo'],
                ['2026-06-04', 'Corpus Christi'],
                ['2026-08-16', 'Día de la Restauración'],
                ['2026-09-24', 'Nuestra Señora de las Mercedes'],
                ['2026-11-06', 'Día de la Constitución'],
                ['2026-12-25', 'Navidad'],
            ],
            2027 => [
                ['2027-01-01', 'Año Nuevo'],
                ['2027-01-06', 'Día de Reyes'],
                ['2027-01-21', 'Nuestra Señora de la Altagracia'],
                ['2027-01-26', 'Día de Duarte'],
                ['2027-02-27', 'Día de la Independencia'],
                ['2027-03-26', 'Viernes Santo'],
                ['2027-05-01', 'Día del Trabajo'],
                ['2027-05-27', 'Corpus Christi'],
                ['2027-08-16', 'Día de la Restauración'],
                ['2027-09-24', 'Nuestra Señora de las Mercedes'],
                ['2027-11-06', 'Día de la Constitución'],
                ['2027-12-25', 'Navidad'],
            ],
        ];

        foreach ($feriados as $ano => $lista) {
            foreach ($lista as [$fecha, $nombre]) {
                FeriadoRd::updateOrCreate(
                    ['fecha' => $fecha],
                    ['nombre' => $nombre, 'tipo' => 'nacional', 'ano' => $ano],
                );
            }
        }
    }
}
