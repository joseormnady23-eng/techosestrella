<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_607', function (Blueprint $table) {
            $table->id();
            $table->string('periodo', 7);
            $table->string('rnc_ncf', 20)->nullable();
            $table->string('tipo_id', 1)->nullable();
            $table->string('ncf', 19);
            $table->string('ncf_modificado', 19)->nullable();
            $table->string('tipo_comprobante', 3);
            $table->date('fecha_comprobante');
            $table->decimal('monto_facturado', 12, 2);
            $table->decimal('itbis_facturado', 12, 2);
            $table->decimal('itbis_retenido', 12, 2)->default(0);
            $table->decimal('retencion_renta', 12, 2)->default(0);
            $table->string('tipo_pago', 20)->nullable();
            $table->timestamp('generado_en');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_607');
    }
};
