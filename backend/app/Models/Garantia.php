<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Garantia extends Model
{
    protected $table = 'garantias';

    protected $fillable = [
        'obra_id', 'numero_garantia', 'anios_cobertura', 'fecha_inicio',
        'fecha_fin', 'cobertura', 'condiciones', 'material_referencia',
    ];

    protected function casts(): array
    {
        return [
            'anios_cobertura' => 'integer',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }
}
