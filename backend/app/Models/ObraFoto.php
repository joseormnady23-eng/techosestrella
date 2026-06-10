<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ObraFoto extends Model
{
    protected $table = 'obra_fotos';

    protected $fillable = [
        'obra_id', 'obra_dia_id', 'usuario_id', 'ruta', 'tipo',
        'descripcion', 'visible_cliente', 'tomada_en',
    ];

    protected function casts(): array
    {
        return [
            'visible_cliente' => 'boolean',
            'tomada_en' => 'datetime',
        ];
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }

    public function dia(): BelongsTo
    {
        return $this->belongsTo(ObraDia::class, 'obra_dia_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
