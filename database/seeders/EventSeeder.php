<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        Event::create([
            'category_id' => 1,
            'title' => 'Seminar AI 2026',
            'location' => 'Aula Utama',
            'event_date' => '2026-05-10',
            'capacity' => 150,
            'status' => 'published'
        ]);

        Event::create([
            'category_id' => 2,
            'title' => 'Workshop Laravel API',
            'location' => 'Lab Komputer',
            'event_date' => '2026-05-15',
            'capacity' => 40,
            'status' => 'draft'
        ]);
    }
}