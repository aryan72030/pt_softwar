<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_registration_id')->constrained('program_registrations')->cascadeOnDelete();
            $table->string('parameter_name');
            $table->string('test_method');
            $table->string('result');
            $table->string('unit');
            $table->text('remarks')->nullable();
            $table->string('supporting_file_path')->nullable();
            $table->dateTime('submitted_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observations');
    }
};
