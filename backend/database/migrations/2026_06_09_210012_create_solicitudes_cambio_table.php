<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_cambio', function (Blueprint $table) {
            $table->id();
            $table->string('modelo', 50); // 'Material', etc.
            $table->unsignedBigInteger('modelo_id');
            $table->string('campo', 50);
            $table->text('valor_actual')->nullable();
            $table->text('valor_nuevo')->nullable();
            $table->string('motivo', 200)->nullable();
            $table->string('estado', 15)->default('pendiente'); // pendiente | aprobado | rechazado
            $table->foreignId('solicitado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('revisado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('revisado_en')->nullable();
            $table->string('motivo_rechazo', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_cambio');
    }
};
