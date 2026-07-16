<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProgramTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_programs(): void
    {
        $response = $this->get(route('admin.programs.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_participant_cannot_access_admin_programs(): void
    {
        $user = User::factory()->create([
            'role' => 'participant',
        ]);

        $response = $this->actingAs($user)->get(route('admin.programs.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_programs(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->get(route('admin.programs.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_pt_program(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->post(route('admin.programs.store'), [
            'program_code' => 'PT-CHEM-2026-01',
            'program_name' => 'Soil testing program',
            'discipline' => 'Chemical',
            'parameters' => ['pH', 'Lead', 'Nitrogen'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 4500.00,
        ]);

        $response->assertRedirect(route('admin.programs.index'));
        $this->assertDatabaseHas('pt_programs', [
            'program_code' => 'PT-CHEM-2026-01',
            'program_name' => 'Soil testing program',
            'fee' => 4500.00,
            'status' => 'open',
        ]);
    }

    public function test_admin_can_update_pt_program(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $program = \App\Models\PtProgram::create([
            'program_code' => 'PT-OLD-01',
            'program_name' => 'Old program',
            'discipline' => 'Biological',
            'parameters' => ['Coliform'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 3000.00,
            'status' => 'open',
        ]);

        $response = $this->actingAs($user)->put(route('admin.programs.update', $program), [
            'program_code' => 'PT-NEW-01',
            'program_name' => 'Updated Soil program',
            'discipline' => 'Chemical',
            'parameters' => ['pH', 'Coliform'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 3500.00,
            'status' => 'active',
        ]);

        $response->assertRedirect(route('admin.programs.index'));
        $this->assertDatabaseHas('pt_programs', [
            'id' => $program->id,
            'program_code' => 'PT-NEW-01',
            'program_name' => 'Updated Soil program',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_delete_pt_program(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $program = \App\Models\PtProgram::create([
            'program_code' => 'PT-DEL-01',
            'program_name' => 'Program to delete',
            'discipline' => 'Biological',
            'parameters' => ['Coliform'],
            'reg_start_date' => '2026-08-01',
            'reg_end_date' => '2026-08-15',
            'dispatch_date' => '2026-08-20',
            'submission_deadline' => '2026-09-01',
            'report_release_date' => '2026-09-15',
            'fee' => 3000.00,
            'status' => 'open',
        ]);

        $response = $this->actingAs($user)->delete(route('admin.programs.destroy', $program));

        $response->assertRedirect(route('admin.programs.index'));
        $this->assertDatabaseMissing('pt_programs', [
            'id' => $program->id,
        ]);
    }
}
