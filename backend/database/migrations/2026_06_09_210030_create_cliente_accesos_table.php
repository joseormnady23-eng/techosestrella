<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_accesos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('obra_id')->nullable()->constrained('obras')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->string('canal', 10); // whatsapp | correo
            $table->timestamp('expira_en');
            $table->timestamp('ultimo_acceso')->nullable();
            $table->boolean('revocado')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_accesos');
    }
};
