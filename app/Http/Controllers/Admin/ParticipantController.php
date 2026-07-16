<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Laboratory;
use App\Models\ProgramRegistration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParticipantController extends Controller
{
    public function index(Request $request)
    {
        $query = Laboratory::with(['user', 'registrations.ptProgram']);

        // Search functionality
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('lab_name', 'like', "%{$searchTerm}%")
                  ->orWhere('contact_person', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                      $userQuery->where('email', 'like', "%{$searchTerm}%")
                               ->orWhere('username', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by status
        if ($request->status) {
            $query->whereHas('registrations', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        // Filter by payment status
        if ($request->payment_status) {
            $query->whereHas('registrations', function ($q) use ($request) {
                $q->where('payment_status', $request->payment_status);
            });
        }

        $participants = $query->latest()->get();

        return Inertia::render('admin/participants/index', [
            'participants' => $participants,
            'filters' => $request->only(['search', 'status', 'payment_status']),
        ]);
    }

    public function show(Laboratory $participant)
    {
        $participant->load(['user', 'registrations.ptProgram', 'registrations.sample', 'registrations.observations']);

        return Inertia::render('admin/participants/show', [
            'participant' => $participant,
        ]);
    }

    public function update(Request $request, Laboratory $participant)
    {
        $validated = $request->validate([
            'lab_name' => ['required', 'string', 'max:255'],
            'nabl_cert_no' => ['nullable', 'string', 'max:255'],
            'lab_type' => ['required', 'string', 'max:255'],
            'gst_number' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'pin_code' => ['required', 'string', 'max:20'],
            'contact_person' => ['required', 'string', 'max:255'],
            'designation' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:20'],
        ]);

        $participant->update($validated);

        return redirect()->back()->with('success', 'Participant updated successfully.');
    }

    public function export(Request $request)
    {
        $query = Laboratory::with(['user', 'registrations.ptProgram']);

        // Apply same filters as index
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('lab_name', 'like', "%{$searchTerm}%")
                  ->orWhere('contact_person', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                      $userQuery->where('email', 'like', "%{$searchTerm}%")
                               ->orWhere('username', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->status) {
            $query->whereHas('registrations', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        if ($request->payment_status) {
            $query->whereHas('registrations', function ($q) use ($request) {
                $q->where('payment_status', $request->payment_status);
            });
        }

        $participants = $query->latest()->get();

        // Format data for export
        $exportData = $participants->map(function ($participant) {
            return [
                'Participant ID' => $participant->user->username,
                'Laboratory Name' => $participant->lab_name,
                'NABL Certificate No' => $participant->nabl_cert_no,
                'Laboratory Type' => $participant->lab_type,
                'GST Number' => $participant->gst_number,
                'Address' => $participant->address,
                'City' => $participant->city,
                'State' => $participant->state,
                'Country' => $participant->country,
                'PIN Code' => $participant->pin_code,
                'Contact Person' => $participant->contact_person,
                'Designation' => $participant->designation,
                'Email' => $participant->user->email,
                'Mobile' => $participant->mobile,
                'Total Registrations' => $participant->registrations->count(),
                'Paid Registrations' => $participant->registrations->where('payment_status', 'paid')->count(),
                'Total Amount Paid' => $participant->registrations->where('payment_status', 'paid')->sum('amount_paid'),
            ];
        });

        // Return JSON for now - in production, this would generate Excel file
        return response()->json([
            'data' => $exportData,
            'count' => $exportData->count(),
        ]);
    }

    public function destroy(Laboratory $participant)
    {
        // Check if participant has any registrations
        if ($participant->registrations()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete participant with existing registrations.');
        }

        $participant->delete();

        return redirect()->route('admin.participants.index')->with('success', 'Participant deleted successfully.');
    }
}
