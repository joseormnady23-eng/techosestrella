<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ObraSeccion extends Model
{
    protected $table = 'obra_secciones';

    protected $fillable = [
        'obra_id', 'nombre', 'metros_cuadrados', 'condicion',
        'factor_desperdicio', 'etapa', 'notas',
    ];

    protected function casts(): array
    {
        return [
            'metros_cuadrados' => 'decimal:2',
            'factor_desperdicio' => 'decimal:2',
            'etapa' => 'integer',
        ];
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }
}
