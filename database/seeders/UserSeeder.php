<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Gunakan updateOrCreate agar kalau kamu jalankan perintahnya 2x tidak error "Duplicate Entry"
        User::updateOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin'
            ]
        );

        User::updateOrCreate(
            ['email' => 'panitia@mail.com'],
            [
                'name' => 'Panitia',
                'password' => Hash::make('password123'),
                'role' => 'panitia'
            ]
        );
    }
}