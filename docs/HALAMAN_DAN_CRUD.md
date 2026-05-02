# Penjelasan Halaman dan CRUD

Dokumen ini menjelaskan fungsi tiap halaman pada project ANSLA Atelier, termasuk alur CRUD di area admin, sumber data, dan file utama yang terlibat.

## Ringkasan Route

### Public / Marketing

- `/`
- `/cart`
- `/checkout`
- `/checkout/success`
- `/products`
- `/products/[slug]`
- `/about`
- `/contact`

### Admin

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/testimonials`
- `/admin/faqs`
- `/admin/banners`
- `/admin/leads`
- `/admin/orders`

## Halaman Public

### `/`

Fungsi:

- Landing page utama brand
- Mengarahkan traffic dari Meta Ads ke produk dan WhatsApp
- Menangkap lead dari form sederhana

Isi utama:

- Sticky navbar
- Hero section
- Featured products
- Kategori
- USP / keunggulan brand
- Testimonial
- Social proof
- Video placeholder
- FAQ
- Lead capture form
- Closing CTA

Sumber data:

- `Banner`
- `Product` yang `featured = true`
- `Category`
- `Testimonial` aktif
- `FAQ` aktif

File utama:

- [app/(marketing)/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/page.tsx)
- [lib/data/public.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/public.ts)
- [components/layout/site-header.tsx](/C:/xampp/htdocs/landingpage_ansla/components/layout/site-header.tsx)
- [components/shared/lead-capture-form.tsx](/C:/xampp/htdocs/landingpage_ansla/components/shared/lead-capture-form.tsx)

Action terkait:

- `createLeadAction`

File action:

- [lib/actions/public-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/public-actions.ts)

### `/products`

Fungsi:

- Menampilkan katalog produk
- Mendukung filter kategori melalui query string `?category=slug`
- Menjadi jalur utama dari landing page ke detail produk

Isi utama:

- Hero katalog
- Filter kategori
- Grid produk
- CTA WhatsApp
- Empty state jika tidak ada produk

Sumber data:

- `Product` aktif
- `Category`

File utama:

- [app/(marketing)/products/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/products/page.tsx)
- [components/shared/product-card.tsx](/C:/xampp/htdocs/landingpage_ansla/components/shared/product-card.tsx)
- [lib/data/public.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/public.ts)

### `/products/[slug]`

Fungsi:

- Menampilkan detail satu produk berdasarkan slug
- Mendukung add to cart, buy now, checkout web, dan WhatsApp
- Menampilkan produk terkait
- Menyimpan lead jika user belum siap membeli

Isi utama:

- Gambar produk
- Informasi harga
- Deskripsi lengkap
- Selector warna dan ukuran
- CTA checkout web
- CTA tambah ke keranjang
- CTA chat WhatsApp
- Lead capture form
- Related products

Sumber data:

- `Product`
- `Category`
- produk terkait berdasarkan `categoryId`

File utama:

- [app/(marketing)/products/[slug]/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/products/[slug]/page.tsx)
- [lib/data/public.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/public.ts)

Action terkait:

- `createLeadAction`

### `/cart`

Fungsi:

- Menampilkan item yang sudah dipilih pengunjung
- Mengubah jumlah item atau menghapus item dari keranjang
- Menjadi titik masuk ke checkout web atau order via WhatsApp

Isi utama:

- List item keranjang
- Quantity picker
- Ringkasan subtotal
- CTA checkout web
- CTA lanjut via WhatsApp

File utama:

- [app/(marketing)/cart/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/cart/page.tsx)
- [components/cart/cart-page-client.tsx](/C:/xampp/htdocs/landingpage_ansla/components/cart/cart-page-client.tsx)
- [components/cart/cart-provider.tsx](/C:/xampp/htdocs/landingpage_ansla/components/cart/cart-provider.tsx)

### `/checkout`

Fungsi:

- Mengumpulkan data pengiriman dan pembayaran
- Membuat order web ke database
- Mendukung checkout dari keranjang maupun buy now

Isi utama:

- Ringkasan item checkout
- Form alamat pengiriman
- Pilihan provinsi, kota, dan kecamatan
- Metode pengiriman
- Metode pembayaran
- Upload bukti pembayaran untuk transfer bank

File utama:

- [app/(marketing)/checkout/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/checkout/page.tsx)
- [components/checkout/checkout-page-client.tsx](/C:/xampp/htdocs/landingpage_ansla/components/checkout/checkout-page-client.tsx)
- [lib/actions/checkout-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/checkout-actions.ts)

Action terkait:

- `createOrderAction`

### `/checkout/success`

Fungsi:

- Menampilkan status akhir setelah order dibuat
- Memberi instruksi lanjutan untuk pembayaran transfer atau QRIS
- Membersihkan cart atau state buy now setelah checkout selesai

Isi utama:

- Status pesanan
- Nomor order
- Instruksi pembayaran lanjutan
- CTA konfirmasi pembayaran

File utama:

- [app/(marketing)/checkout/success/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/checkout/success/page.tsx)
- [components/checkout/checkout-success-client.tsx](/C:/xampp/htdocs/landingpage_ansla/components/checkout/checkout-success-client.tsx)

### `/about`

Fungsi:

- Menjelaskan positioning brand
- Menampilkan identitas dan nilai brand

Isi utama:

- Hero about
- Brand story
- 3 value cards

File utama:

- [app/(marketing)/about/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/about/page.tsx)

### `/contact`

Fungsi:

- Halaman kontak brand
- Menyimpan inquiry dari pengunjung ke database

Isi utama:

- Contact info
- CTA WhatsApp
- Contact form
- Feedback success/error

Sumber data:

- `ContactMessage`

File utama:

- [app/(marketing)/contact/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/contact/page.tsx)
- [components/shared/contact-form.tsx](/C:/xampp/htdocs/landingpage_ansla/components/shared/contact-form.tsx)

Action terkait:

- `createContactMessageAction`

## Halaman Admin

### `/admin/login`

Fungsi:

- Login admin sederhana berbasis credentials
- Membuat session cookie untuk akses dashboard

Isi utama:

- Form email
- Form password
- Status error jika login gagal

File utama:

- [app/admin/login/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/login/page.tsx)
- [lib/actions/auth-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/auth-actions.ts)
- [lib/auth.ts](/C:/xampp/htdocs/landingpage_ansla/lib/auth.ts)

Action terkait:

- `loginAction`
- `logoutAction`

Proteksi route:

- Semua route `/admin/*` diproteksi oleh [middleware.ts](/C:/xampp/htdocs/landingpage_ansla/middleware.ts)

### `/admin`

Fungsi:

- Dashboard admin utama
- Menampilkan ringkasan data dan entri terbaru

Isi utama:

- Summary cards
- Recent leads
- Recent contact messages

Sumber data:

- `Product`
- `Category`
- `Testimonial`
- `FAQ`
- `Banner`
- `Lead`
- `ContactMessage`

File utama:

- [app/admin/(dashboard)/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/page.tsx)
- [lib/data/admin.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/admin.ts)

### `/admin/products`

Fungsi:

- Mengelola data produk
- Mendukung create, update, dan delete produk

CRUD:

- `Create`
  - Form “Tambah Produk Baru”
  - Menyimpan `name`, `slug`, `featured`, `price`, `compareAtPrice`, `shortDescription`, `description`, `imageUrl`, `categoryId`, `isActive`
- `Read`
  - Menampilkan daftar produk beserta kategori dan status
- `Update`
  - Setiap card produk punya form edit sendiri
- `Delete`
  - Tombol “Hapus Produk” pada tiap item

Validasi:

- Menggunakan `productSchema`

Action terkait:

- `upsertProductAction`
- `deleteProductAction`

File utama:

- [app/admin/(dashboard)/products/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/products/page.tsx)
- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)
- [lib/validations.ts](/C:/xampp/htdocs/landingpage_ansla/lib/validations.ts)

Catatan:

- Slug harus unik
- Produk harus terhubung ke kategori
- Update akan memicu revalidate halaman publik yang terkait
- Gambar bisa diisi lewat `Image URL` atau `Upload File Lokal`
- Jika keduanya diisi, file upload akan diprioritaskan

### `/admin/categories`

Fungsi:

- Mengelola kategori produk

CRUD:

- `Create`
  - Menambah kategori baru dengan `name`, `slug`, `imageUrl`
- `Read`
  - Menampilkan daftar kategori dan jumlah produk di dalamnya
- `Update`
  - Edit data kategori per card
- `Delete`
  - Hapus kategori jika tidak sedang dipakai produk

Validasi:

- Menggunakan `categorySchema`

Action terkait:

- `upsertCategoryAction`
- `deleteCategoryAction`

File utama:

- [app/admin/(dashboard)/categories/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/categories/page.tsx)
- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)

Catatan:

- Kategori tidak bisa dihapus jika masih direferensikan oleh produk
- Gambar kategori mendukung `Image URL` atau `Upload File Lokal`

### `/admin/testimonials`

Fungsi:

- Mengelola testimonial pelanggan untuk social proof di landing page

CRUD:

- `Create`
  - Menambah testimonial baru
- `Read`
  - Menampilkan daftar testimonial
- `Update`
  - Edit `name`, `city`, `rating`, `content`, `imageUrl`, `isActive`
- `Delete`
  - Menghapus testimonial

Validasi:

- Menggunakan `testimonialSchema`

Action terkait:

- `upsertTestimonialAction`
- `deleteTestimonialAction`

File utama:

- [app/admin/(dashboard)/testimonials/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/testimonials/page.tsx)
- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)

Catatan:

- Hanya testimonial `isActive = true` yang tampil di landing page
- Foto testimonial bisa memakai link atau file lokal

### `/admin/faqs`

Fungsi:

- Mengelola daftar FAQ yang tampil di landing page

CRUD:

- `Create`
  - Menambah FAQ baru
- `Read`
  - Menampilkan semua FAQ
- `Update`
  - Edit pertanyaan, jawaban, urutan, dan status aktif
- `Delete`
  - Menghapus FAQ

Validasi:

- Menggunakan `faqSchema`

Action terkait:

- `upsertFaqAction`
- `deleteFaqAction`

File utama:

- [app/admin/(dashboard)/faqs/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/faqs/page.tsx)
- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)

Catatan:

- Tampilan FAQ diurutkan berdasarkan `sortOrder`

### `/admin/banners`

Fungsi:

- Mengelola banner hero dan campaign copy

CRUD:

- `Create`
  - Menambah banner baru
- `Read`
  - Menampilkan daftar banner
- `Update`
  - Edit `title`, `subtitle`, `imageUrl`, `ctaText`, `ctaLink`, `sortOrder`, `isActive`
- `Delete`
  - Menghapus banner

Validasi:

- Menggunakan `bannerSchema`

Action terkait:

- `upsertBannerAction`
- `deleteBannerAction`

File utama:

- [app/admin/(dashboard)/banners/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/banners/page.tsx)
- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)

Catatan:

- Banner aktif dengan urutan paling kecil akan lebih dulu digunakan di landing page
- Gambar banner bisa memakai `Image URL` atau `Upload File Lokal`

## Upload Gambar Lokal

File upload lokal disimpan ke folder:

- `public/uploads/products`
- `public/uploads/categories`
- `public/uploads/testimonials`
- `public/uploads/banners`

Aturan upload:

- format yang didukung: `jpg`, `jpeg`, `png`, `webp`, `gif`
- jika admin memilih file, sistem akan menggunakan file itu
- jika tidak ada file, sistem memakai nilai `Image URL`

### `/admin/leads`

Fungsi:

- Menampilkan hasil form lead capture dan contact form
- Dipakai tim untuk follow up calon pembeli

Isi utama:

- List `Lead`
- List `ContactMessage`

Jenis data yang ditampilkan:

- nama
- email / nomor WhatsApp
- source form
- tanggal masuk
- isi pesan untuk contact message

File utama:

- [app/admin/(dashboard)/leads/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/leads/page.tsx)
- [lib/data/admin.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/admin.ts)

Catatan:

- Halaman ini tidak melakukan CRUD penuh
- Fungsinya lebih ke monitoring dan follow up data masuk

### `/admin/orders`

Fungsi:

- Memantau semua order yang masuk dari checkout web
- Melihat item, alamat, metode pembayaran, dan bukti pembayaran
- Mengubah status pesanan dari admin

Isi utama:

- Filter status order
- List item per order
- Detail alamat pengiriman
- Ringkasan subtotal, ongkir, dan total
- Preview bukti pembayaran
- Quick action dan select status

Action terkait:

- `updateOrderStatusAction`

File utama:

- [app/admin/(dashboard)/orders/page.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/orders/page.tsx)
- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)
- [lib/data/admin.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/admin.ts)

## Komponen Layout Penting

### Public Layout

File:

- [app/(marketing)/layout.tsx](/C:/xampp/htdocs/landingpage_ansla/app/(marketing)/layout.tsx)

Komponen:

- `SiteHeader`
- `SiteFooter`
- `WhatsAppFloat`

### Admin Layout

File:

- [app/admin/(dashboard)/layout.tsx](/C:/xampp/htdocs/landingpage_ansla/app/admin/(dashboard)/layout.tsx)

Komponen:

- `AdminShell`
- `AdminSidebar`

## Action Server yang Dipakai

### Public

- `createLeadAction`
- `createContactMessageAction`
- `createOrderAction`

File:

- [lib/actions/public-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/public-actions.ts)

### Auth

- `loginAction`
- `logoutAction`

File:

- [lib/actions/auth-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/auth-actions.ts)

### Admin CRUD

- `upsertCategoryAction`
- `deleteCategoryAction`
- `upsertProductAction`
- `deleteProductAction`
- `upsertTestimonialAction`
- `deleteTestimonialAction`
- `upsertFaqAction`
- `deleteFaqAction`
- `upsertBannerAction`
- `deleteBannerAction`
- `updateOrderStatusAction`

File:

- [lib/actions/admin-actions.ts](/C:/xampp/htdocs/landingpage_ansla/lib/actions/admin-actions.ts)

## Validasi

Semua form utama memakai Zod schema yang ada di:

- [lib/validations.ts](/C:/xampp/htdocs/landingpage_ansla/lib/validations.ts)

Schema yang tersedia:

- `loginSchema`
- `leadSchema`
- `contactSchema`
- `categorySchema`
- `productSchema`
- `testimonialSchema`
- `faqSchema`
- `bannerSchema`

## Data Layer

Query publik:

- [lib/data/public.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/public.ts)

Query admin:

- [lib/data/admin.ts](/C:/xampp/htdocs/landingpage_ansla/lib/data/admin.ts)

Database client:

- [lib/db.ts](/C:/xampp/htdocs/landingpage_ansla/lib/db.ts)

Schema database:

- [prisma/schema.prisma](/C:/xampp/htdocs/landingpage_ansla/prisma/schema.prisma)

## Catatan Pengembangan Lanjutan

Beberapa peningkatan yang mudah dilakukan dari struktur sekarang:

- tambah upload image storage
- tambah status produk lebih detail
- tambah pagination katalog
- tambah pencarian di admin
- tambah edit metadata per halaman
- tambah analytics event untuk CTA conversion
