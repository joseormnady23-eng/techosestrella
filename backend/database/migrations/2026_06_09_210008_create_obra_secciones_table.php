<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obra_secciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obra_id')->constrained('obras')->cascadeOnDelete();
            $table->string('nombre', 100);
            $table->decimal('metros_cuadrados', 8, 2);
            $table->string('condicion', 12); // bueno | regular | danado
            $table->decimal('factor_desperdicio', 4, 2)->default(1.00);
            $table->smallInteger('etapa')->nullable();
            $table->string('notas', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('obra_secciones');
    }
};
