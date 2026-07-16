<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $input['name'] = $input['contact_person'] ?? null;

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'lab_name' => ['required', 'string', 'max:255'],
            'nabl_cert_no' => ['nullable', 'string', 'max:255'],
            'lab_type' => ['required', 'string', 'max:255'],
            'gst_number' => ['required', 'string', 'max:15'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'pin_code' => ['required', 'string', 'max:10'],
            'contact_person' => ['required', 'string', 'max:255'],
            'designation' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:20'],
        ])->validate();

        $user = DB::transaction(function () use ($input) {
            $year = date('Y');
            $count = User::where('role', 'participant')->count() + 1;
            do {
                $username = sprintf('LAB-%s-%04d', $year, $count);
                $count++;
            } while (User::where('username', $username)->exists());

            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'role' => 'participant',
                'username' => $username,
            ]);

            $user->laboratory()->create([
                'lab_name' => $input['lab_name'],
                'nabl_cert_no' => $input['nabl_cert_no'] ?? null,
                'lab_type' => $input['lab_type'],
                'gst_number' => $input['gst_number'],
                'address' => $input['address'],
                'city' => $input['city'],
                'state' => $input['state'],
                'country' => $input['country'],
                'pin_code' => $input['pin_code'],
                'contact_person' => $input['contact_person'],
                'designation' => $input['designation'],
                'mobile' => $input['mobile'],
            ]);

            return $user;
        });

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeLaboratoryMail($user));
        } catch (\Throwable $e) {
            // Log or ignore email sending errors during registration to avoid breaking flow if mail server is unconfigured
            \Illuminate\Support\Facades\Log::error("Failed to send welcome email: " . $e->getMessage());
        }

        return $user;
    }
}
