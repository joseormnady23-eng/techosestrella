<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cotizacion_id')->nullable()->constrained('cotizaciones')->nullOnDelete();
            $table->foreignId('obra_id')->nullable()->constrained('obras')->nullOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->string('cliente_nombre', 150)->nullable();
            $table->string('cliente_rnc', 20)->nullable();
            $table->string('tipo_comprobante', 3); // B01 | B02 | B03 | B04
            $table->string('ncf', 19)->unique();
            $table->string('ncf_modificado', 19)->nullable();
            $table->boolean('requiere_ecf')->default(true);
            $table->string('estado_ecf', 20)->default('pendiente'); // pendiente | enviado | aprobado | rechazado | no_aplica
            $table->string('codigo_aprobacion', 50)->nullable();
            $table->text('motivo_rechazo')->nullable();
            $table->longText('xml_firmado')->nullable();
            $table->date('fecha_emision');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('base_imponible', 12, 2);
            $table->decimal('itbis', 12, 2);
            $table->decimal('total', 12, 2);
            $table->boolean('pagada')->default(false);
            $table->boolean('anulada')->default(false);
            $table->foreignId('emitida_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
