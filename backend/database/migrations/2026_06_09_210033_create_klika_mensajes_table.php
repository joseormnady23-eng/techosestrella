<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('klika_mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('klika_conversaciones')->cascadeOnDelete();
            $table->string('rol', 12); // user | assistant | tool
            $table->text('contenido');
            $table->string('accion', 50)->nullable();
            $table->json('accion_payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('klika_mensajes');
    }
};
