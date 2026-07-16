<?php

use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\DispatchController;
use App\Http\Controllers\Admin\ObservationController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\ReferralCodeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ParticipantProgramController;
use App\Http\Controllers\ParticipantObservationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('programs/{program}/register', [ParticipantProgramController::class, 'registerForm'])->name('programs.register');
    Route::post('programs/{program}/register', [ParticipantProgramController::class, 'register'])->name('programs.register.submit');
    Route::post('referral/validate', [ParticipantProgramController::class, 'validateReferralCode'])->name('referral.validate');
    Route::get('registrations/{registration}/report', [ParticipantProgramController::class, 'downloadReport'])->name('registrations.report.download');
    Route::get('registrations/{registration}/certificate', [ParticipantProgramController::class, 'downloadCertificate'])->name('registrations.certificate.download');
    Route::get('registrations/{registration}/invoice', [ParticipantProgramController::class, 'downloadInvoice'])->name('registrations.invoice.download');
    Route::get('registrations/{registration}/observations', [ParticipantObservationController::class, 'showForm'])->name('registrations.observations');
    Route::post('registrations/{registration}/observations', [ParticipantObservationController::class, 'submit'])->name('registrations.observations.submit');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');
    Route::post('programs', [ProgramController::class, 'store'])->name('programs.store');
    Route::put('programs/{program}', [ProgramController::class, 'update'])->name('programs.update');
    Route::delete('programs/{program}', [ProgramController::class, 'destroy'])->name('programs.destroy');
    Route::get('programs/{program}/pt-plan/create', [ProgramController::class, 'createPtPlan'])->name('programs.pt-plan.create');
    Route::post('programs/{program}/pt-plan', [ProgramController::class, 'storePtPlan'])->name('programs.pt-plan.store');

    Route::get('dispatches', [DispatchController::class, 'index'])->name('dispatches.index');
    Route::post('registrations/{registration}/prepare-sample', [DispatchController::class, 'prepareSample'])->name('registrations.prepare-sample');
    Route::post('samples/{sample}/dispatch', [DispatchController::class, 'dispatchSample'])->name('samples.dispatch');

    Route::get('participants', [ParticipantController::class, 'index'])->name('participants.index');
    Route::get('participants/export', [ParticipantController::class, 'export'])->name('participants.export');
    Route::get('participants/{participant}', [ParticipantController::class, 'show'])->name('participants.show');
    Route::put('participants/{participant}', [ParticipantController::class, 'update'])->name('participants.update');
    Route::delete('participants/{participant}', [ParticipantController::class, 'destroy'])->name('participants.destroy');

    Route::get('referrals', [ReferralCodeController::class, 'index'])->name('referrals.index');
    Route::post('referrals', [ReferralCodeController::class, 'store'])->name('referrals.store');
    Route::put('referrals/{referralCode}', [ReferralCodeController::class, 'update'])->name('referrals.update');
    Route::delete('referrals/{referralCode}', [ReferralCodeController::class, 'destroy'])->name('referrals.destroy');

    Route::get('observations', [ObservationController::class, 'index'])->name('observations.index');
    Route::put('observations/{observation}', [ObservationController::class, 'update'])->name('observations.update');
});

require __DIR__.'/settings.php';

