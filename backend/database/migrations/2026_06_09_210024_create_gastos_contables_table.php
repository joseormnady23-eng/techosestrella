<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos_contables', function (Blueprint $table) {
            $table->id();
            $table->string('categoria', 50);
            $table->string('descripcion', 200);
            $table->decimal('monto', 12, 2);
            $table->decimal('itbis_pagado', 12, 2)->default(0);
            $table->date('fecha');
            $table->string('proveedor', 150)->nullable();
            $table->string('rnc_proveedor', 20)->nullable();
            $table->string('ncf_proveedor', 19)->nullable();
            $table->foreignId('obra_id')->nullable()->constrained('obras')->nullOnDelete();
            $table->string('comprobante_tipo', 3)->nullable();
            $table->string('pagado_con', 30)->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('adjunto', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos_contables');
    }
};
