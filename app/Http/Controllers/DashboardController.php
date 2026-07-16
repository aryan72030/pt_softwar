<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Laboratory;
use App\Models\ProgramRegistration;
use App\Models\PtProgram;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        PtProgram::syncRegistrationStatuses();

        if ($user->isAdmin()) {
            // Admin Dashboard Stats (Module 1)
            $stats = [
                'total_participants' => Laboratory::count(),
                'active_programs' => PtProgram::where('status', 'active')->count(),
                'revenue' => ProgramRegistration::where('payment_status', 'paid')->sum('amount_paid'),
                'pending_dispatches' => ProgramRegistration::where('status', 'sample_dispatched')->count(),
                'submitted_observations' => ProgramRegistration::where('status', 'submitted')->count(),
                'pending_reports' => ProgramRegistration::where('status', 'report_released')->count(),
            ];

            return Inertia::render('dashboard', [
                'role' => 'admin',
                'stats' => $stats,
            ]);
        }

        // Participant Dashboard (Phase 2)
        $activePrograms = PtProgram::whereIn('status', ['open', 'active'])
            ->where('reg_end_date', '>=', now())
            ->get();
        
        $lab = $user->laboratory;
        $registrations = $lab 
            ? ProgramRegistration::with(['ptProgram', 'sample'])
                ->where('lab_id', $lab->id)
                ->latest()
                ->get()
            : [];

        return Inertia::render('dashboard', [
            'role' => 'participant',
            'activePrograms' => $activePrograms,
            'registrations' => $registrations,
        ]);
    }
}


