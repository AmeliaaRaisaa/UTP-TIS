<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Daftar event',
            'data'    => Event::with(['category', 'tags'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string',
            'location'    => 'required|string',
            'event_date'  => 'required|date',
            'capacity'    => 'required|integer|min:1',
            'status'      => 'nullable|in:draft,published,closed',
        ]);

        $event = Event::create($request->all());

        return response()->json([
            'message' => 'Event berhasil dibuat',
            'data'    => $event,
        ], 201);
    }

    public function show($id)
    {
        $event = Event::with(['category', 'tags'])->find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail event',
            'data'    => $event,
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title'       => 'sometimes|string',
            'location'    => 'sometimes|string',
            'event_date'  => 'sometimes|date',
            'capacity'    => 'sometimes|integer|min:1',
            'status'      => 'sometimes|in:draft,published,closed',
        ]);

        $event->update($request->all());

        return response()->json([
            'message' => 'Event berhasil diperbarui',
            'data'    => $event->load(['category', 'tags']),
        ]);
    }

    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $event->delete();

        return response()->json(['message' => 'Event berhasil dihapus']);
    }
}
