<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clima_dias', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->smallInteger('prob_lluvia'); // 0-100
            $table->decimal('precipitacion_mm', 6, 2)->nullable();
            $table->string('estado', 12); // apto | precaucion | bloqueado
            $table->timestamp('actualizado_en');
            $table->timestamps();
            $table->unique(['fecha', 'latitud', 'longitud']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clima_dias');
    }
};
