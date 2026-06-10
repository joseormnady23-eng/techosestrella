<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materiales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('categoria', 50); // membrana | sellador | primer | herramienta | otro
            $table->string('unidad', 15);
            $table->decimal('rendimiento', 8, 2)->nullable();
            $table->string('rendimiento_unidad', 20)->nullable();
            $table->decimal('stock_actual', 10, 2)->default(0);
            $table->decimal('stock_minimo', 10, 2)->default(0);
            $table->decimal('costo_promedio', 12, 2)->default(0);
            $table->boolean('es_herramienta')->default(false);
            $table->string('codigo_barras', 50)->nullable()->unique();
            $table->string('tipo_codigo', 10)->default('CODE128');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materiales');
    }
};
