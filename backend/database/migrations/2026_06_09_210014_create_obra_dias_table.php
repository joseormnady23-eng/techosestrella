<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obra_dias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obra_id')->constrained('obras')->cascadeOnDelete();
            $table->date('fecha');
            $table->string('estado', 18); // programado | trabajado | reprogramado | cancelado_clima | descanso
            $table->foreignId('clima_dia_id')->nullable()->constrained('clima_dias')->nullOnDelete();
            $table->string('nota', 200)->nullable();
            $table->boolean('cuadrilla_incompleta')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('obra_dias');
    }
};
