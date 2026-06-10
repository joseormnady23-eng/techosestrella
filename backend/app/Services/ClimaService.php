<?php

namespace App\Services;

use App\Models\ClimaDia;
use App\Models\Configuracion;
use App\Models\Obra;
use App\Models\VacacionAusencia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

/**
 * Consulta el pronóstico de Open-Meteo (gratis, sin key) y lo guarda en clima_dias.
 * Clasifica cada día como apto / precaucion / bloqueado según los umbrales de configuración.
 */
class ClimaService
{
    public function estadoPorProbabilidad(int $probLluvia): string
    {
        $config = Configuracion::actual();

        if ($probLluvia < $config->clima_umbral_apto) {
            return 'apto';
        }

        if ($probLluvia <= $config->clima_umbral_precaucion) {
            return 'precaucion';
        }

        return 'bloqueado';
    }

    /**
     * Actualiza el clima de los próximos N días para una coordenada.
     *
     * @return int cantidad de días actualizados
     */
    public function actualizarParaCoordenada(float $latitud, float $longitud, int $dias = 14): int
    {
        $url = config('services.open_meteo.url', env('OPEN_METEO_URL', 'https://api.open-meteo.com/v1/forecast'));

        $resp = Http::timeout(20)->get($url, [
            'latitude' => $latitud,
            'longitude' => $longitud,
            'daily' => 'precipitation_probability_max,precipitation_sum',
            'timezone' => 'America/Santo_Domingo',
            'forecast_days' => $dias,
        ]);

        if (! $resp->ok()) {
            return 0;
        }

        $daily = $resp->json('daily', []);
        $fechas = $daily['time'] ?? [];
        $probs = $daily['precipitation_probability_max'] ?? [];
        $precs = $daily['precipitation_sum'] ?? [];

        $count = 0;
        foreach ($fechas as $i => $fecha) {
            $prob = (int) ($probs[$i] ?? 0);

            ClimaDia::updateOrCreate(
                ['fecha' => $fecha, 'latitud' => $latitud, 'longitud' => $longitud],
                [
                    'prob_lluvia' => $prob,
                    'precipitacion_mm' => $precs[$i] ?? null,
                    'estado' => $this->estadoPorProbabilidad($prob),
                    'actualizado_en' => Carbon::now(),
                ],
            );
            $count++;
        }

        return $count;
    }

    /**
     * Actualiza el clima de todas las obras activas con coordenadas.
     * Marca cuadrilla_incompleta en obra_dias si hay ausencias aprobadas ese día.
     */
    public function actualizarObrasActivas(int $dias = 14): int
    {
        $obras = Obra::query()
            ->whereIn('estado', ['aprobada', 'en_proceso', 'pausada'])
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->get();

        // Evita repetir la misma coordenada.
        $coords = [];
        $total = 0;
        foreach ($obras as $obra) {
            $key = $obra->latitud.','.$obra->longitud;
            if (isset($coords[$key])) {
                continue;
            }
            $coords[$key] = true;
            $total += $this->actualizarParaCoordenada((float) $obra->latitud, (float) $obra->longitud, $dias);
        }

        $this->marcarCuadrillasIncompletas();

        return $total;
    }

    /**
     * Para cada obra_dia futuro, marca cuadrilla_incompleta si algún miembro de la
     * cuadrilla tiene una ausencia aprobada que cubre esa fecha.
     */
    protected function marcarCuadrillasIncompletas(): void
    {
        $obras = Obra::with(['dias' => fn ($q) => $q->where('fecha', '>=', Carbon::today()), 'cuadrilla.miembros'])
            ->whereNotNull('cuadrilla_id')
            ->get();

        foreach ($obras as $obra) {
            $miembros = $obra->cuadrilla?->miembros->pluck('id') ?? collect();
            if ($miembros->isEmpty()) {
                continue;
            }

            foreach ($obra->dias as $dia) {
                $hayAusencia = VacacionAusencia::query()
                    ->whereIn('usuario_id', $miembros)
                    ->where('estado', 'aprobado')
                    ->whereDate('fecha_inicio', '<=', $dia->fecha)
                    ->whereDate('fecha_fin', '>=', $dia->fecha)
                    ->exists();

                if ($dia->cuadrilla_incompleta !== $hayAusencia) {
                    $dia->update(['cuadrilla_incompleta' => $hayAusencia]);
                }
            }
        }
    }
}
