<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reporte606 extends Model
{
    protected $table = 'reportes_606';

    protected $fillable = [
        'periodo', 'rnc_proveedor', 'tipo_id', 'ncf', 'tipo_comprobante',
        'fecha_comprobante', 'fecha_pago', 'monto_servicios', 'monto_bienes',
        'total_monto', 'itbis_facturado', 'itbis_retenido', 'generado_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha_comprobante' => 'date',
            'fecha_pago' => 'date',
            'monto_servicios' => 'decimal:2',
            'monto_bienes' => 'decimal:2',
            'total_monto' => 'decimal:2',
            'itbis_facturado' => 'decimal:2',
            'itbis_retenido' => 'decimal:2',
            'generado_en' => 'datetime',
        ];
    }
}
