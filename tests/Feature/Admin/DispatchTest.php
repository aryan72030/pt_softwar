<?php

namespace Tests\Feature\Admin;

use App\Mail\SampleDispatchedMail;
use App\Models\Laboratory;
use App\Models\PtProgram;
use App\Models\ProgramRegistration;
use App\Models\Sample;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DispatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dispatches(): void
    {
        $response = $this->get(route('admin.dispatches.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_dispatches_index(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.dispatches.index'));

        $response->assertOk();
    }

    public function test_admin_can_prepare_sample_automatically(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create(['role' => 'participant']);
        $lab = Laboratory::create([
            'user_id' => $participant->id,
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
            'fee' => 1000,
            'status' => 'open',
        ]);

        $registration = ProgramRegistration::create([
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'registration_number' => 'REG-2026-0001',
            'payment_status' => 'paid',
            'amount_paid' => 1000,
            'status' => 'registered',
            'parameters' => ['pH'],
            'registered_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post(route('admin.registrations.prepare-sample', $registration));

        $response->assertRedirect();
        $this->assertDatabaseHas('samples', [
            'program_registration_id' => $registration->id,
            'status' => 'prepared',
        ]);

        $sample = Sample::first();
        $this->assertNotNull($sample);
        $this->assertStringStartsWith('PT-' . now()->year, $sample->sample_id);
    }

    public function test_admin_can_dispatch_prepared_sample(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create(['role' => 'participant']);
        $lab = Laboratory::create([
            'user_id' => $participant->id,
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
            'fee' => 1000,
            'status' => 'open',
        ]);

        $registration = ProgramRegistration::create([
            'lab_id' => $lab->id,
            'pt_program_id' => $program->id,
            'registration_number' => 'REG-2026-0001',
            'payment_status' => 'paid',
            'amount_paid' => 1000,
            'status' => 'registered',
            'parameters' => ['pH'],
            'registered_at' => now(),
        ]);

        $sample = Sample::create([
            'program_registration_id' => $registration->id,
            'sample_id' => 'PT-2026-001',
            'status' => 'prepared',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.samples.dispatch', $sample), [
            'courier_partner' => 'FedEx',
            'tracking_number' => 'TRACK12345',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('samples', [
            'id' => $sample->id,
            'status' => 'dispatched',
            'courier_partner' => 'FedEx',
            'tracking_number' => 'TRACK12345',
        ]);

        $this->assertDatabaseHas('program_registrations', [
            'id' => $registration->id,
            'status' => 'sample_dispatched',
        ]);

        Mail::assertSent(SampleDispatchedMail::class, function ($mail) use ($participant) {
            return $mail->hasTo($participant->email);
        });
    }
}
