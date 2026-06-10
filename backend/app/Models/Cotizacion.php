<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cotizacion extends Model
{
    protected $table = 'cotizaciones';

    protected $fillable = [
        'obra_id', 'tipo', 'cliente_id', 'cliente_nombre', 'version',
        'subtotal', 'descuento_tipo', 'descuento_valor', 'descuento_aplicado',
        'base_imponible', 'itbis', 'total', 'estado', 'valida_hasta', 'notas',
        'enviada_por', 'enviada_en', 'estado_cliente',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'subtotal' => 'decimal:2',
            'descuento_valor' => 'decimal:2',
            'descuento_aplicado' => 'decimal:2',
            'base_imponible' => 'decimal:2',
            'itbis' => 'decimal:2',
            'total' => 'decimal:2',
            'valida_hasta' => 'date',
            'enviada_en' => 'datetime',
        ];
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CotizacionItem::class, 'cotizacion_id');
    }

    public function aprobaciones(): HasMany
    {
        return $this->hasMany(Aprobacion::class, 'cotizacion_id');
    }
}
