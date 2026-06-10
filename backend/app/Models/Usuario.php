<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'telefono',
        'email',
        'password',
        'rol',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    // --- Helpers de rol ---
    public function esDueno(): bool { return $this->rol === 'dueno'; }
    public function esSecretaria(): bool { return $this->rol === 'secretaria'; }
    public function esSupervisor(): bool { return $this->rol === 'supervisor'; }
    public function esAplicador(): bool { return $this->rol === 'aplicador'; }
    public function tieneRol(string ...$roles): bool { return in_array($this->rol, $roles, true); }

    // --- Relaciones ---
    public function cuadrillasLideradas(): HasMany
    {
        return $this->hasMany(Cuadrilla::class, 'jefe_id');
    }

    public function cuadrillas(): BelongsToMany
    {
        return $this->belongsToMany(Cuadrilla::class, 'cuadrilla_miembros', 'usuario_id', 'cuadrilla_id')->withTimestamps();
    }

    public function obrasSupervisadas(): HasMany
    {
        return $this->hasMany(Obra::class, 'supervisor_id');
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class, 'usuario_id');
    }

    public function ausencias(): HasMany
    {
        return $this->hasMany(VacacionAusencia::class, 'usuario_id');
    }

    public function empleadoInfo(): HasOne
    {
        return $this->hasOne(EmpleadoInfo::class, 'usuario_id');
    }

    public function conversaciones(): HasMany
    {
        return $this->hasMany(KlikaConversacion::class, 'usuario_id');
    }
}
