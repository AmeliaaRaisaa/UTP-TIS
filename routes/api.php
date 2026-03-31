<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganizerProfileController;

Route::middleware('kelompok.header')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
});
Route::middleware(['phone.numeric'])->group(function () {
    Route::get('/organizer-profiles', [OrganizerProfileController::class, 'index']);
    Route::post('/organizer-profiles', [OrganizerProfileController::class, 'store']);
    Route::get('/organizer-profiles/{id}', [OrganizerProfileController::class, 'show']);
});