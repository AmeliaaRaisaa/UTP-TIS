<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        Tag::create(['name' => 'Teknologi', 'color' => '#FF5733']);
        Tag::create(['name' => 'Gratis',    'color' => '#33A1FF']);
    }
}
