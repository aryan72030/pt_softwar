<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Laboratory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'username' => 'admin',
        ]);

        // Create Lab Participant User
        $labUser = User::create([
            'name' => 'Test Laboratory User',
            'email' => 'lab@example.com',
            'password' => Hash::make('password'),
            'role' => 'participant',
            'username' => 'LAB-2026-0001',
        ]);

        // Create linked Laboratory details
        Laboratory::create([
            'user_id' => $labUser->id,
            'lab_name' => 'Apex Testing Laboratory',
            'nabl_cert_no' => 'MC-1234',
            'lab_type' => 'Testing',
            'gst_number' => '24AAAAP1234A1Z1',
            'address' => '101, Science Park, University Road',
            'city' => 'Ahmedabad',
            'state' => 'Gujarat',
            'country' => 'India',
            'pin_code' => '380009',
            'contact_person' => 'Dr. Rajesh Patel',
            'designation' => 'Technical Manager',
            'mobile' => '9876543210',
        ]);
    }
}
