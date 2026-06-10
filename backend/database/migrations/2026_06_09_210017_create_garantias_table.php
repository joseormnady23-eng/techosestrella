<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('garantias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obra_id')->constrained('obras')->cascadeOnDelete();
            $table->string('numero_garantia', 20)->unique();
            $table->smallInteger('anios_cobertura');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->text('cobertura')->nullable();
            $table->text('condiciones')->nullable();
            $table->string('material_referencia', 150)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('garantias');
    }
};
