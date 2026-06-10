<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClienteAcceso extends Model
{
    protected $table = 'cliente_accesos';

    protected $fillable = [
        'cliente_id', 'obra_id', 'token', 'canal', 'expira_en', 'ultimo_acceso', 'revocado',
    ];

    protected function casts(): array
    {
        return [
            'expira_en' => 'datetime',
            'ultimo_acceso' => 'datetime',
            'revocado' => 'boolean',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class, 'obra_id');
    }

    public function vigente(): bool
    {
        return ! $this->revocado && $this->expira_en->isFuture();
    }
}
