<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReferralCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReferralCodeController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/referrals/index', [
            'referralCodes' => ReferralCode::with('clientSpecific:id,name,email,username')
                ->latest()
                ->get(),
            'participants' => User::query()
                ->where('role', 'participant')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'username']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:referral_codes,code'],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0.01'],
            'client_specific_id' => ['nullable', 'exists:users,id'],
            'expiry_date' => ['required', 'date', 'after_or_equal:today'],
            'is_one_time' => ['required', 'boolean'],
        ]);

        $validated['code'] = strtoupper($validated['code']);
        $validated['used_count'] = 0;

        ReferralCode::create($validated);

        return redirect()->back()->with('success', 'Referral code created successfully.');
    }

    public function update(Request $request, ReferralCode $referralCode)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('referral_codes', 'code')->ignore($referralCode->id)],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0.01'],
            'client_specific_id' => ['nullable', 'exists:users,id'],
            'expiry_date' => ['required', 'date'],
            'is_one_time' => ['required', 'boolean'],
        ]);

        $validated['code'] = strtoupper($validated['code']);

        $referralCode->update($validated);

        return redirect()->back()->with('success', 'Referral code updated successfully.');
    }

    public function destroy(ReferralCode $referralCode)
    {
        if ($referralCode->registrations()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete a referral code that has registrations.');
        }

        $referralCode->delete();

        return redirect()->back()->with('success', 'Referral code deleted successfully.');
    }
}
