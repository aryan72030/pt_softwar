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
        Schema::create('pt_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pt_program_id')->constrained()->cascadeOnDelete();
            $table->string('program_number')->unique(); // Auto-generated
            $table->string('material'); // e.g., Water, Soil, Chemical
            $table->json('parameters'); // List of test parameters
            $table->json('timeline'); // e.g., ['registration_start' => '...', 'dispatch' => '...', 'submission_deadline' => '...']
            $table->string('assigned_coordinator');
            $table->integer('sample_quantity')->default(1);
            $table->text('sample_preparation_instructions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_plans');
    }
};
