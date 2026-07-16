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
        Schema::create('samples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_registration_id')->constrained('program_registrations')->cascadeOnDelete();
            $table->string('sample_id')->unique();
            $table->text('qr_code_path')->nullable();
            $table->string('status')->default('prepared'); // prepared, dispatched, delivered
            $table->string('tracking_number')->nullable();
            $table->string('courier_partner')->nullable();
            $table->dateTime('dispatched_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('samples');
    }
};
