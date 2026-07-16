<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PtProgram;
use App\Models\PtPlan;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/programs/index', [
            'programs' => PtProgram::with('ptPlan')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_code' => ['required', 'string', 'unique:pt_programs,program_code'],
            'program_name' => ['required', 'string', 'max:255'],
            'discipline' => ['required', 'string', 'max:255'],
            'parameters' => ['required', 'array'],
            'parameters.*' => ['required', 'string', 'max:255'],
            'reg_start_date' => ['required', 'date'],
            'reg_end_date' => ['required', 'date', 'after:reg_start_date'],
            'dispatch_date' => ['required', 'date', 'after:reg_end_date'],
            'submission_deadline' => ['required', 'date', 'after:dispatch_date'],
            'report_release_date' => ['required', 'date', 'after:submission_deadline'],
            'fee' => ['required', 'numeric', 'min:0'],
        ]);

        $validated['status'] = 'open';

        PtProgram::create($validated);

        return redirect()->route('admin.programs.index')->with('success', 'PT Program created successfully.');
    }

    public function update(Request $request, PtProgram $program)
    {
        $validated = $request->validate([
            'program_code' => ['required', 'string', 'unique:pt_programs,program_code,' . $program->id],
            'program_name' => ['required', 'string', 'max:255'],
            'discipline' => ['required', 'string', 'max:255'],
            'parameters' => ['required', 'array'],
            'parameters.*' => ['required', 'string', 'max:255'],
            'reg_start_date' => ['required', 'date'],
            'reg_end_date' => ['required', 'date', 'after:reg_start_date'],
            'dispatch_date' => ['required', 'date', 'after:reg_end_date'],
            'submission_deadline' => ['required', 'date', 'after:dispatch_date'],
            'report_release_date' => ['required', 'date', 'after:submission_deadline'],
            'fee' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:open,active,closed,completed'],
        ]);

        $program->update($validated);

        return redirect()->route('admin.programs.index')->with('success', 'PT Program updated successfully.');
    }

    public function destroy(PtProgram $program)
    {
        $program->delete();

        return redirect()->route('admin.programs.index')->with('success', 'PT Program deleted successfully.');
    }

    public function createPtPlan(PtProgram $program)
    {
        return Inertia::render('admin/programs/pt-plan/create', [
            'program' => $program,
        ]);
    }

    public function storePtPlan(Request $request, PtProgram $program)
    {
        $validated = $request->validate([
            'material' => ['required', 'string', 'max:255'],
            'assigned_coordinator' => ['required', 'string', 'max:255'],
            'sample_quantity' => ['required', 'integer', 'min:1'],
            'sample_preparation_instructions' => ['nullable', 'string'],
        ]);

        // Auto-generate program number
        $year = now()->year;
        $count = PtPlan::whereYear('created_at', $year)->count() + 1;
        $programNumber = 'PT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $validated['program_number'] = $programNumber;
        $validated['pt_program_id'] = $program->id;
        $validated['parameters'] = $program->parameters;
        $validated['timeline'] = [
            'registration_start' => $program->reg_start_date->toDateString(),
            'registration_end' => $program->reg_end_date->toDateString(),
            'dispatch' => $program->dispatch_date->toDateString(),
            'submission_deadline' => $program->submission_deadline->toDateString(),
            'report_release' => $program->report_release_date->toDateString(),
        ];

        PtPlan::create($validated);

        return redirect()->route('admin.programs.index')->with('success', 'PT Plan generated successfully. Program Number: ' . $programNumber);
    }
}
