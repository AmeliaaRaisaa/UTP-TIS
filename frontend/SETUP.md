# Setup Frontend UAP — Event Kampus

## Prasyarat
- Node.js >= 18
- Backend Laravel sudah berjalan di http://localhost:8000
- JWT sudah dikonfigurasi di backend

## Cara Menjalankan

```bash
cd frontend-uap
npm install
npm run dev
```

Buka browser di: http://localhost:5173

---

## Modifikasi Backend yang Diperlukan untuk UAP

### 1. Tambahkan endpoint PUT dan DELETE untuk semua modul

Di `routes/api.php`, tambahkan di setiap grup:

```php
// Contoh untuk categories
Route::put('/categories/{id}',    [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

// Lakukan hal yang sama untuk events, tags, organizer-profiles, users
```

### 2. Tambahkan method update() dan destroy() di setiap controller

Contoh untuk CategoryController:
```php
public function update(Request $request, $id)
{
    $category = Category::find($id);
    if (!$category) return response()->json(['message' => 'Tidak ditemukan'], 404);
    
    $request->validate([
        'name' => 'required|string|unique:categories,name,' . $id,
        'description' => 'nullable|string'
    ]);
    $category->update($request->all());
    return response()->json(['message' => 'Berhasil diperbarui', 'data' => $category]);
}

public function destroy($id)
{
    $category = Category::find($id);
    if (!$category) return response()->json(['message' => 'Tidak ditemukan'], 404);
    $category->delete();
    return response()->json(['message' => 'Berhasil dihapus']);
}
```

### 3. AuthController — endpoint yang diperlukan

```php
// routes/api.php
Route::post('/auth/register',      [AuthController::class, 'register']);
Route::post('/auth/login',         [AuthController::class, 'login']);
Route::post('/auth/logout',        [AuthController::class, 'logout'])->middleware('auth:api');
Route::get('/auth/me',             [AuthController::class, 'getUserProfile'])->middleware('auth:api');
```

Format response login yang diharapkan frontend:
```json
{
  "token": "eyJ0eXAiOiJKV1Q...",
  "user": {
    "id": 1,
    "name": "Admin Event",
    "email": "admin@event.com",
    "role": "admin"
  }
}
```

### 4. Semua endpoint dilindungi auth:api

```php
Route::middleware(['auth:api', 'kelompok.header'])->group(function () {
    // semua route modul di sini
});
```

### 5. Role yang dipakai

| Role      | Akses                                       |
|-----------|---------------------------------------------|
| admin     | Semua fitur termasuk hapus dan manajemen user |
| organizer | Event, kategori, tag, organizer profile (tanpa hapus dan user management) |
| peserta   | Melihat event, kategori, tag (read only)    |

---

## Struktur File Frontend

```
src/
├── api/
│   └── axios.js            ← Konfigurasi axios + JWT interceptor
├── contexts/
│   └── AuthContext.jsx     ← State auth global (login, logout, user, role)
├── components/
│   ├── Layout.jsx          ← Wrapper halaman dengan sidebar
│   ├── Modal.jsx           ← Komponen modal reusable
│   ├── Navbar.jsx          ← Sidebar navigasi dinamis berdasarkan role
│   └── ProtectedRoute.jsx  ← Proteksi route & otorisasi role
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── categories/Categories.jsx
    ├── events/Events.jsx
    ├── tags/Tags.jsx
    ├── users/Users.jsx         ← Hanya admin
    └── organizers/Organizers.jsx ← Admin + organizer
```
