<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obra_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obra_id')->constrained('obras')->cascadeOnDelete();
            $table->foreignId('obra_dia_id')->nullable()->constrained('obra_dias')->nullOnDelete();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('ruta', 255);
            $table->string('tipo', 12); // antes | durante | despues | problema | otro
            $table->string('descripcion', 200)->nullable();
            $table->boolean('visible_cliente')->default(false);
            $table->timestamp('tomada_en');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('obra_fotos');
    }
};
