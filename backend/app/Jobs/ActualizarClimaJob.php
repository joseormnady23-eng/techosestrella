<?php

namespace App\Jobs;

use App\Services\ClimaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Actualiza el clima de todas las obras activas. Programado cada 6h en routes/console.php.
 */
class ActualizarClimaJob implements ShouldQueue
{
    use Queueable;

    public function handle(ClimaService $clima): void
    {
        $dias = $clima->actualizarObrasActivas(14);
        Log::info("ActualizarClimaJob: {$dias} días de clima actualizados.");
    }
}
