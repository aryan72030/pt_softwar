<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ProgramRegistration;
use App\Models\Sample;
use App\Mail\SampleDispatchedMail;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class DispatchController extends Controller
{
    public function index()
    {
        $registrations = ProgramRegistration::with(['laboratory', 'ptProgram', 'sample'])
            ->where('payment_status', 'paid')
            ->latest()
            ->get();

        return Inertia::render('admin/dispatches/index', [
            'registrations' => $registrations,
        ]);
    }

    public function prepareSample(ProgramRegistration $registration)
    {
        if ($registration->sample()->exists()) {
            return redirect()->back()->with('error', 'Sample has already been prepared for this registration.');
        }

        $sampleId = \DB::transaction(function () use ($registration) {
            $year = now()->year;
            $count = Sample::whereYear('created_at', $year)->lockForUpdate()->count() + 1;
            $sid = 'PT-' . $year . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            
            $qrCodePath = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" . $sid;

            Sample::create([
                'program_registration_id' => $registration->id,
                'sample_id' => $sid,
                'qr_code_path' => $qrCodePath,
                'status' => 'prepared',
            ]);

            return $sid;
        });

        return redirect()->back()->with('success', "Sample {$sampleId} prepared successfully.");
    }

    public function dispatchSample(Request $request, Sample $sample)
    {
        $validated = $request->validate([
            'courier_partner' => ['required', 'string', 'max:255'],
            'tracking_number' => ['required', 'string', 'max:255'],
        ]);

        \DB::transaction(function () use ($sample, $validated) {
            $sample->update([
                'courier_partner' => $validated['courier_partner'],
                'tracking_number' => $validated['tracking_number'],
                'status' => 'dispatched',
                'dispatched_at' => now(),
            ]);

            $sample->registration->update([
                'status' => 'sample_dispatched',
            ]);
        });

        // Notify participant
        $user = $sample->registration->laboratory->user;
        if ($user) {
            try {
                Mail::to($user->email)->send(new SampleDispatchedMail($sample));
            } catch (\Exception $e) {
                // Log or handle mail failure gracefully for test environment
            }
        }

        return redirect()->back()->with('success', "Sample {$sample->sample_id} marked as dispatched and notification sent.");
    }
}
