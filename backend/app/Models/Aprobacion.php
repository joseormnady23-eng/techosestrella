<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aprobacion extends Model
{
    protected $table = 'aprobaciones';

    protected $fillable = [
        'cotizacion_id', 'cliente_acceso_id', 'alcance', 'etapa',
        'decision', 'comentario', 'ip', 'decidido_en',
    ];

    protected function casts(): array
    {
        return [
            'etapa' => 'integer',
            'decidido_en' => 'datetime',
        ];
    }

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'cotizacion_id');
    }

    public function acceso(): BelongsTo
    {
        return $this->belongsTo(ClienteAcceso::class, 'cliente_acceso_id');
    }
}
