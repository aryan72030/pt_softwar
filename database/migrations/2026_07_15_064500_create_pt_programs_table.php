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
        Schema::create('pt_programs', function (Blueprint $table) {
            $table->id();
            $table->string('program_code')->unique();
            $table->string('program_name');
            $table->string('discipline');
            $table->json('parameters');
            $table->dateTime('reg_start_date');
            $table->dateTime('reg_end_date');
            $table->dateTime('dispatch_date');
            $table->dateTime('submission_deadline');
            $table->dateTime('report_release_date');
            $table->decimal('fee', 10, 2);
            $table->string('status')->default('open'); // open, active, closed, completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_programs');
    }
};
