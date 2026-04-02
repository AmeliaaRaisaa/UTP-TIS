# Ujian Tengah Praktikum

## Teknologi Integrasi Sistem

### Deskripsi

Proyek ini merupakan implementasi REST API menggunakan Laravel dan MySQL untuk mengelola sistem manajemen event kampus. API ini dibuat untuk memenuhi tugas Ujian Tengah Praktikum mata kuliah Teknologi Integrasi Sistem.

Sistem ini mencakup 5 modul utama yaitu User, Organizer Profile, Category, Event, dan Tag dengan relasi antar tabel yang beragam (One-to-One, One-to-Many, Many-to-Many).

---

### Anggota Kelompok

* Devi Zhafira Alya Augusta - 245150707111006 - Modul User
* Alya Hamidah Izzatul Laili - 245150707111018 - Modul Organizer Profile
* Azzahra Callysta Putri Aditya - 245150707111003 - Modul Category
* Amelia Raisa Arifien - 245150701111004 - Modul Event
* Nofita Rahma Sabillah - 245150701111007 - Modul Tag & Pivot Event-Tag

---

### Teknologi

* Laravel 11
* PHP
* MySQL (XAMPP)
* Thunder Client

---

### Relasi Database

* One-to-One: `users`, `organizer_profiles`
* One-to-Many: `categories`, `events`
* Many-to-Many: `events`, `tags` (pivot: `event_tag`)

---

### Rancangan Tabel

#### users
* id: bigint (PK)
* name: string
* email: string (unique)
* password: string
* role: string
* timestamps

#### organizer_profiles
* id: bigint (PK)
* user_id: bigint (FK → users)
* phone: string
* organization_name: string
* bio: text (nullable)
* timestamps

#### categories
* id: bigint (PK)
* name: string
* description: text (nullable)
* timestamps

#### events
* id: bigint (PK)
* category_id: bigint (FK → categories)
* title: string
* location: string
* event_date: date
* capacity: integer
* status: enum (draft, published, closed)
* timestamps

#### tags
* id: bigint (PK)
* name: string (unique)
* color: string(7) — format #RRGGBB
* timestamps

#### event_tag (pivot)
* event_id: bigint (FK → events)
* tag_id: bigint (FK → tags)

---

### Instalasi

1. Clone repository

```
git clone https://github.com/AmeliaaRaisaa/UTP-TIS.git
cd UTP-TIS
```

2. Install dependency

```
composer install
```

3. Copy file environment

```
cp .env.example .env
```

4. Generate key

```
php artisan key:generate
```

5. Atur database pada file `.env`

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=utp_tis
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migration dan seeder

```
php artisan migrate:fresh --seed
```

7. Jalankan server

```
php artisan serve
```

8. Buka dokumentasi API (Scramble)

```
http://127.0.0.1:8000/docs/api
```

---

### Endpoint API

#### User (Anggota 1)
- POST /api/users : Tambah user baru
- GET /api/users : Tampilkan semua user
- GET /api/users/{id} : Tampilkan user by ID

#### Organizer Profile (Anggota 2)
- POST /api/organizer-profiles : Tambah organizer profile
- GET /api/organizer-profiles : Tampilkan semua organizer profile
- GET /api/organizer-profiles/{id} : Tampilkan organizer profile by ID

#### Category (Anggota 3)
- POST /api/categories : Tambah category baru
- GET /api/categories : Tampilkan semua category
- GET /api/categories/{id} : Tampilkan category by ID

#### Event (Anggota 4)
- POST /api/events : Tambah event baru
- GET /api/events : Tampilkan semua event
- GET /api/events/{id} : Tampilkan event by ID

#### Tag (Anggota 5)
- POST /api/tags : Tambah tag baru
- GET /api/tags : Tampilkan semua tag
- GET /api/tags/{id} : Tampilkan tag by ID (beserta events)
- PUT /api/events/{eventId}/tags/{tagId} : Attach tag ke event

---

### Middleware

Setiap request wajib menyertakan header:

```
X-Kelompok: kelompok-6
```

Jika tidak disertakan, request akan ditolak dengan response `403`.

* CheckKelompokHeader (`kelompok.header`)
  - Semua endpoint
  - Validasi header X-Kelompok
* EnsurePhoneNumeric (`phone.numeric`)
  - /organizer-profiles
  - Validasi nomor telepon hanya angka
* EnsureCategoryActiveHeader (`category.header`)
  - /categories
  - Validasi header X-Category-Access: allowed
* EnsureCapacityPositive (`capacity.positive`)
  - /events
  - Validasi capacity harus lebih dari 0
* EnsureHexColor (`hex.color`)
  - /tags
  - Validasi color harus format hex (#RRGGBB)

Header tambahan untuk Category:

```
X-Category-Access: allowed
```

---

### Dokumentasi API

Dokumentasi API tersedia secara otomatis menggunakan Scramble.

Setelah server berjalan, buka:

```
http://127.0.0.1:8000/docs/api
```

---

### Kesimpulan

Proyek ini berhasil mengimplementasikan REST API dengan Laravel yang mencakup tiga jenis relasi database (One-to-One, One-to-Many, Many-to-Many), lima modul dengan pembagian tugas yang jelas, middleware per modul, serta dokumentasi API otomatis menggunakan Scramble. Seluruh endpoint dapat diuji menggunakan Thunder Client maupun melalui halaman dokumentasi Scramble.
