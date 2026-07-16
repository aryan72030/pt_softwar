<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Observation;
use Inertia\Inertia;

class ObservationController extends Controller
{
    public function index()
    {
        $observations = Observation::with(['registration.laboratory', 'registration.ptProgram', 'registration.sample'])
            ->latest()
            ->get();

        return Inertia::render('admin/observations/index', [
            'observations' => $observations,
        ]);
    }

    public function update(Request $request, Observation $observation)
    {
        $validated = $request->validate([
            'test_method' => ['required', 'string', 'max:255'],
            'result' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $observation->update($validated);

        return redirect()->back()->with('success', 'Observation updated successfully.');
    }
}
