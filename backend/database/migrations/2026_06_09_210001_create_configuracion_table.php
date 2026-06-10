<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_nombre', 150)->default('Techos Estrella SRL');
            $table->string('empresa_rnc', 20)->nullable();
            $table->string('empresa_telefono', 20)->nullable();
            $table->text('empresa_direccion')->nullable();
            $table->string('empresa_email', 150)->nullable();
            $table->string('empresa_logo', 255)->nullable();
            $table->boolean('itbis_activo')->default(true);
            $table->decimal('itbis_porcentaje', 5, 2)->default(18.00);
            $table->string('moneda', 10)->default('DOP');
            $table->smallInteger('clima_umbral_apto')->default(30);
            $table->smallInteger('clima_umbral_precaucion')->default(60);
            $table->text('pdf_pie_pagina')->nullable();
            $table->text('garantia_condiciones_default')->nullable();
            $table->string('klika_logo', 255)->nullable();
            $table->string('color_primario', 7)->default('#1E7FC2');
            $table->string('color_acento', 7)->default('#E03030');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion');
    }
};
