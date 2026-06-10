<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use SoftDeletes;

    protected $table = 'clientes';

    protected $fillable = [
        'nombre', 'tipo', 'telefono', 'telefono_alt', 'email',
        'direccion', 'ciudad', 'rnc_cedula', 'notas', 'activo',
    ];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }

    public function obras(): HasMany
    {
        return $this->hasMany(Obra::class, 'cliente_id');
    }

    public function accesos(): HasMany
    {
        return $this->hasMany(ClienteAcceso::class, 'cliente_id');
    }
}
