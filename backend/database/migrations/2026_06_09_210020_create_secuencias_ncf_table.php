<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secuencias_ncf', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_comprobante', 3); // B01 | B02 | B03 | B04 | B13 | B14
            $table->string('prefijo', 11);
            $table->unsignedBigInteger('secuencia_actual')->default(1);
            $table->unsignedBigInteger('secuencia_fin');
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secuencias_ncf');
    }
};
