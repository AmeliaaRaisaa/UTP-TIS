<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganizerProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TagController;

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

    // Users — hanya admin yang bisa hapus
    Route::get('/users',          [UserController::class, 'index']);
    Route::post('/users',         [UserController::class, 'store']);
    Route::get('/users/{id}',     [UserController::class, 'show']);
    Route::put('/users/{id}',     [UserController::class, 'update']);
    Route::delete('/users/{id}',  [UserController::class, 'destroy'])->middleware('role:admin');

    // Organizer Profiles
    Route::middleware('phone.numeric')->group(function () {
        Route::get('/organizer-profiles',        [OrganizerProfileController::class, 'index']);
        Route::post('/organizer-profiles',       [OrganizerProfileController::class, 'store']);
        Route::get('/organizer-profiles/{id}',   [OrganizerProfileController::class, 'show']);
        Route::put('/organizer-profiles/{id}',   [OrganizerProfileController::class, 'update']);
        Route::delete('/organizer-profiles/{id}',[OrganizerProfileController::class, 'destroy'])->middleware('role:admin');
    });

    // Categories
    Route::middleware('category.header')->group(function () {
        Route::get('/categories',        [CategoryController::class, 'index']);
        Route::post('/categories',       [CategoryController::class, 'store'])->middleware('role:admin,organizer');
        Route::get('/categories/{id}',   [CategoryController::class, 'show']);
        Route::put('/categories/{id}',   [CategoryController::class, 'update'])->middleware('role:admin,organizer');
        Route::delete('/categories/{id}',[CategoryController::class, 'destroy'])->middleware('role:admin');
    });

    // Events
    Route::middleware('capacity.positive')->group(function () {
        Route::get('/events',        [EventController::class, 'index']);
        Route::post('/events',       [EventController::class, 'store'])->middleware('role:admin,organizer');
        Route::get('/events/{id}',   [EventController::class, 'show']);
        Route::put('/events/{id}',   [EventController::class, 'update'])->middleware('role:admin,organizer');
        Route::delete('/events/{id}',[EventController::class, 'destroy'])->middleware('role:admin');
    });

    // Tags
    Route::middleware('hex.color')->group(function () {
        Route::get('/tags',        [TagController::class, 'index']);
        Route::post('/tags',       [TagController::class, 'store'])->middleware('role:admin,organizer');
        Route::get('/tags/{id}',   [TagController::class, 'show']);
        Route::put('/tags/{id}',   [TagController::class, 'update'])->middleware('role:admin,organizer');
        Route::delete('/tags/{id}',[TagController::class, 'destroy'])->middleware('role:admin');
        Route::put('/events/{eventId}/tags/{tagId}', [TagController::class, 'attachTagToEvent'])->middleware('role:admin,organizer');
    });
});
