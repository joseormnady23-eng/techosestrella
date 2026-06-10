<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpleadoInfo extends Model
{
    protected $table = 'empleados_info';

    protected $fillable = [
        'usuario_id', 'fecha_ingreso', 'cargo', 'salario', 'tipo_contrato',
        'fecha_fin_contrato', 'dias_vacaciones_base', 'activo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_ingreso' => 'date',
            'salario' => 'decimal:2',
            'fecha_fin_contrato' => 'date',
            'dias_vacaciones_base' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
