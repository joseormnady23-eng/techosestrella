<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'itbis_activo' => 'boolean',
            'itbis_porcentaje' => 'decimal:2',
            'clima_umbral_apto' => 'integer',
            'clima_umbral_precaucion' => 'integer',
        ];
    }

    /** Devuelve (o crea) la fila singleton de configuración con defaults explícitos. */
    public static function actual(): self
    {
        return static::query()->firstOrCreate(['id' => 1], [
            'empresa_nombre' => 'Techos Estrella SRL',
            'itbis_activo' => true,
            'itbis_porcentaje' => 18.00,
            'moneda' => 'DOP',
            'clima_umbral_apto' => 30,
            'clima_umbral_precaucion' => 60,
            'color_primario' => '#1E7FC2',
            'color_acento' => '#E03030',
        ]);
    }
}
