<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleados_info', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->cascadeOnDelete();
            $table->date('fecha_ingreso');
            $table->string('cargo', 100)->nullable();
            $table->decimal('salario', 12, 2)->nullable();
            $table->string('tipo_contrato', 20)->default('indefinido');
            $table->date('fecha_fin_contrato')->nullable();
            $table->smallInteger('dias_vacaciones_base')->default(14);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleados_info');
    }
};
