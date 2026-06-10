<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CotizacionItem extends Model
{
    protected $table = 'cotizacion_items';

    protected $fillable = [
        'cotizacion_id', 'obra_seccion_id', 'material_id', 'descripcion',
        'metros_cuadrados', 'manos', 'factor_desperdicio', 'rendimiento_usado',
        'cantidad', 'unidad', 'precio_unitario', 'importe',
    ];

    protected function casts(): array
    {
        return [
            'metros_cuadrados' => 'decimal:2',
            'manos' => 'integer',
            'factor_desperdicio' => 'decimal:2',
            'rendimiento_usado' => 'decimal:2',
            'cantidad' => 'decimal:2',
            'precio_unitario' => 'decimal:2',
            'importe' => 'decimal:2',
        ];
    }

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'cotizacion_id');
    }

    public function seccion(): BelongsTo
    {
        return $this->belongsTo(ObraSeccion::class, 'obra_seccion_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_id');
    }
}
