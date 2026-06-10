<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudCambio extends Model
{
    protected $table = 'solicitudes_cambio';

    protected $fillable = [
        'modelo', 'modelo_id', 'campo', 'valor_actual', 'valor_nuevo', 'motivo',
        'estado', 'solicitado_por', 'revisado_por', 'revisado_en', 'motivo_rechazo',
    ];

    protected function casts(): array
    {
        return ['revisado_en' => 'datetime'];
    }

    public function solicitante(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'solicitado_por');
    }

    public function revisor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'revisado_por');
    }
}
