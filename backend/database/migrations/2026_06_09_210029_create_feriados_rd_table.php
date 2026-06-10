<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feriados_rd', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->unique();
            $table->string('nombre', 100);
            $table->string('tipo', 20)->default('nacional');
            $table->smallInteger('ano');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feriados_rd');
    }
};
