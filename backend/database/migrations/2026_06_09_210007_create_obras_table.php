<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->string('codigo', 20)->unique();
            $table->string('titulo', 150);
            $table->text('direccion_obra')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->string('maps_url', 255)->nullable();
            $table->boolean('ubicacion_visible')->default(false);
            $table->foreignId('ubicacion_habilitada_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('ubicacion_habilitada_en')->nullable();
            $table->decimal('metros_cuadrados', 8, 2)->nullable();
            $table->string('estado', 20)->default('cotizada'); // cotizada | aprobada | en_proceso | pausada | terminada | cancelada
            $table->foreignId('cuadrilla_id')->nullable()->constrained('cuadrillas')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->date('fecha_inicio_estimada')->nullable();
            $table->date('fecha_fin_estimada')->nullable();
            $table->date('fecha_inicio_real')->nullable();
            $table->date('fecha_fin_real')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('obras');
    }
};
