<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obra_id')->nullable()->constrained('obras')->cascadeOnDelete(); // null = cotización independiente
            $table->string('tipo', 15)->default('obra'); // obra | independiente
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->string('cliente_nombre', 150)->nullable();
            $table->smallInteger('version')->default(1);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->string('descuento_tipo', 12)->default('ninguno'); // porcentaje | monto | ninguno
            $table->decimal('descuento_valor', 12, 2)->default(0);
            $table->decimal('descuento_aplicado', 12, 2)->default(0);
            $table->decimal('base_imponible', 12, 2)->default(0);
            $table->decimal('itbis', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('estado', 15)->default('borrador'); // borrador | enviada | aprobada | rechazada
            $table->date('valida_hasta')->nullable();
            $table->text('notas')->nullable();
            $table->string('enviada_por', 12)->nullable(); // whatsapp | correo
            $table->timestamp('enviada_en')->nullable();
            $table->string('estado_cliente', 20)->default('no_enviada'); // no_enviada | enviada | vista | aprobada | cambios_pedidos | rechazada
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cotizaciones');
    }
};
