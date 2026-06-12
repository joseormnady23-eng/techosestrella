<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ubicacion_conductores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->unsignedSmallInteger('precision_m')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicacion_conductores');
    }
};
