<?php

namespace Tests\Feature\Participant;

use App\Models\Laboratory;
use App\Models\PtProgram;
use App\Models\ProgramRegistration;
use App\Models\Sample;
use App\Models\Observation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ObservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_observation_form(): void
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

        $registration = ProgramRegistration::create([
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'registration_number' => 'REG-2026-0001',
            'payment_status' => 'paid',
            'amount_paid' => 0,
            'status' => 'registered',
            'parameters' => ['pH'],
            'registered_at' => now(),
        ]);

        $response = $this->get(route('registrations.observations', $registration));

        $response->assertRedirect(route('login'));
    }

    public function test_participant_can_access_observation_form_before_deadline(): void
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
            'submission_deadline' => now()->addDays(5)->toDateTimeString(),
            'report_release_date' => '2026-09-15',
            'fee' => 0,
            'status' => 'open',
        ]);

        $registration = ProgramRegistration::create([
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'registration_number' => 'REG-2026-0001',
            'payment_status' => 'paid',
            'amount_paid' => 0,
            'status' => 'registered',
            'parameters' => ['pH'],
            'registered_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('registrations.observations', $registration));

        $response->assertOk();
    }

    public function test_participant_cannot_access_observation_form_after_deadline(): void
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
            'submission_deadline' => now()->subDays(1)->toDateTimeString(), // passed!
            'report_release_date' => '2026-09-15',
            'fee' => 0,
            'status' => 'open',
        ]);

        $registration = ProgramRegistration::create([
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'registration_number' => 'REG-2026-0001',
            'payment_status' => 'paid',
            'amount_paid' => 0,
            'status' => 'registered',
            'parameters' => ['pH'],
            'registered_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('registrations.observations', $registration));

        $response->assertRedirect(route('dashboard'));
    }

    public function test_participant_can_submit_observations_successfully(): void
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
            'submission_deadline' => now()->addDays(5)->toDateTimeString(),
            'report_release_date' => '2026-09-15',
            'fee' => 0,
            'status' => 'open',
        ]);

        $registration = ProgramRegistration::create([
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'registration_number' => 'REG-2026-0001',
            'payment_status' => 'paid',
            'amount_paid' => 0,
            'status' => 'registered',
            'parameters' => ['pH'],
            'registered_at' => now(),
        ]);

        $response = $this->actingAs($user)->post(route('registrations.observations.submit', $registration), [
            'observations' => [
                [
                    'parameter_name' => 'pH',
                    'test_method' => 'APHA 4500-H+',
                    'result' => '7.21',
                    'unit' => 'pH Units',
                    'remarks' => 'Normal condition',
                ]
            ]
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('observations', [
            'program_registration_id' => $registration->id,
            'parameter_name' => 'pH',
            'test_method' => 'APHA 4500-H+',
            'result' => '7.21',
            'unit' => 'pH Units',
        ]);

        $this->assertDatabaseHas('program_registrations', [
            'id' => $registration->id,
            'status' => 'submitted',
        ]);
    }

    public function test_admin_can_access_observations_index(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.observations.index'));

        $response->assertOk();
    }
}
