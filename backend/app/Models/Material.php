<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use SoftDeletes;

    protected $table = 'materiales';

    protected $fillable = [
        'nombre', 'categoria', 'unidad', 'rendimiento', 'rendimiento_unidad',
        'stock_actual', 'stock_minimo', 'costo_promedio', 'es_herramienta',
        'codigo_barras', 'tipo_codigo',
    ];

    protected function casts(): array
    {
        return [
            'rendimiento' => 'decimal:2',
            'stock_actual' => 'decimal:2',
            'stock_minimo' => 'decimal:2',
            'costo_promedio' => 'decimal:2',
            'es_herramienta' => 'boolean',
        ];
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class, 'material_id');
    }

    public function estaBajoMinimo(): bool
    {
        return $this->stock_actual <= $this->stock_minimo;
    }

    public function scopeBajoMinimo($query)
    {
        return $query->whereColumn('stock_actual', '<=', 'stock_minimo');
    }
}
