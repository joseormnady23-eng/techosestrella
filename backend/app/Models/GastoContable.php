<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GastoContable extends Model
{
    protected $table = 'gastos_contables';

    protected $fillable = [
        'categoria', 'descripcion', 'monto', 'itbis_pagado', 'fecha',
        'proveedor', 'rnc_proveedor', 'ncf_proveedor', 'obra_id',
        'comprobante_tipo', 'pagado_con', 'registrado_por', 'adjunto',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'itbis_pagado' => 'decimal:2',
            'fecha' => 'date',
        ];
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }

    public function registrador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'registrado_por');
    }
}
