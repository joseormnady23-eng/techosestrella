<?php

use App\Jobs\ActualizarClimaJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Actualiza el clima de las obras activas cada 6 horas (Open-Meteo).
Schedule::job(new ActualizarClimaJob)->everySixHours();
