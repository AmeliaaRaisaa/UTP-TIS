<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    /**
     * GET /api/registrations
     * - Admin: semua registrasi
     * - Panitia: hanya registrasi dari event miliknya
     */
    public function index(Request $request)
    {
        $user = auth('api')->user();

        if ($user->role === 'admin') {
            $registrations = Registration::with(['event', 'user'])->latest()->get();
        } else {
            // Panitia hanya lihat registrasi event yang dia buat
            $registrations = Registration::with(['event', 'user'])
                ->whereHas('event', fn($q) => $q->where('created_by', $user->id))
                ->latest()
                ->get();
        }

        return response()->json([
            'message' => 'Daftar registrasi',
            'data'    => $registrations,
        ]);
    }

    /**
     * GET /api/registrations/my
     * - Peserta: lihat registrasi milik sendiri
     */
    public function myRegistrations()
    {
        $user = auth('api')->user();

        $registrations = Registration::with(['event.category', 'event.tags'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Registrasi saya',
            'data'    => $registrations,
        ]);
    }

    /**
     * POST /api/registrations
     * - Peserta: daftar ke event
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
        ]);

        $user  = auth('api')->user();
        $event = Event::find($request->event_id);

        if ($event->status !== 'published') {
            return response()->json(['message' => 'Event tidak tersedia untuk pendaftaran.'], 422);
        }

        // Cek kapasitas
        $registered = Registration::where('event_id', $event->id)
            ->whereIn('status', ['pending', 'approved'])
            ->count();

        if ($registered >= $event->capacity) {
            return response()->json(['message' => 'Kapasitas event sudah penuh.'], 422);
        }

        // Cek duplikat
        $exists = Registration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Kamu sudah mendaftar ke event ini.'], 422);
        }

        $registration = Registration::create([
            'event_id' => $event->id,
            'user_id'  => $user->id,
            'status'   => 'pending',
        ]);

        return response()->json([
            'message' => 'Berhasil mendaftar ke event.',
            'data'    => $registration->load('event'),
        ], 201);
    }

    /**
     * PUT /api/registrations/{id}
     * - Panitia: approve atau reject registrasi event miliknya
     * - Admin: approve atau reject semua
     */
    public function update(Request $request, $id)
    {
        $registration = Registration::with('event')->find($id);

        if (!$registration) {
            return response()->json(['message' => 'Registrasi tidak ditemukan.'], 404);
        }

        $user = auth('api')->user();

        // Panitia hanya bisa update registrasi event miliknya
        if ($user->role === 'panitia' && $registration->event->created_by !== $user->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'note'   => 'nullable|string|max:500',
        ]);

        $registration->update([
            'status' => $request->status,
            'note'   => $request->note,
        ]);

        return response()->json([
            'message' => 'Status registrasi diperbarui.',
            'data'    => $registration->load(['event', 'user']),
        ]);
    }

    /**
     * DELETE /api/registrations/{id}
     * - Peserta: batalkan pendaftaran sendiri (hanya jika masih pending)
     */
    public function destroy($id)
    {
        $user         = auth('api')->user();
        $registration = Registration::find($id);

        if (!$registration) {
            return response()->json(['message' => 'Registrasi tidak ditemukan.'], 404);
        }

        if ($registration->user_id !== $user->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if ($registration->status !== 'pending') {
            return response()->json(['message' => 'Hanya registrasi berstatus pending yang bisa dibatalkan.'], 422);
        }

        $registration->delete();

        return response()->json(['message' => 'Registrasi berhasil dibatalkan.']);
    }

    /**
     * GET /api/events/{id}/registrations
     * - Admin & Panitia: lihat registrasi per event
     */
    public function byEvent($eventId)
    {
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan.'], 404);
        }

        $user = auth('api')->user();

        if ($user->role === 'panitia' && $event->created_by !== $user->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $registrations = Registration::with('user')
            ->where('event_id', $eventId)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Registrasi event',
            'data'    => $registrations,
        ]);
    }

    /**
     * GET /api/dashboard/stats
     * Stats untuk admin dan panitia
     */
    public function stats()
    {
        $user = auth('api')->user();

        if ($user->role === 'admin') {
            $totalEvents        = \App\Models\Event::count();
            $totalUsers         = \App\Models\User::count();
            $totalRegistrations = Registration::count();
            $totalCategories    = \App\Models\Category::count();

            $byStatus = Registration::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $byCategory = \App\Models\Category::withCount('events')->get()
                ->map(fn($c) => ['name' => $c->name, 'total' => $c->events_count]);

            return response()->json([
                'message' => 'Statistik admin',
                'data'    => compact(
                    'totalEvents', 'totalUsers',
                    'totalRegistrations', 'totalCategories',
                    'byStatus', 'byCategory'
                ),
            ]);
        }

        // Panitia — hanya data event miliknya
        $myEvents           = \App\Models\Event::where('created_by', $user->id)->count();
        $myRegistrations    = Registration::whereHas('event', fn($q) => $q->where('created_by', $user->id))->count();
        $pendingRegistrations = Registration::whereHas('event', fn($q) => $q->where('created_by', $user->id))
            ->where('status', 'pending')->count();

        return response()->json([
            'message' => 'Statistik panitia',
            'data'    => compact('myEvents', 'myRegistrations', 'pendingRegistrations'),
        ]);
    }
}
