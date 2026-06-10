<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aprobaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cotizacion_id')->constrained('cotizaciones')->cascadeOnDelete();
            $table->foreignId('cliente_acceso_id')->nullable()->constrained('cliente_accesos')->nullOnDelete();
            $table->string('alcance', 12); // completa | etapa
            $table->smallInteger('etapa')->nullable();
            $table->string('decision', 12); // aprobada | cambios | rechazada
            $table->text('comentario')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('decidido_en');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aprobaciones');
    }
};
