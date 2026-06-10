<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecuenciaNcf extends Model
{
    protected $table = 'secuencias_ncf';

    protected $fillable = [
        'tipo_comprobante', 'prefijo', 'secuencia_actual', 'secuencia_fin', 'activa',
    ];

    protected function casts(): array
    {
        return [
            'secuencia_actual' => 'integer',
            'secuencia_fin' => 'integer',
            'activa' => 'boolean',
        ];
    }

    public function disponibles(): int
    {
        return max(0, $this->secuencia_fin - $this->secuencia_actual + 1);
    }
}
