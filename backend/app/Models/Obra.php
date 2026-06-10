<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Obra extends Model
{
    use SoftDeletes;

    protected $table = 'obras';

    protected $fillable = [
        'cliente_id', 'codigo', 'titulo', 'direccion_obra', 'latitud', 'longitud',
        'maps_url', 'ubicacion_visible', 'ubicacion_habilitada_por', 'ubicacion_habilitada_en',
        'metros_cuadrados', 'estado', 'cuadrilla_id', 'supervisor_id',
        'fecha_inicio_estimada', 'fecha_fin_estimada', 'fecha_inicio_real', 'fecha_fin_real',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'ubicacion_visible' => 'boolean',
            'ubicacion_habilitada_en' => 'datetime',
            'metros_cuadrados' => 'decimal:2',
            'fecha_inicio_estimada' => 'date',
            'fecha_fin_estimada' => 'date',
            'fecha_inicio_real' => 'date',
            'fecha_fin_real' => 'date',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function cuadrilla(): BelongsTo
    {
        return $this->belongsTo(Cuadrilla::class, 'cuadrilla_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'supervisor_id');
    }

    public function ubicacionHabilitadaPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ubicacion_habilitada_por');
    }

    public function secciones(): HasMany
    {
        return $this->hasMany(ObraSeccion::class, 'obra_id');
    }

    public function cotizaciones(): HasMany
    {
        return $this->hasMany(Cotizacion::class, 'obra_id');
    }

    public function dias(): HasMany
    {
        return $this->hasMany(ObraDia::class, 'obra_id');
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class, 'obra_id');
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(ObraFoto::class, 'obra_id');
    }

    public function garantia(): HasOne
    {
        return $this->hasOne(Garantia::class, 'obra_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'obra_id');
    }
}
