<?php

namespace App\Services;

use App\Models\FeriadoRd;
use App\Models\ObraDia;
use App\Models\Usuario;
use App\Models\VacacionAusencia;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

/**
 * Reglas de vacaciones según el Art. 177 del Código de Trabajo de RD:
 *   - 14 días laborables tras 1 año de servicio.
 *   - 18 días laborables a partir del 5.º año (el handoff lo simplifica a "año 2+").
 * Los días laborables excluyen fines de semana y feriados nacionales (feriados_rd).
 */
class VacacionesService
{
    /**
     * Días de vacaciones a los que tiene derecho el empleado según su antigüedad.
     */
    public function diasDerecho(Usuario $usuario): int
    {
        $info = $usuario->empleadoInfo;
        if (! $info || ! $info->fecha_ingreso) {
            return 0;
        }

        $anios = $info->fecha_ingreso->diffInYears(Carbon::today());

        if ($anios < 1) {
            return 0;
        }

        // >= 5 años → 18; entre 1 y 5 → base (default 14).
        return $anios >= 5 ? 18 : (int) ($info->dias_vacaciones_base ?? 14);
    }

    /**
     * Días ya tomados (aprobados) en el año calendario dado.
     */
    public function diasTomados(Usuario $usuario, ?int $anio = null): int
    {
        $anio ??= (int) Carbon::today()->year;

        return (int) VacacionAusencia::query()
            ->where('usuario_id', $usuario->id)
            ->where('tipo', 'vacaciones')
            ->where('estado', 'aprobado')
            ->whereYear('fecha_inicio', $anio)
            ->sum('dias_habiles');
    }

    /**
     * Resumen: derecho / tomados / disponibles.
     */
    public function resumen(Usuario $usuario, ?int $anio = null): array
    {
        $derecho = $this->diasDerecho($usuario);
        $tomados = $this->diasTomados($usuario, $anio);

        return [
            'dias_derecho' => $derecho,
            'dias_tomados' => $tomados,
            'dias_disponibles' => max(0, $derecho - $tomados),
        ];
    }

    /**
     * Cuenta los días laborables entre dos fechas (inclusive), excluyendo
     * fines de semana y feriados nacionales.
     */
    public function diasHabiles(Carbon $inicio, Carbon $fin): int
    {
        $feriados = FeriadoRd::query()
            ->whereDate('fecha', '>=', $inicio->toDateString())
            ->whereDate('fecha', '<=', $fin->toDateString())
            ->pluck('fecha')
            ->map(fn ($f) => Carbon::parse($f)->toDateString())
            ->flip();

        $dias = 0;
        foreach (CarbonPeriod::create($inicio, $fin) as $dia) {
            if ($dia->isWeekend()) {
                continue;
            }
            if ($feriados->has($dia->toDateString())) {
                continue;
            }
            $dias++;
        }

        return $dias;
    }

    /**
     * Verifica conflictos con obras: ¿la cuadrilla del empleado tiene días
     * programados que se cruzan con el rango solicitado?
     *
     * @return array lista de conflictos [{obra_id, codigo, titulo, fecha}]
     */
    public function conflictosConObras(Usuario $usuario, Carbon $inicio, Carbon $fin): array
    {
        $cuadrillaIds = $usuario->cuadrillas()->pluck('cuadrillas.id');
        if ($cuadrillaIds->isEmpty()) {
            return [];
        }

        return ObraDia::query()
            ->whereHas('obra', fn ($q) => $q->whereIn('cuadrilla_id', $cuadrillaIds))
            ->whereIn('estado', ['programado', 'reprogramado'])
            ->whereBetween('fecha', [$inicio->toDateString(), $fin->toDateString()])
            ->with('obra:id,codigo,titulo')
            ->get()
            ->map(fn ($d) => [
                'obra_id' => $d->obra_id,
                'codigo' => $d->obra?->codigo,
                'titulo' => $d->obra?->titulo,
                'fecha' => $d->fecha->toDateString(),
            ])
            ->all();
    }
}
