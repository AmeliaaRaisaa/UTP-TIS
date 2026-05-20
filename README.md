# Ujian Tengah Praktikum — Teknologi Integrasi Sistem

Sistem Manajemen Event Kampus berbasis REST API (Laravel 11) dan antarmuka web (React + Vite).

---

## Anggota Kelompok 6

| Nama | NIM | Modul |
|------|-----|-------|
| Devi Zhafira Alya Augusta | 245150707111006 | User |
| Alya Hamidah Izzatul Laili | 245150707111018 | Organizer Profile |
| Azzahra Callysta Putri Aditya | 245150707111003 | Category |
| Amelia Raisa Arifien | 245150701111004 | Event |
| Nofita Rahma Sabillah | 245150701111007 | Tag & Pivot Event-Tag |

---

## Struktur Proyek

```
UTP-TIS/
├── backend/     ← Laravel 11 REST API
└── frontend/    ← React 18 + Vite
```

---

## Teknologi

- **Backend**: Laravel 11, PHP 8.2, MySQL, JWT Auth, Scramble (API docs)
- **Frontend**: React 18, Vite, Axios, React Router DOM

---

## Relasi Database

- **One-to-One**: `users` ↔ `organizer_profiles`
- **One-to-Many**: `categories` → `events`
- **Many-to-Many**: `events` ↔ `tags` (pivot: `event_tag`)

---

## Instalasi & Menjalankan

### Backend

```bash
cd backend

# Install dependency
composer install

# Copy file environment
cp .env.example .env

# Generate key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Atur database di .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=utp_tis
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migration dan seeder
php artisan migrate:fresh --seed

# Jalankan server (default: http://localhost:8000)
php artisan serve
```

**Akun default setelah seeder:**

| Email | Password | Role |
|-------|----------|------|
| admin@eventkampus.com | password123 | admin |
| panitia@eventkampus.com | password123 | panitia |
| siti@eventkampus.com | password123 | peserta |

### Frontend

```bash
cd frontend

# Install dependency
npm install

# Jalankan dev server (default: http://localhost:5173)
npm run dev
```

---

## Dokumentasi API

Setelah backend berjalan, buka:

```
http://localhost:8000/docs/api
```

---

## Endpoint API

Semua endpoint (kecuali auth) memerlukan:
- Header `Authorization: Bearer <token>`
- Header `X-Kelompok: kelompok-6`

### Auth (publik)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, mendapat JWT token |
| POST | `/api/auth/logout` | Logout (butuh auth) |
| GET | `/api/auth/me` | Profil user aktif |

### Users
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/users` | semua |
| POST | `/api/users` | semua |
| GET | `/api/users/{id}` | semua |
| PUT | `/api/users/{id}` | semua |
| DELETE | `/api/users/{id}` | admin |

### Organizer Profiles
*(Butuh header tambahan: nomor telepon hanya angka)*

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/organizer-profiles` | semua |
| POST | `/api/organizer-profiles` | semua |
| GET | `/api/organizer-profiles/{id}` | semua |
| PUT | `/api/organizer-profiles/{id}` | semua |
| DELETE | `/api/organizer-profiles/{id}` | admin |

### Categories
*(Butuh header tambahan: `X-Category-Access: allowed`)*

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/categories` | semua |
| POST | `/api/categories` | admin, organizer |
| GET | `/api/categories/{id}` | semua |
| PUT | `/api/categories/{id}` | admin, organizer |
| DELETE | `/api/categories/{id}` | admin |

### Events

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/events` | semua |
| POST | `/api/events` | admin, organizer |
| GET | `/api/events/{id}` | semua |
| PUT | `/api/events/{id}` | admin, organizer |
| DELETE | `/api/events/{id}` | admin |

### Tags

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/tags` | semua |
| POST | `/api/tags` | admin, organizer |
| GET | `/api/tags/{id}` | semua |
| PUT | `/api/tags/{id}` | admin, organizer |
| DELETE | `/api/tags/{id}` | admin |
| PUT | `/api/events/{eventId}/tags/{tagId}` | admin, organizer |

---

## Middleware

| Alias | Berlaku pada | Validasi |
|-------|-------------|----------|
| `kelompok.header` | Semua endpoint | Header `X-Kelompok: kelompok-6` |
| `role` | Endpoint tertentu | Role user (admin/organizer/peserta) |
| `phone.numeric` | `/organizer-profiles` | Nomor telepon hanya angka |
| `category.header` | `/categories` | Header `X-Category-Access: allowed` |
| `capacity.positive` | `/events` | Capacity > 0 |
| `hex.color` | `/tags` | Format warna `#RRGGBB` |
