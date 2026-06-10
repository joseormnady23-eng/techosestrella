<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ObraDia extends Model
{
    protected $table = 'obra_dias';

    protected $fillable = [
        'obra_id', 'fecha', 'estado', 'clima_dia_id', 'nota', 'cuadrilla_incompleta',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'cuadrilla_incompleta' => 'boolean',
        ];
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }

    public function clima(): BelongsTo
    {
        return $this->belongsTo(ClimaDia::class, 'clima_dia_id');
    }
}
