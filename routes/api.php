<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganizerProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;

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
Route::middleware(['kelompok.header', 'category.header'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
});
Route::middleware(['kelompok.header', 'capacity.positive'])->group(function () {

    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{id}', [EventController::class, 'show']);

});