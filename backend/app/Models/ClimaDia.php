<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClimaDia extends Model
{
    protected $table = 'clima_dias';

    protected $fillable = [
        'fecha', 'latitud', 'longitud', 'prob_lluvia',
        'precipitacion_mm', 'estado', 'actualizado_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'prob_lluvia' => 'integer',
            'precipitacion_mm' => 'decimal:2',
            'actualizado_en' => 'datetime',
        ];
    }
}
