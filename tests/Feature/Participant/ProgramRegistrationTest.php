<?php

namespace Tests\Feature\Participant;

use App\Models\Laboratory;
use App\Models\PtProgram;
use App\Models\ReferralCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_program_registration(): void
    {
        $program = PtProgram::create([
            'program_code' => 'PT-01',
            'program_name' => 'Soil testing',
            'discipline' => 'Chemical',
            'parameters' => ['pH'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 0,
            'status' => 'open',
        ]);

        $response = $this->get(route('programs.register', $program));

        $response->assertRedirect(route('login'));
    }

    public function test_participant_can_access_program_registration_form(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $lab = Laboratory::create([
            'user_id' => $user->id,
            'lab_name' => 'Apex Labs',
            'lab_type' => 'Testing',
            'gst_number' => '22AAAAA0000A1Z5',
            'address' => '123 Street',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'country' => 'India',
            'pin_code' => '400001',
            'contact_person' => 'John Doe',
            'designation' => 'Manager',
            'mobile' => '9876543210',
        ]);

        $program = PtProgram::create([
            'program_code' => 'PT-01',
            'program_name' => 'Soil testing',
            'discipline' => 'Chemical',
            'parameters' => ['pH'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 0,
            'status' => 'open',
        ]);

        $response = $this->actingAs($user)->get(route('programs.register', $program));

        $response->assertOk();
    }

    public function test_participant_can_validate_referral_code_successfully(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $referralCode = ReferralCode::create([
            'code' => 'PROMO10',
            'discount_type' => 'percentage',
            'value' => 10.00,
            'expiry_date' => now()->addDays(5),
            'is_one_time' => true,
            'used_count' => 0,
        ]);

        $response = $this->actingAs($user)->post(route('referral.validate'), [
            'code' => 'promo10',
        ]);

        $response->assertOk();
        $response->assertJson([
            'valid' => true,
            'discount_type' => 'percentage',
            'value' => 10.00,
        ]);
    }

    public function test_participant_can_register_for_program(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $lab = Laboratory::create([
            'user_id' => $user->id,
            'lab_name' => 'Apex Labs',
            'lab_type' => 'Testing',
            'gst_number' => '22AAAAA0000A1Z5',
            'address' => '123 Street',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'country' => 'India',
            'pin_code' => '400001',
            'contact_person' => 'John Doe',
            'designation' => 'Manager',
            'mobile' => '9876543210',
        ]);

        $program = PtProgram::create([
            'program_code' => 'PT-01',
            'program_name' => 'Soil testing',
            'discipline' => 'Chemical',
            'parameters' => ['pH', 'Lead'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 0,
            'status' => 'open',
        ]);

        $response = $this->actingAs($user)->post(route('programs.register.submit', $program), [
            'parameters' => ['pH'],
            'sample_quantity' => 1,
            'shipping_address' => 'Test Ship Address',
            'billing_address' => 'Test Bill Address',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('program_registrations', [
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'status' => 'registered',
            'payment_status' => 'paid',
            'parameters' => json_encode(['pH']),
        ]);
    }
}
