<?php

namespace Tests\Feature;

use App\Models\EmpleadoInfo;
use App\Models\FeriadoRd;
use App\Models\Usuario;
use App\Services\VacacionesService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VacacionesTest extends TestCase
{
    use RefreshDatabase;

    private function svc(): VacacionesService
    {
        return app(VacacionesService::class);
    }

    public function test_dias_habiles_excluye_fin_de_semana(): void
    {
        // Lunes 1 jun 2026 a domingo 7 jun 2026 → 5 días hábiles (lun-vie).
        $dias = $this->svc()->diasHabiles(Carbon::parse('2026-06-01'), Carbon::parse('2026-06-07'));
        $this->assertSame(5, $dias);
    }

    public function test_dias_habiles_excluye_feriados(): void
    {
        // 1 de mayo 2026 (viernes) es feriado → semana lun 27 abr a vie 1 may = 4 hábiles.
        FeriadoRd::create(['fecha' => '2026-05-01', 'nombre' => 'Día del Trabajo', 'tipo' => 'nacional', 'ano' => 2026]);

        $dias = $this->svc()->diasHabiles(Carbon::parse('2026-04-27'), Carbon::parse('2026-05-01'));
        $this->assertSame(4, $dias);
    }

    public function test_dias_derecho_segun_antiguedad(): void
    {
        $u = Usuario::create(['nombre' => 'E', 'telefono' => '8090000010', 'password' => Hash::make('x'), 'rol' => 'aplicador', 'activo' => true]);

        // Sin info de empleado → 0.
        $this->assertSame(0, $this->svc()->diasDerecho($u));

        // 2 años de antigüedad → 14 (base).
        $info = EmpleadoInfo::create(['usuario_id' => $u->id, 'fecha_ingreso' => Carbon::today()->subYears(2), 'dias_vacaciones_base' => 14]);
        $this->assertSame(14, $this->svc()->diasDerecho($u->fresh()));

        // 6 años → 18.
        $info->update(['fecha_ingreso' => Carbon::today()->subYears(6)]);
        $this->assertSame(18, $this->svc()->diasDerecho($u->fresh()));
    }

    public function test_menos_de_un_anio_no_tiene_derecho(): void
    {
        $u = Usuario::create(['nombre' => 'E', 'telefono' => '8090000011', 'password' => Hash::make('x'), 'rol' => 'aplicador', 'activo' => true]);
        EmpleadoInfo::create(['usuario_id' => $u->id, 'fecha_ingreso' => Carbon::today()->subMonths(6), 'dias_vacaciones_base' => 14]);

        $this->assertSame(0, $this->svc()->diasDerecho($u->fresh()));
    }
}
