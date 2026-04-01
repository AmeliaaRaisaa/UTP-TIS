<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'location',
        'event_date',
        'capacity',
        'status'
    ];

    // relasi ke category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // relasi ke tag (many to many)
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'event_tag');
    }
}