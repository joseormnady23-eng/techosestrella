<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VacacionAusencia extends Model
{
    protected $table = 'vacaciones_ausencias';

    protected $fillable = [
        'usuario_id', 'tipo', 'fecha_inicio', 'fecha_fin', 'dias_habiles',
        'motivo', 'estado', 'solicitado_en', 'revisado_por', 'revisado_en',
        'motivo_rechazo', 'nota',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'dias_habiles' => 'integer',
            'solicitado_en' => 'datetime',
            'revisado_en' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function revisor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'revisado_por');
    }
}
