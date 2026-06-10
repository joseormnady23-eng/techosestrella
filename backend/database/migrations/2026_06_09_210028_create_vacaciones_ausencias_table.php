<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vacaciones_ausencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('tipo', 20); // vacaciones | permiso | enfermedad | personal | otro
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->smallInteger('dias_habiles');
            $table->string('motivo', 200)->nullable();
            $table->string('estado', 15)->default('pendiente'); // pendiente | aprobado | rechazado
            $table->timestamp('solicitado_en');
            $table->foreignId('revisado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('revisado_en')->nullable();
            $table->string('motivo_rechazo', 200)->nullable();
            $table->text('nota')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacaciones_ausencias');
    }
};
