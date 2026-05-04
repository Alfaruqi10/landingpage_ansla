# Deployment Guide

Panduan ini disiapkan untuk target deploy `Vercel + Supabase` sesuai stack project saat ini.

## Arsitektur

- `Vercel`: host aplikasi Next.js
- `Supabase`: PostgreSQL untuk Prisma
- `Supabase Storage`: penyimpanan gambar upload admin di production
- `Midtrans`: gateway pembayaran

## Status Penting Sebelum Deploy

- Build project sudah siap production
- Prisma sudah memakai `DATABASE_URL` + `DIRECT_URL`
- QRIS Midtrans masih dimatikan sementara dengan `NEXT_PUBLIC_ENABLE_QRIS="false"`
- Saat QRIS ingin dihidupkan lagi, pastikan channel QRIS Midtrans production sudah aktif dan webhook memakai domain publik

## 1. Siapkan Database Supabase

Di dashboard Supabase, ambil dua connection string:

- `DATABASE_URL`
  Gunakan koneksi pooled untuk runtime app
- `DIRECT_URL`
  Gunakan koneksi direct/non-pooled untuk `prisma migrate deploy`

Format yang direkomendasikan:

```env
DATABASE_URL="postgres://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

## 2. Environment Variables di Vercel

Tambahkan variable berikut ke project Vercel:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_ENABLE_QRIS=false
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_NOTIFICATION_URL=
```

Nilai yang perlu diperhatikan:

- `AUTH_SECRET`
  Gunakan string acak yang panjang untuk session signing
- `NEXT_PUBLIC_SITE_URL`
  Isi dengan domain final deployment, misalnya `https://ansla.vercel.app`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
  Dipakai juga oleh seed untuk email admin awal
- `NEXT_PUBLIC_ENABLE_QRIS`
  Biarkan `false` sampai flow payment production siap
- `SUPABASE_URL`
  URL project Supabase, dipakai untuk upload dan public URL gambar admin
- `SUPABASE_SERVICE_ROLE_KEY`
  Dipakai server-side untuk upload gambar ke Supabase Storage. Jangan expose ke client
- `SUPABASE_STORAGE_BUCKET`
  Nama bucket public untuk gambar produk, banner, kategori, dan testimonial
- `MIDTRANS_NOTIFICATION_URL`
  Isi dengan endpoint publik:
  `https://domain-kamu/api/payments/midtrans/notification`

## 3. Import Project ke Vercel

Saat import repo ke Vercel:

- framework akan terdeteksi sebagai `Next.js`
- build command sudah disiapkan lewat `vercel.json`
- command build yang dipakai:

```bash
npm run vercel-build
```

Perintah ini akan:

1. generate Prisma client
2. menjalankan `prisma migrate deploy`
3. build Next.js production

## 4. Deploy Pertama

Setelah env terisi:

1. jalankan deploy pertama di Vercel
2. cek log build
3. pastikan migrasi Prisma berhasil
4. buka domain deployment dan cek halaman utama, produk, cart, checkout, admin login

## 4A. Siapkan Bucket Upload Gambar

Sebelum admin upload gambar dari komputer pada web live:

1. buat bucket public di Supabase Storage
2. isi `SUPABASE_URL`
3. isi `SUPABASE_SERVICE_ROLE_KEY`
4. isi `SUPABASE_STORAGE_BUCKET` dengan nama bucket tadi

Tanpa langkah ini, upload lokal hanya aman dipakai di development dan tidak persisten di Vercel.

## 5. Seed Database

Seed tidak dijalankan otomatis saat build. Jalankan manual dari environment yang mengarah ke database Supabase:

```bash
npm run db:seed
```

Setelah seed:

- admin awal memakai email dari `NEXT_PUBLIC_SUPPORT_EMAIL`
- password default: `Admin123!`

## 6. Midtrans Setelah Domain Publik Siap

Kalau nanti QRIS ingin diaktifkan:

1. aktifkan channel QRIS di dashboard Midtrans production
2. isi `MIDTRANS_NOTIFICATION_URL` dengan domain live
3. ubah `NEXT_PUBLIC_ENABLE_QRIS=true`
4. redeploy
5. test checkout QRIS end-to-end

## 7. Checklist Smoke Test Setelah Publish

- homepage, koleksi, dan detail produk terbuka normal
- login/register pelanggan berjalan
- akun pelanggan menampilkan profil dan riwayat order
- cart dan checkout non-QRIS berjalan
- voucher bisa dipakai
- admin login berhasil
- dashboard admin, produk, category, orders, vouchers bisa dibuka
- upload gambar dari komputer berhasil dan URL gambar tersimpan dari Supabase Storage
- image remote tampil normal

## Referensi

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Prisma Deploy to Vercel](https://docs.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)
- [Prisma + Supabase](https://www.prisma.io/docs/v6/orm/overview/databases/supabase)
