<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos', function (Blueprint $table) {
            $table->id();
            $table->string('categoria', 50);
            $table->decimal('monto', 12, 2);
            $table->date('fecha');
            $table->foreignId('obra_id')->nullable()->constrained('obras')->nullOnDelete();
            $table->string('nota', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos');
    }
};
