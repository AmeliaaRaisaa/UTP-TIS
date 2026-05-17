<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganizerProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\RegistrationController;

// ─── Auth (publik) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::middleware('auth:api')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'getUserProfile']);
});

// ─── Modul (semua butuh login) ────────────────────────────────────────────────
Route::middleware(['auth:api', 'kelompok.header'])->group(function () {

    // ── Dashboard stats ──────────────────────────────────────────────────────
    Route::get('/dashboard/stats', [RegistrationController::class, 'stats'])
        ->middleware('role:admin,panitia');

    // ── Users ────────────────────────────────────────────────────────────────
    Route::get('/users',                        [UserController::class, 'index']);
    Route::post('/users',                       [UserController::class, 'store'])->middleware('role:admin');
    Route::get('/users/{id}',                   [UserController::class, 'show']);
    Route::put('/users/{id}',                   [UserController::class, 'update'])->middleware('role:admin');
    Route::put('/users/{id}/role',              [UserController::class, 'updateRole'])->middleware('role:admin');
    Route::delete('/users/{id}',                [UserController::class, 'destroy'])->middleware('role:admin');

    // ── Organizer Profiles ───────────────────────────────────────────────────
    Route::middleware('phone.numeric')->group(function () {
        Route::get('/organizer-profiles',         [OrganizerProfileController::class, 'index']);
        Route::post('/organizer-profiles',        [OrganizerProfileController::class, 'store'])->middleware('role:admin,panitia');
        Route::get('/organizer-profiles/{id}',    [OrganizerProfileController::class, 'show']);
        Route::put('/organizer-profiles/{id}',    [OrganizerProfileController::class, 'update'])->middleware('role:admin,panitia');
        Route::delete('/organizer-profiles/{id}', [OrganizerProfileController::class, 'destroy'])->middleware('role:admin');
    });

    // ── Categories ───────────────────────────────────────────────────────────
    Route::middleware('category.header')->group(function () {
        Route::get('/categories',         [CategoryController::class, 'index']);
        Route::post('/categories',        [CategoryController::class, 'store'])->middleware('role:admin');
        Route::get('/categories/{id}',    [CategoryController::class, 'show']);
        Route::put('/categories/{id}',    [CategoryController::class, 'update'])->middleware('role:admin');
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->middleware('role:admin');
    });

    // ── Events ───────────────────────────────────────────────────────────────
    Route::middleware('capacity.positive')->group(function () {
        Route::get('/events',         [EventController::class, 'index']);
        Route::post('/events',        [EventController::class, 'store'])->middleware('role:admin,panitia');
        Route::get('/events/{id}',    [EventController::class, 'show']);
        Route::put('/events/{id}',    [EventController::class, 'update'])->middleware('role:admin,panitia');
        Route::delete('/events/{id}', [EventController::class, 'destroy'])->middleware('role:admin,panitia');

        // Registrasi per event (admin & panitia)
        Route::get('/events/{id}/registrations', [RegistrationController::class, 'byEvent'])
            ->middleware('role:admin,panitia');
    });

    // ── Tags ─────────────────────────────────────────────────────────────────
    Route::middleware('hex.color')->group(function () {
        Route::get('/tags',         [TagController::class, 'index']);
        Route::post('/tags',        [TagController::class, 'store'])->middleware('role:admin,panitia');
        Route::get('/tags/{id}',    [TagController::class, 'show']);
        Route::put('/tags/{id}',    [TagController::class, 'update'])->middleware('role:admin,panitia');
        Route::delete('/tags/{id}', [TagController::class, 'destroy'])->middleware('role:admin');
        Route::put('/events/{eventId}/tags/{tagId}', [TagController::class, 'attachTagToEvent'])
            ->middleware('role:admin,panitia');
    });

    // ── Registrasi ───────────────────────────────────────────────────────────
    // Peserta: daftar event & lihat registrasi sendiri & batalkan
    Route::post('/registrations',          [RegistrationController::class, 'store'])->middleware('role:peserta');
    Route::get('/registrations/my',        [RegistrationController::class, 'myRegistrations']);
    Route::delete('/registrations/{id}',   [RegistrationController::class, 'destroy'])->middleware('role:peserta');

    // Admin & Panitia: lihat semua / update status
    Route::get('/registrations',           [RegistrationController::class, 'index'])->middleware('role:admin,panitia');
    Route::put('/registrations/{id}',      [RegistrationController::class, 'update'])->middleware('role:admin,panitia');
});
