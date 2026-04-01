<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerProfile;
use Illuminate\Http\Request;

class OrganizerProfileController extends Controller
{
    public function index()
    {
        return response()->json(
            OrganizerProfile::with('user')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:organizer_profiles,user_id',
            'phone' => 'required|string',
            'organization_name' => 'required|string',
            'bio' => 'nullable|string'
        ]);

        $profile = OrganizerProfile::create([
            'user_id' => $request->user_id,
            'phone' => $request->phone,
            'organization_name' => $request->organization_name,
            'bio' => $request->bio
        ]);

        return response()->json([
            'message' => 'Organizer profile berhasil dibuat',
            'data' => $profile
        ], 201);
    }

    public function show($id)
    {
        $profile = OrganizerProfile::with('user')->find($id);

        if (!$profile) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json($profile);
    }
}