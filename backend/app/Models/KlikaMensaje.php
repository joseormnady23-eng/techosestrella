<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KlikaMensaje extends Model
{
    protected $table = 'klika_mensajes';

    protected $fillable = ['conversacion_id', 'rol', 'contenido', 'accion', 'accion_payload'];

    protected function casts(): array
    {
        return ['accion_payload' => 'array'];
    }

    public function conversacion(): BelongsTo
    {
        return $this->belongsTo(KlikaConversacion::class, 'conversacion_id');
    }
}
