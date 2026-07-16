<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ProgramRegistration;
use App\Models\Observation;
use Inertia\Inertia;

class ParticipantObservationController extends Controller
{
    public function showForm(ProgramRegistration $registration, Request $request)
    {
        $lab = $request->user()->laboratory;
        if (!$lab || $registration->lab_id !== $lab->id) {
            abort(403, 'Unauthorized access.');
        }

        // Lock submission if deadline has passed
        if (now()->isAfter($registration->ptProgram->submission_deadline)) {
            return redirect()->route('dashboard')->with('error', 'The submission deadline for this program has passed.');
        }

        // Lock submission if already submitted
        if ($registration->status === 'submitted' || $registration->status === 'report_released') {
            return redirect()->route('dashboard')->with('error', 'Observations have already been submitted.');
        }

        $registration->load(['ptProgram', 'sample']);

        return Inertia::render('programs/observations/submit', [
            'registration' => $registration,
        ]);
    }

    public function submit(Request $request, ProgramRegistration $registration)
    {
        $lab = $request->user()->laboratory;
        if (!$lab || $registration->lab_id !== $lab->id) {
            abort(403, 'Unauthorized access.');
        }

        if (now()->isAfter($registration->ptProgram->submission_deadline)) {
            return redirect()->route('dashboard')->with('error', 'The submission deadline for this program has passed.');
        }

        if ($registration->status === 'submitted' || $registration->status === 'report_released') {
            return redirect()->route('dashboard')->with('error', 'Observations have already been submitted.');
        }

        $request->validate([
            'observations' => ['required', 'array', 'min:1'],
            'observations.*.parameter_name' => ['required', 'string'],
            'observations.*.test_method' => ['required', 'string', 'max:255'],
            'observations.*.result' => ['required', 'string', 'max:255'],
            'observations.*.unit' => ['required', 'string', 'max:50'],
            'observations.*.remarks' => ['nullable', 'string', 'max:1000'],
            'supporting_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,zip', 'max:10240'],
        ]);

        \DB::transaction(function () use ($request, $registration) {
            $filePath = null;
            if ($request->hasFile('supporting_file')) {
                $filePath = $request->file('supporting_file')->store('supporting_files', 'public');
            }

            foreach ($request->observations as $item) {
                Observation::create([
                    'program_registration_id' => $registration->id,
                    'parameter_name' => $item['parameter_name'],
                    'test_method' => $item['test_method'],
                    'result' => $item['result'],
                    'unit' => $item['unit'],
                    'remarks' => $item['remarks'] ?? null,
                    'supporting_file_path' => $filePath,
                    'submitted_at' => now(),
                ]);
            }

            $registration->update([
                'status' => 'submitted',
            ]);
        });

        return redirect()->route('dashboard')->with('success', 'Observations submitted successfully.');
    }
}
