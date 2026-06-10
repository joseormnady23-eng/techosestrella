<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cuadrilla_id')->nullable()->constrained('cuadrillas')->nullOnDelete();
            $table->string('placa', 15)->unique();
            $table->string('tipo', 20); // camion | pickup | furgoneta | otro
            $table->string('modelo', 100)->nullable();
            $table->string('descripcion', 200)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
