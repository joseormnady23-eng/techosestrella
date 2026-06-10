<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cuadrilla extends Model
{
    protected $table = 'cuadrillas';

    protected $fillable = ['nombre', 'jefe_id', 'activa'];

    protected function casts(): array
    {
        return ['activa' => 'boolean'];
    }

    public function jefe(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'jefe_id');
    }

    public function miembros(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'cuadrilla_miembros', 'cuadrilla_id', 'usuario_id')->withTimestamps();
    }

    public function obras(): HasMany
    {
        return $this->hasMany(Obra::class, 'cuadrilla_id');
    }

    public function vehiculo(): HasOne
    {
        return $this->hasOne(Vehiculo::class, 'cuadrilla_id');
    }
}
