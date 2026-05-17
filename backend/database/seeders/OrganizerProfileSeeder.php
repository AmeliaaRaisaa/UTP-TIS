<?php

namespace Database\Seeders;

use App\Models\OrganizerProfile;
use Illuminate\Database\Seeder;

class OrganizerProfileSeeder extends Seeder
{
    public function run(): void
    {
        // user_id 2 = panitia@eventkampus.com (Panitia BEM FILKOM)
        OrganizerProfile::create([
            'user_id'           => 2,
            'phone'             => '081234567890',
            'organization_name' => 'BEM FILKOM',
            'bio'               => 'Badan Eksekutif Mahasiswa Fakultas Ilmu Komputer',
        ]);

        // user_id 3 = robotika@eventkampus.com (Panitia UKM Robotika)
        OrganizerProfile::create([
            'user_id'           => 3,
            'phone'             => '082345678901',
            'organization_name' => 'UKM Robotika',
            'bio'               => 'Unit Kegiatan Mahasiswa bidang Robotika dan Otomasi',
        ]);
    }
}
