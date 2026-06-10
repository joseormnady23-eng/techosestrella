<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_606', function (Blueprint $table) {
            $table->id();
            $table->string('periodo', 7); // YYYY-MM
            $table->string('rnc_proveedor', 20);
            $table->string('tipo_id', 1);
            $table->string('ncf', 19);
            $table->string('tipo_comprobante', 3);
            $table->date('fecha_comprobante');
            $table->date('fecha_pago')->nullable();
            $table->decimal('monto_servicios', 12, 2)->default(0);
            $table->decimal('monto_bienes', 12, 2)->default(0);
            $table->decimal('total_monto', 12, 2);
            $table->decimal('itbis_facturado', 12, 2)->default(0);
            $table->decimal('itbis_retenido', 12, 2)->default(0);
            $table->timestamp('generado_en');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_606');
    }
};
