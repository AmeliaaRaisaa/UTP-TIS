<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin — superuser, kelola segalanya
        User::create([
            'name'     => 'Admin Utama',
            'email'    => 'admin@eventkampus.com',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);

        // Panitia — himpunan/UKM, kelola event yang dia buat sendiri
        User::create([
            'name'     => 'Panitia BEM FILKOM',
            'email'    => 'panitia@eventkampus.com',
            'password' => Hash::make('password123'),
            'role'     => 'panitia',
        ]);

        User::create([
            'name'     => 'Panitia UKM Robotika',
            'email'    => 'robotika@eventkampus.com',
            'password' => Hash::make('password123'),
            'role'     => 'panitia',
        ]);

        // Peserta — mahasiswa biasa, hanya lihat & daftar event
        User::create([
            'name'     => 'Budi Santoso',
            'email'    => 'budi@eventkampus.com',
            'password' => Hash::make('password123'),
            'role'     => 'peserta',
        ]);

        User::create([
            'name'     => 'Siti Rahayu',
            'email'    => 'siti@eventkampus.com',
            'password' => Hash::make('password123'),
            'role'     => 'peserta',
        ]);
    }
}
