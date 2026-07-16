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
        Schema::create('program_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_id')->constrained('laboratories')->cascadeOnDelete();
            $table->foreignId('pt_program_id')->constrained('pt_programs')->cascadeOnDelete();
            $table->string('registration_number')->unique();
            $table->foreignId('referral_code_id')->nullable()->constrained('referral_codes')->nullOnDelete();
            $table->string('payment_status')->default('pending'); // pending, paid, failed
            $table->decimal('amount_paid', 10, 2)->default(0.00);
            $table->string('status')->default('registered'); // registered, sample_dispatched, submitted, report_released
            $table->json('parameters');
            $table->dateTime('registered_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_registrations');
    }
};
