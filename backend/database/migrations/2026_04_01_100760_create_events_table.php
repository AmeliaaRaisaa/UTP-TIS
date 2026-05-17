<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            // relasi ke category
            $table->foreignId('category_id')
                  ->constrained()
                  ->onDelete('cascade');

            // relasi ke user yang membuat event (panitia/admin)
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->string('title');
            $table->string('location');
            $table->date('event_date');

            $table->integer('capacity');

            $table->enum('status', ['draft', 'published', 'closed'])
                  ->default('draft');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};