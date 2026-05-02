# ANSLA Landing Page

Landing page full-stack production-ready untuk brand fashion muslim premium dengan fokus conversion dari Meta Ads. Project ini dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui style components, Framer Motion, Prisma ORM, PostgreSQL, Zod validation, dan admin panel sederhana berbasis credentials session.

## Stack

- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style reusable components
- Framer Motion
- Prisma ORM
- PostgreSQL
- Server Actions
- Zod
- Simple credentials-based admin auth

## Fitur MVP

- Landing page premium, mobile-first, conversion-oriented
- Katalog produk dan detail produk
- Cart sederhana dan checkout web
- Halaman sukses checkout dan monitoring order admin
- CTA checkout web dan "Chat WhatsApp"
- Floating WhatsApp button
- Lead capture form tersimpan ke database
- Contact form tersimpan ke database
- Admin login sederhana
- Admin dashboard summary
- CRUD Product, Category, Testimonial, FAQ, Banner
- Halaman leads, contact submissions, dan orders
- Metadata SEO, Open Graph, sitemap, robots

## Struktur Folder

```text
.
|-- app
|   |-- (marketing)
|   |   |-- about/page.tsx
|   |   |-- contact/page.tsx
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   `-- products
|   |       |-- [slug]/page.tsx
|   |       `-- page.tsx
|   |-- admin
|   |   |-- (dashboard)
|   |   |   |-- banners/page.tsx
|   |   |   |-- categories/page.tsx
|   |   |   |-- faqs/page.tsx
|   |   |   |-- layout.tsx
|   |   |   |-- leads/page.tsx
|   |   |   |-- page.tsx
|   |   |   |-- products/page.tsx
|   |   |   `-- testimonials/page.tsx
|   |   `-- login/page.tsx
|   |-- error.tsx
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- not-found.tsx
|   |-- robots.ts
|   `-- sitemap.ts
|-- components
|   |-- admin
|   |   `-- admin-page-header.tsx
|   |-- layout
|   |   |-- admin-shell.tsx
|   |   |-- admin-sidebar.tsx
|   |   |-- site-footer.tsx
|   |   |-- site-header.tsx
|   |   `-- whatsapp-float.tsx
|   |-- shared
|   |   |-- contact-form.tsx
|   |   |-- empty-state.tsx
|   |   |-- lead-capture-form.tsx
|   |   |-- page-hero.tsx
|   |   |-- product-card.tsx
|   |   |-- reveal.tsx
|   |   |-- section-heading.tsx
|   |   |-- status-banner.tsx
|   |   |-- testimonial-card.tsx
|   |   `-- video-placeholder.tsx
|   `-- ui
|       |-- badge.tsx
|       |-- button.tsx
|       |-- card.tsx
|       |-- input.tsx
|       |-- label.tsx
|       `-- textarea.tsx
|-- lib
|   |-- actions
|   |   |-- admin-actions.ts
|   |   |-- auth-actions.ts
|   |   `-- public-actions.ts
|   |-- data
|   |   |-- admin.ts
|   |   `-- public.ts
|   |-- auth.ts
|   |-- db.ts
|   |-- session.ts
|   |-- site.ts
|   |-- utils.ts
|   `-- validations.ts
|-- prisma
|   |-- schema.prisma
|   `-- seed.ts
|-- .env.example
|-- .eslintrc.json
|-- components.json
|-- middleware.ts
|-- next.config.mjs
|-- package.json
|-- postcss.config.js
|-- tailwind.config.ts
`-- tsconfig.json
```

## Database Schema

Model yang tersedia:

- `AdminUser`
- `Product`
- `Category`
- `Testimonial`
- `FAQ`
- `Banner`
- `Lead`
- `ContactMessage`

Schema lengkap ada di [prisma/schema.prisma](./prisma/schema.prisma).

## Seed Data

Seed akan membuat:

- 1 admin user default
- 4 category
- 8 product premium muslimwear
- 4 testimonial
- 5 FAQ
- 2 banner
- sample lead entries
- sample contact messages

Default admin credential:

- Email: mengikuti `NEXT_PUBLIC_SUPPORT_EMAIL` saat seed dijalankan
- Password: `Admin123!`

## Setup Environment

1. Salin file `.env.example` menjadi `.env`.

2. Sesuaikan nilai berikut di `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_ENABLE_QRIS`
- `MIDTRANS_SERVER_KEY`
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- `MIDTRANS_IS_PRODUCTION`
- `MIDTRANS_NOTIFICATION_URL`

## Install & Run

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Project akan berjalan di:

- `http://localhost:3000`

## Prisma Commands

Migrasi database:

```bash
npx prisma migrate dev
```

Generate Prisma client manual bila diperlukan:

```bash
npx prisma generate
```

Jalankan seed:

```bash
npm run db:seed
```

## Auth Admin

- Auth memakai credentials-based session sederhana
- Session disimpan via signed HTTP-only cookie
- Route `/admin/*` diproteksi middleware
- Route `/admin/login` otomatis redirect ke dashboard jika sudah login

## Catatan Implementasi

- Cart dan checkout web sudah aktif
- Login/register pelanggan, halaman akun, voucher, dan relasi order ke akun pelanggan sudah aktif
- Image upload mendukung URL dan file lokal
- Form publik memakai server actions dan validasi Zod
- Admin CRUD dibuat simpel dan mudah dikembangkan
- UI dioptimalkan untuk conversion dan mobile-first browsing
- Halaman produk mendukung checkout web, keranjang, buy now, dan WhatsApp
- QRIS Midtrans sudah ada di codebase, tetapi saat ini sengaja dinonaktifkan sementara lewat `NEXT_PUBLIC_ENABLE_QRIS="false"` sampai channel production dan domain publik siap

## Dokumentasi Halaman

Dokumen penjelasan tiap halaman dan CRUD admin ada di:

- [docs/HALAMAN_DAN_CRUD.md](./docs/HALAMAN_DAN_CRUD.md)
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

