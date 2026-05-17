<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        // Dibuat oleh Panitia BEM FILKOM (user_id 2)
        Event::create([
            'category_id' => 1,
            'created_by'  => 2,
            'title'       => 'Seminar AI 2026',
            'location'    => 'Aula Utama',
            'event_date'  => '2026-06-10',
            'capacity'    => 150,
            'status'      => 'published',
        ]);

        // Dibuat oleh Panitia UKM Robotika (user_id 3)
        Event::create([
            'category_id' => 2,
            'created_by'  => 3,
            'title'       => 'Workshop Laravel API',
            'location'    => 'Lab Komputer',
            'event_date'  => '2026-06-15',
            'capacity'    => 40,
            'status'      => 'draft',
        ]);

        // Dibuat oleh Admin (user_id 1)
        Event::create([
            'category_id' => 3,
            'created_by'  => 1,
            'title'       => 'Kompetisi Programming 2026',
            'location'    => 'Gedung C Lantai 3',
            'event_date'  => '2026-07-01',
            'capacity'    => 100,
            'status'      => 'published',
        ]);
    }
}
