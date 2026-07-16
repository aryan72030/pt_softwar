<?php

namespace App\Http\Controllers;

use App\Models\ProgramRegistration;
use App\Models\PtProgram;
use App\Models\ReferralCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParticipantProgramController extends Controller
{
    public function registerForm(PtProgram $program, Request $request)
    {
        PtProgram::syncRegistrationStatuses();
        $program->refresh();

        $user = $request->user();
        if (!$user->laboratory) {
            return redirect()->route('dashboard')->with('error', 'Please complete your laboratory profile first.');
        }

        if (!$program->registrationIsOpen()) {
            return redirect()->route('dashboard')->with('error', 'Registration is not open for this program.');
        }

        return Inertia::render('programs/register', [
            'program' => $program,
            'laboratory' => $user->laboratory,
        ]);
    }

    public function validateReferralCode(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = ReferralCode::whereRaw('lower(code) = ?', [strtolower($request->code)])->first();

        if (!$code) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid referral code.',
            ]);
        }

        if ($code->expiry_date->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'Referral code has expired.',
            ]);
        }

        if ($code->is_one_time && $code->used_count > 0) {
            return response()->json([
                'valid' => false,
                'message' => 'Referral code has already been used.',
            ]);
        }

        if ($code->client_specific_id && $code->client_specific_id !== $request->user()->id) {
            return response()->json([
                'valid' => false,
                'message' => 'This referral code is not applicable to your account.',
            ]);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => $code->discount_type,
            'value' => (float) $code->value,
            'referral_code_id' => $code->id,
            'message' => 'Referral code applied successfully!',
        ]);
    }

    public function register(Request $request, PtProgram $program)
    {
        PtProgram::syncRegistrationStatuses();
        $program->refresh();

        $user = $request->user();
        if (!$user->laboratory) {
            return redirect()->route('dashboard')->with('error', 'Please complete your laboratory profile first.');
        }

        if (!$program->registrationIsOpen()) {
            return redirect()->route('dashboard')->with('error', 'Registration is not open for this program.');
        }

        $request->validate([
            'parameters' => ['required', 'array', 'min:1'],
            'parameters.*' => ['required', 'string'],
            'sample_quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'billing_address' => ['required', 'string', 'max:500'],
            'referral_code' => ['nullable', 'string'],
        ]);

        $exists = ProgramRegistration::where('lab_id', $user->laboratory->id)
            ->where('pt_program_id', $program->id)
            ->exists();

        if ($exists) {
            return redirect()->route('dashboard')->with('error', 'You have already registered for this program.');
        }

        $invalidParameters = collect($request->parameters)->diff($program->parameters ?? []);

        if ($invalidParameters->isNotEmpty()) {
            return redirect()->back()->withErrors([
                'parameters' => 'Please select only parameters available in this program.',
            ])->withInput();
        }

        $registrationNumber = \DB::transaction(function () use ($program, $request, $user) {
            $year = now()->year;
            $count = ProgramRegistration::whereYear('created_at', $year)->lockForUpdate()->count() + 1;
            $regNo = 'REG-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $discount = 0.00;
            $referralCodeId = null;

            if ($request->referral_code) {
                $code = ReferralCode::whereRaw('lower(code) = ?', [strtolower($request->referral_code)])->first();
                if ($code && !$code->expiry_date->isPast() && (!$code->is_one_time || $code->used_count == 0)) {
                    if (!$code->client_specific_id || $code->client_specific_id === $user->id) {
                        $referralCodeId = $code->id;
                        $discount = $code->discount_type === 'percentage'
                            ? ($program->fee * $code->value) / 100
                            : $code->value;
                        $code->increment('used_count');
                    }
                }
            }

            $amountPaid = max(0, $program->fee - $discount);

            ProgramRegistration::create([
                'lab_id' => $user->laboratory->id,
                'pt_program_id' => $program->id,
                'registration_number' => $regNo,
                'referral_code_id' => $referralCodeId,
                'payment_status' => 'paid',
                'amount_paid' => $amountPaid,
                'status' => 'registered',
                'parameters' => $request->parameters,
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
                'registered_at' => now(),
            ]);

            return $regNo;
        });

        return redirect()->route('dashboard')->with('success', "Registered successfully for PT Program. Your Registration Number: {$registrationNumber}");
    }

    public function downloadReport(Request $request, ProgramRegistration $registration)
    {
        $registration = $this->ownedRegistration($request, $registration);

        if ($registration->status !== 'report_released') {
            return redirect()->route('dashboard')->with('error', 'Report is not available yet.');
        }

        $fileName = $registration->registration_number . '-report.html';

        return response()->streamDownload(function () use ($registration) {
            echo view('documents.report', [
                'registration' => $registration,
                'laboratory' => $registration->laboratory,
                'program' => $registration->ptProgram,
                'sample' => $registration->sample,
                'observations' => $registration->observations,
            ])->render();
        }, $fileName, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    public function downloadCertificate(Request $request, ProgramRegistration $registration)
    {
        $registration = $this->ownedRegistration($request, $registration);

        if ($registration->status !== 'report_released') {
            return redirect()->route('dashboard')->with('error', 'Certificate is not available yet.');
        }

        $fileName = $registration->registration_number . '-certificate.html';

        return response()->streamDownload(function () use ($registration) {
            echo view('documents.certificate', [
                'registration' => $registration,
                'laboratory' => $registration->laboratory,
                'program' => $registration->ptProgram,
            ])->render();
        }, $fileName, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    public function downloadInvoice(Request $request, ProgramRegistration $registration)
    {
        $registration = $this->ownedRegistration($request, $registration);

        if ($registration->payment_status !== 'paid') {
            return redirect()->route('dashboard')->with('error', 'Invoice is available only for paid registrations.');
        }

        $fileName = $registration->registration_number . '-invoice.html';

        return response()->streamDownload(function () use ($registration) {
            echo view('documents.invoice', [
                'registration' => $registration,
                'laboratory' => $registration->laboratory,
                'program' => $registration->ptProgram,
                'discount' => max(0, (float) $registration->ptProgram->fee - (float) $registration->amount_paid),
            ])->render();
        }, $fileName, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    protected function ownedRegistration(Request $request, ProgramRegistration $registration): ProgramRegistration
    {
        $lab = $request->user()->laboratory;

        if (!$lab || $registration->lab_id !== $lab->id) {
            abort(403, 'Unauthorized access.');
        }

        $registration->loadMissing([
            'laboratory.user',
            'ptProgram',
            'sample',
            'observations',
        ]);

        return $registration;
    }
}
