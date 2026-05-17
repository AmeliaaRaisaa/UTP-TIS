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
            'data'    => Event::with(['category', 'tags', 'creator:id,name'])->get(),
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

        $event = Event::create([
            'category_id' => $request->category_id,
            'created_by'  => auth('api')->id(),
            'title'       => $request->title,
            'location'    => $request->location,
            'event_date'  => $request->event_date,
            'capacity'    => $request->capacity,
            'status'      => $request->status ?? 'draft',
        ]);

        return response()->json([
            'message' => 'Event berhasil dibuat',
            'data'    => $event->load(['category', 'tags', 'creator:id,name']),
        ], 201);
    }

    public function show($id)
    {
        $event = Event::with(['category', 'tags', 'creator:id,name'])->find($id);

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

        $user = auth('api')->user();

        // Panitia hanya bisa edit event yang dia buat sendiri
        if ($user->role === 'panitia' && $event->created_by !== $user->id) {
            return response()->json([
                'message' => 'Akses ditolak. Kamu hanya bisa mengedit event yang kamu buat.',
            ], 403);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title'       => 'sometimes|string',
            'location'    => 'sometimes|string',
            'event_date'  => 'sometimes|date',
            'capacity'    => 'sometimes|integer|min:1',
            'status'      => 'sometimes|in:draft,published,closed',
        ]);

        $event->update($request->only(
            'category_id', 'title', 'location', 'event_date', 'capacity', 'status'
        ));

        return response()->json([
            'message' => 'Event berhasil diperbarui',
            'data'    => $event->load(['category', 'tags', 'creator:id,name']),
        ]);
    }

    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $user = auth('api')->user();

        // Panitia hanya bisa hapus event yang dia buat sendiri
        if ($user->role === 'panitia' && $event->created_by !== $user->id) {
            return response()->json([
                'message' => 'Akses ditolak. Kamu hanya bisa menghapus event yang kamu buat.',
            ], 403);
        }

        $event->delete();

        return response()->json(['message' => 'Event berhasil dihapus']);
    }
}
