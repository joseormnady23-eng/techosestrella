<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factura_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factura_id')->constrained('facturas')->cascadeOnDelete();
            $table->string('descripcion', 200);
            $table->decimal('cantidad', 10, 2);
            $table->string('unidad', 15);
            $table->decimal('precio_unitario', 12, 2);
            $table->decimal('itbis_rate', 5, 2)->default(18.00);
            $table->decimal('importe', 12, 2);
            $table->decimal('importe_itbis', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factura_items');
    }
};
