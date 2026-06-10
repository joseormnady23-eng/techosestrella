<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KlikaConversacion extends Model
{
    protected $table = 'klika_conversaciones';

    protected $fillable = ['usuario_id', 'titulo'];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(KlikaMensaje::class, 'conversacion_id');
    }
}
