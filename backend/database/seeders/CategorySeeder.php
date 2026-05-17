<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::create([
            'name' => 'Seminar',
            'description' => 'Kategori untuk event seminar kampus'
        ]);

        Category::create([
            'name' => 'Workshop',
            'description' => 'Kategori untuk event workshop dan pelatihan'
        ]);

        Category::create([
            'name' => 'Kompetisi',
            'description' => 'Kategori untuk lomba atau kompetisi mahasiswa'
        ]);
    }
}