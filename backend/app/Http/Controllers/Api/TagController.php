<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Daftar semua tag berhasil diambil',
            'data'    => Tag::with('events')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|unique:tags,name',
            'color' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
        ]);

        $tag = Tag::create($request->only('name', 'color'));

        return response()->json([
            'message' => 'Tag berhasil dibuat',
            'data'    => $tag,
        ], 201);
    }

    public function show($id)
    {
        $tag = Tag::with('events')->find($id);

        if (!$tag) {
            return response()->json(['message' => 'Tag tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail tag',
            'data'    => $tag,
        ]);
    }

    public function update(Request $request, $id)
    {
        $tag = Tag::find($id);

        if (!$tag) {
            return response()->json(['message' => 'Tag tidak ditemukan'], 404);
        }

        $request->validate([
            'name'  => 'sometimes|string|unique:tags,name,' . $id,
            'color' => ['sometimes', 'regex:/^#[A-Fa-f0-9]{6}$/'],
        ]);

        $tag->update($request->only('name', 'color'));

        return response()->json([
            'message' => 'Tag berhasil diperbarui',
            'data'    => $tag,
        ]);
    }

    public function destroy($id)
    {
        $tag = Tag::find($id);

        if (!$tag) {
            return response()->json(['message' => 'Tag tidak ditemukan'], 404);
        }

        $tag->delete();

        return response()->json(['message' => 'Tag berhasil dihapus']);
    }

    public function attachTagToEvent($eventId, $tagId)
    {
        $event = Event::find($eventId);
        $tag   = Tag::find($tagId);

        if (!$event || !$tag) {
            return response()->json(['message' => 'Event atau Tag tidak ditemukan'], 404);
        }

        $event->tags()->syncWithoutDetaching([$tagId]);

        return response()->json([
            'message' => 'Tag berhasil ditambahkan ke event',
            'data'    => $event->load('tags'),
        ]);
    }
}
