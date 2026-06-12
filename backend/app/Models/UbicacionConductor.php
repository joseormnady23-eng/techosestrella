<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UbicacionConductor extends Model
{
    protected $table = 'ubicacion_conductores';

    protected $fillable = [
        'usuario_id', 'vehiculo_id', 'latitud', 'longitud', 'precision_m', 'activo',
    ];

    protected function casts(): array
    {
        return [
            'latitud'     => 'decimal:7',
            'longitud'    => 'decimal:7',
            'precision_m' => 'integer',
            'activo'      => 'boolean',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }
}
