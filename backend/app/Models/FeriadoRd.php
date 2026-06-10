<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeriadoRd extends Model
{
    protected $table = 'feriados_rd';

    protected $fillable = ['fecha', 'nombre', 'tipo', 'ano'];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'ano' => 'integer',
        ];
    }
}
