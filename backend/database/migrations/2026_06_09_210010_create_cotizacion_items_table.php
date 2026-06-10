<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cotizacion_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cotizacion_id')->constrained('cotizaciones')->cascadeOnDelete();
            $table->foreignId('obra_seccion_id')->nullable()->constrained('obra_secciones')->nullOnDelete();
            $table->foreignId('material_id')->nullable()->constrained('materiales')->nullOnDelete();
            $table->string('descripcion', 200);
            $table->decimal('metros_cuadrados', 8, 2)->nullable();
            $table->smallInteger('manos')->default(1);
            $table->decimal('factor_desperdicio', 4, 2)->default(1.00); // CONGELADO al aplicar
            $table->decimal('rendimiento_usado', 8, 2)->nullable(); // CONGELADO al aplicar
            $table->decimal('cantidad', 10, 2);
            $table->string('unidad', 15);
            $table->decimal('precio_unitario', 12, 2);
            $table->decimal('importe', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cotizacion_items');
    }
};
