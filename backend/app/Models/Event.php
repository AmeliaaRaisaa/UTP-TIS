<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'created_by',
        'title',
        'location',
        'event_date',
        'capacity',
        'status',
    ];

    // Relasi ke category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relasi ke user yang membuat event
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi ke tag (many to many)
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'event_tag');
    }

    // Relasi ke registrasi peserta
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}
