<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Factura extends Model
{
    protected $table = 'facturas';

    protected $fillable = [
        'cotizacion_id', 'obra_id', 'cliente_id', 'cliente_nombre', 'cliente_rnc',
        'tipo_comprobante', 'ncf', 'ncf_modificado', 'requiere_ecf', 'estado_ecf',
        'codigo_aprobacion', 'motivo_rechazo', 'xml_firmado', 'fecha_emision',
        'subtotal', 'descuento', 'base_imponible', 'itbis', 'total',
        'pagada', 'anulada', 'emitida_por', 'notas',
    ];

    protected function casts(): array
    {
        return [
            'requiere_ecf' => 'boolean',
            'fecha_emision' => 'date',
            'subtotal' => 'decimal:2',
            'descuento' => 'decimal:2',
            'base_imponible' => 'decimal:2',
            'itbis' => 'decimal:2',
            'total' => 'decimal:2',
            'pagada' => 'boolean',
            'anulada' => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(FacturaItem::class, 'factura_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(PagoFactura::class, 'factura_id');
    }

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'cotizacion_id');
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function emisor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'emitida_por');
    }
}
