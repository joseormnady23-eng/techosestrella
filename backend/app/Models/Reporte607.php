<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reporte607 extends Model
{
    protected $table = 'reportes_607';

    protected $fillable = [
        'periodo', 'rnc_ncf', 'tipo_id', 'ncf', 'ncf_modificado', 'tipo_comprobante',
        'fecha_comprobante', 'monto_facturado', 'itbis_facturado', 'itbis_retenido',
        'retencion_renta', 'tipo_pago', 'generado_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha_comprobante' => 'date',
            'monto_facturado' => 'decimal:2',
            'itbis_facturado' => 'decimal:2',
            'itbis_retenido' => 'decimal:2',
            'retencion_renta' => 'decimal:2',
            'generado_en' => 'datetime',
        ];
    }
}
