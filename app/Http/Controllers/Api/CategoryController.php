<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Daftar semua category berhasil diambil',
            'data'    => Category::with('events')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($request->only('name', 'description'));

        return response()->json([
            'message' => 'Category berhasil ditambahkan',
            'data'    => $category,
        ], 201);
    }

    public function show($id)
    {
        $category = Category::with('events')->find($id);

        if (!$category) {
            return response()->json(['message' => 'Category tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail category berhasil diambil',
            'data'    => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category tidak ditemukan'], 404);
        }

        $request->validate([
            'name'        => 'required|string|unique:categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $category->update($request->only('name', 'description'));

        return response()->json([
            'message' => 'Category berhasil diperbarui',
            'data'    => $category,
        ]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category tidak ditemukan'], 404);
        }

        $category->delete();

        return response()->json(['message' => 'Category berhasil dihapus']);
    }
}
