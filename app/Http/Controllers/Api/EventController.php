<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // GET semua event
    public function index()
    {
        $events = Event::with(['category', 'tags'])->get();

        return response()->json([
            'message' => 'Daftar event',
            'data' => $events
        ]);
    }

    // POST tambah event
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string',
            'location' => 'required|string',
            'event_date' => 'required|date',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|in:draft,published,closed'
        ]);

        $event = Event::create($request->all());

        return response()->json([
            'message' => 'Event berhasil dibuat',
            'data' => $event
        ], 201);
    }

    // GET by ID
    public function show($id)
    {
        $event = Event::with(['category', 'tags'])->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        return response()->json($event);
    }
}