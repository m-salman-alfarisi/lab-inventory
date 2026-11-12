# Panduan Deployment

Panduan ini menggunakan **Vercel** (hosting) dan **Neon** (PostgreSQL), keduanya memiliki paket gratis yang cukup untuk kebutuhan demo challenge.

## 1. Siapkan Database PostgreSQL

### Opsi A — Neon (rekomendasi)

1. Buka [https://neon.com](https://neon.com) dan daftar/login.
2. Buat project baru, pilih region terdekat (contoh: Singapore).
3. Buka **Connection Details** dan salin **direct connection string**.
4. Tambahkan `?sslmode=require` di akhir URL.

Contoh:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

> Gunakan **direct connection** (bukan pooled) agar `prisma migrate deploy` dapat berjalan saat build.

### Opsi B — Supabase

1. Buat project di [https://supabase.com](https://supabase.com).
2. Buka **Project Settings → Database → Connection string**.
3. Gunakan connection string **Session pooler / Direct** untuk `DATABASE_URL`.
4. Pastikan URL menggunakan `?sslmode=require`.

> Untuk Supabase, hindari transaction pooler (port 6543) pada proses migrasi.

## 2. Siapkan Repository GitHub

Jika belum ada repository:

```bash
git init
git add .
git commit -m "feat: laboratorium inventory & borrowing management system"
git branch -M main
git remote add origin https://github.com/USERNAME/lab-inventory.git
git push -u origin main
```

Pastikan file `.env` **tidak** ikut ter-commit. File `.env.example` aman untuk di-commit.

## 3. Deploy ke Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login.
2. Klik **Add New → Project**, lalu import repository GitHub.
3. Framework Preset: **Next.js** (terdeteksi otomatis).
4. Tambahkan environment variable:

| Name           | Value                                            |
| -------------- | ------------------------------------------------ |
| `DATABASE_URL` | Connection string PostgreSQL dari Neon/Supabase   |
| `AUTH_SECRET`  | String acak minimal 32 karakter                  |

Membuat `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Klik **Deploy**.

Build command otomatis dari `package.json`:

```
prisma generate && prisma migrate deploy && tsx prisma/seed.ts && next build
```

Artinya tabel database dibuat, data awal diisi, dan aplikasi di-build dalam satu proses.

## 4. Verifikasi Setelah Deploy

1. Buka URL publik Vercel.
2. Login sebagai Admin: `admin` / `admin123`.
3. Login sebagai Staff: `staff` / `staff123`.
4. Uji alur:
   - Tambah barang.
   - Catat peminjaman → stok berkurang.
   - Proses pengembalian → stok bertambah dan status selesai.
   - Nonaktifkan staff → login staff tersebut ditolak.
5. Pastikan URL dapat dibuka dari perangkat lain (bukan localhost).

## 5. Deployment Ulang

Setiap `git push` ke branch `main`, Vercel akan build dan deploy ulang. Migrasi dan seed dijalankan kembali secara idempotent:

- Migrasi yang sudah diterapkan tidak diulang.
- Seed memperbarui akun demo dan hanya menambahkan barang yang belum ada.
- Data transaksi yang sudah ada tidak dihapus.

## 6. Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Build gagal `P1001: Can't reach database server` | Periksa `DATABASE_URL`, pastikan database aktif dan `sslmode=require` |
| Build gagal saat migrasi | Gunakan direct connection, bukan transaction pooler |
| Login selalu gagal di production | Pastikan `AUTH_SECRET` sudah diset dan deploy ulang |
| Akun demo tidak ditemukan | Pastikan seed berjalan; cek build log, atau jalankan `npm run db:seed` dengan `DATABASE_URL` production |
| Halaman error 500 | Cek **Vercel → Deployments → Functions → Logs** |
| Session hilang setelah deploy | Normal jika `AUTH_SECRET` berubah; login ulang |
| Perubahan password demo tidak bertahan setelah redeploy | Seed mengembalikan password demo ke `admin123` / `staff123` sesuai kebutuhan penilaian |

## 7. Alternatif Vercel CLI

```bash
npm install -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel --prod
```

## 8. Checklist Sebelum Mengumpulkan

- [ ] URL publik dapat dibuka tanpa login localhost.
- [ ] Login Admin berhasil.
- [ ] Login Staff berhasil.
- [ ] CRUD barang berjalan.
- [ ] Peminjaman mengurangi stok.
- [ ] Pengembalian menambah stok dan mengubah status.
- [ ] Staff tidak dapat membuka menu Admin.
- [ ] Akun Staff dapat dinonaktifkan/diaktifkan.
- [ ] URL repository GitHub dapat diakses publik.
- [ ] Data pada `SUBMISSION.md` sudah diisi.
