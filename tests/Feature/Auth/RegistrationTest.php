<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'lab_name' => 'Test Laboratory Ltd',
            'nabl_cert_no' => 'MC-9999',
            'lab_type' => 'Testing',
            'gst_number' => '24AAAAP1234A1Z1',
            'address' => '123, Science Street',
            'city' => 'Surat',
            'state' => 'Gujarat',
            'country' => 'India',
            'pin_code' => '395007',
            'contact_person' => 'Mr. Jane Doe',
            'designation' => 'Director',
            'mobile' => '9999988888',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'participant',
            'username' => 'LAB-' . date('Y') . '-0001',
        ]);
        $this->assertDatabaseHas('laboratories', [
            'lab_name' => 'Test Laboratory Ltd',
            'gst_number' => '24AAAAP1234A1Z1',
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_fails_if_laboratory_fields_are_missing()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors([
            'lab_name', 'lab_type', 'gst_number', 'address', 'city', 'state', 'country', 'pin_code', 'contact_person', 'designation', 'mobile'
        ]);
        $this->assertGuest();
    }
}
