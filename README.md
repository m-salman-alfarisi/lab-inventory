# LabInventory

**Laboratory Inventory & Borrowing Management System** — aplikasi web untuk mengelola inventaris, peminjaman, dan pengembalian barang laboratorium komputer secara digital.

Dibangun dengan Next.js 16, TypeScript, Tailwind CSS, Prisma, dan PostgreSQL. Aplikasi memiliki dua role dengan hak akses terpisah: **Admin** dan **Staff**.

| | |
| --- | --- |
| **Aplikasi online** | https://lab-inventory-eosin.vercel.app |
| **Repository GitHub** | https://github.com/m-salman-alfarisi/lab-inventory |
| **Status** | ![Online](https://img.shields.io/badge/status-online-059669) |

---

## Demo

| Role  | Username | Password   | Hak Akses                                                                 |
| ----- | -------- | ---------- | ------------------------------------------------------------------------- |
| Admin | `admin`  | `admin123` | Seluruh fitur: dashboard, CRUD barang, transaksi, pengguna, log aktivitas |
| Staff | `staff`  | `staff123` | Dashboard, melihat barang, mencatat peminjaman & pengembalian             |

> Akun demo dibuat otomatis oleh seed. Password disimpan menggunakan hash bcrypt.

---

## Fitur

### Autentikasi & Otorisasi

- Login menggunakan username dan password.
- Session berbasis JWT di cookie `httpOnly`, berlaku 7 hari.
- Pembatasan akses berdasarkan role di level proxy, halaman, dan server action.
- Akun staff nonaktif tidak dapat login.
- Logout dan pengamanan redirect.

### Dashboard

- Total barang dan jumlah kategori.
- Total stok tersedia.
- Jumlah unit yang sedang dipinjam.
- Total transaksi peminjaman dan jumlah transaksi selesai.
- Peringatan peminjaman terlambat.
- Ringkasan transaksi terbaru.
- Daftar stok yang perlu perhatian (stok ≤ batas minimum).
- Log aktivitas terbaru (Admin).
- Aksi cepat untuk Staff.

### Manajemen Barang (Admin)

- Tambah, edit, dan hapus barang.
- Pencarian berdasarkan kode, nama, atau kategori.
- Filter kategori dan pagination.
- Kode barang unik, kategori, stok, stok minimum, dan deskripsi.
- Status stok: Tersedia, Menipis, Habis.
- Barang dengan peminjaman aktif tidak dapat dihapus.
- Riwayat transaksi tetap aman meskipun barang dihapus (snapshot data barang pada transaksi).

### Peminjaman (Admin & Staff)

- Input nama peminjam, kelas/unit, barang, jumlah, tanggal pinjam, dan jatuh tempo.
- Validasi stok di server dan pengurangan stok atomik (aman dari race condition).
- Kode transaksi otomatis: `PJM-YYYYMMDD-XXXX`.
- Status **Dipinjam**, **Terlambat** (dihitung otomatis), dan **Selesai**.
- Filter status, pencarian, dan halaman detail transaksi.

### Pengembalian (Admin & Staff)

- Daftar seluruh barang yang masih dipinjam.
- Pencarian peminjam/barang/kode transaksi.
- Proses pengembalian dengan konfirmasi.
- Stok bertambah otomatis dan status berubah menjadi **Selesai**.
- Ringkasan transaksi aktif, unit dipinjam, dan keterlambatan.

### Manajemen Pengguna (Admin)

- Tambah akun Staff.
- Edit nama, username, email, dan password staff.
- Aktifkan/nonaktifkan akun Staff.
- Pencarian pengguna dan statistik staff aktif/nonaktif.
- Akun Administrator tidak dapat dinonaktifkan dari menu ini.

### Profil & Keamanan

- Setiap pengguna dapat memperbarui nama dan email.
- Ganti password dengan verifikasi password lama.
- Log aktivitas untuk perubahan profil dan password.

### Log Aktivitas (Admin)

- Mencatat login, logout, CRUD barang, transaksi peminjaman, pengembalian, pengelolaan pengguna, dan perubahan profil.
- Pencarian dan filter jenis aktivitas.
- Pagination.

---

## Teknologi

| Lapisan    | Teknologi                          |
| ---------- | ---------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) |
| Bahasa     | TypeScript                         |
| Styling    | Tailwind CSS v4                    |
| Database   | PostgreSQL                         |
| ORM        | Prisma 6                           |
| Auth       | JWT (`jose`) + bcryptjs            |
| Validasi   | Zod                                |
| Ikon       | Lucide React                       |
| Deployment | Vercel + Neon (rekomendasi)        |

---

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20.9 atau lebih baru
- PostgreSQL 14+
- npm

### Langkah

```bash
# 1. Install dependency
npm install

# 2. Salin environment
cp .env.example .env
```

Sesuaikan `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lab_inventory?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/lab_inventory?schema=public"
AUTH_SECRET="secret-acak-minimal-32-karakter"
```

> Untuk lokal, `DATABASE_URL` dan `DIRECT_URL` biasanya sama. Di Neon/Supabase, `DATABASE_URL` memakai pooled connection dan `DIRECT_URL` memakai direct connection agar migrasi berjalan lancar.

Membuat `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# 3. Terapkan migrasi database
npm run db:deploy

# 4. Isi data awal (2 akun demo + 10 barang)
npm run db:seed

# 5. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), lalu login dengan akun demo.

### Perintah Berguna

| Perintah            | Keterangan                                     |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Menjalankan development server                 |
| `npm run build`     | Build produksi + migrasi + seed                |
| `npm start`         | Menjalankan hasil build                        |
| `npm run lint`      | Pemeriksaan ESLint                             |
| `npm run db:deploy` | Menerapkan migrasi                             |
| `npm run db:seed`   | Mengisi data awal (idempotent)                 |
| `npm run db:reset`  | Reset database lokal + migrasi ulang           |
| `npm run db:studio` | Membuka Prisma Studio                          |

> `npm run build` menjalankan `prisma migrate deploy` dan seed agar akun demo serta data awal selalu tersedia pada lingkungan hosting.

---

## Data Awal

Seed membuat **10 barang** (melebihi minimal 5 dari ketentuan):

| Kode  | Nama Barang            | Kategori        | Stok |
| ----- | ---------------------- | --------------- | ---- |
| BR001 | Laptop Lenovo          | Laptop          | 5    |
| BR002 | Mouse Logitech         | Aksesoris       | 10   |
| BR003 | Keyboard Mechanical    | Aksesoris       | 8    |
| BR004 | Proyektor Epson        | Proyektor       | 3    |
| BR005 | Monitor LG             | Monitor         | 6    |
| BR006 | Kabel HDMI             | Kabel & Adaptor | 12   |
| BR007 | Switch TP-Link 8 Port  | Jaringan        | 4    |
| BR008 | Router MikroTik        | Jaringan        | 3    |
| BR009 | Webcam Logitech C920   | Aksesoris       | 5    |
| BR010 | Printer Canon LBP      | Printer         | 2    |

---

## Deployment (Wajib Online)

Aplikasi sudah di-deploy ke **Vercel** dengan database **Neon PostgreSQL**:

- **URL aplikasi:** https://lab-inventory-eosin.vercel.app
- **Repository:** https://github.com/m-salman-alfarisi/lab-inventory

Panduan deployment ulang tersedia di:

**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

Ringkasan:

1. Buat database PostgreSQL di Neon/Supabase.
2. Push repository ke GitHub.
3. Import repository ke Vercel.
4. Tambahkan environment variable `DATABASE_URL` dan `AUTH_SECRET`.
5. Deploy. Build script otomatis menjalankan migrasi dan seed.
6. Uji login Admin dan Staff menggunakan akun demo.

---

## Struktur Proyek

```
.
├── prisma/
│   ├── migrations/          # Migrasi database
│   ├── schema.prisma        # Skema database
│   └── seed.ts              # Data awal
├── src/
│   ├── app/
│   │   ├── (app)/           # Halaman setelah login (dashboard, barang, dll.)
│   │   ├── actions/         # Server actions (auth, barang, transaksi, user)
│   │   ├── login/           # Halaman login
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # Komponen UI & layout
│   ├── lib/                 # Auth, Prisma, validasi, utilitas
│   └── proxy.ts             # Proteksi rute berbasis role
├── .env.example
├── SUBMISSION.md            # Template data pengumpulan
└── package.json
```

---

## Keamanan

- Password di-hash dengan bcrypt (10 rounds).
- Session JWT ditandatangani `AUTH_SECRET` dan disimpan di cookie `httpOnly`, `sameSite=lax`, serta `secure` di produksi.
- Seluruh mutasi data divalidasi ulang di server menggunakan Zod.
- Otorisasi diperiksa di server action, bukan hanya di UI.
- Stok dikurangi/ditambah dalam transaksi database untuk mencegah data tidak konsisten.
- Server action Next.js memiliki perlindungan origin/CSRF bawaan.
- Halaman admin tidak dapat diakses Staff meskipun URL diketik langsung.

---

## Lisensi

Dibuat untuk keperluan **Coding Talent Challenge**. Silakan gunakan dan kembangkan sesuai kebutuhan.
