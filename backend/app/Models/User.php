<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // Nilai enum yang valid untuk role
    const ROLES = ['admin', 'panitia', 'peserta'];

    // Relasi one-to-one ke OrganizerProfile
    public function organizerProfile()
    {
        return $this->hasOne(OrganizerProfile::class);
    }

    // Relasi ke registrasi event
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    // Helper: cek apakah user adalah admin (superuser)
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Helper: cek apakah user adalah panitia atau admin
    public function isPanitia(): bool
    {
        return in_array($this->role, ['admin', 'panitia']);
    }

    // Helper: cek apakah user adalah peserta
    public function isPeserta(): bool
    {
        return $this->role === 'peserta';
    }

    // Wajib untuk JWTSubject
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
