# Ujian Tengah Praktikum

## Teknologi Integrasi Sistem

### Deskripsi

Proyek ini merupakan implementasi REST API menggunakan Laravel dan MySQL untuk mengelola sistem manajemen event kampus. API ini dibuat untuk memenuhi tugas Ujian Tengah Praktikum mata kuliah Teknologi Integrasi Sistem.

Sistem ini mencakup beberapa modul utama yaitu User, Organizer Profile, Category, dan Event dengan relasi antar tabel yang berbeda.

---

### Anggota Kelompok

* Anggota 1: Devi Zhafira Alya Augusta - 245150707111006
* Anggota 2: Alya Hamidah Izzatul Laili - 245150707111018
* Anggota 3: Azzahra Callysta Putri Aditya - 245150707111003
* Anggota 4: Amelia Raisa Arifien - 245150701111004
* Anggota 5: Nofita Rahma Sabillah - 245150701111007

---

### Teknologi

* Laravel
* PHP
* MySQL (XAMPP)
* Thunder Client

---

### Relasi Database

* One-to-One: User memiliki satu Organizer Profile
* One-to-Many: Category memiliki banyak Event
* Many-to-Many: Event memiliki banyak Tag

---

### Instalasi

1. Clone repository

```
git clone https://github.com/username/utp-tis.git
cd utp-tis
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
DB_DATABASE=utp_tis
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migration

```
php artisan migrate
```

7. Jalankan server

```
php artisan serve
```

---

### Endpoint API

#### User

* POST /api/users
* GET /api/users
* GET /api/users/{id}

#### Organizer Profile

* POST /api/organizer-profiles
* GET /api/organizer-profiles
* GET /api/organizer-profiles/{id}

#### Category

* POST /api/categories
* GET /api/categories
* GET /api/categories/{id}

#### Event

* POST /api/events
* GET /api/events
* GET /api/events/{id}

---

### Middleware

Setiap request harus menyertakan header:

```
X-Kelompok: kelompok-anda
```

Jika tidak disertakan, maka request akan ditolak.

---

### Kesimpulan

Proyek ini berhasil mengimplementasikan REST API dengan Laravel yang mencakup berbagai relasi database dan penggunaan middleware, serta dapat diuji menggunakan Thunder Client.
