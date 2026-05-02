import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const adminEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@ansla.com";

async function main() {
  await prisma.contactMessage.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.adminUser.create({
    data: {
      name: "ANSLA Admin",
      email: adminEmail,
      passwordHash
    }
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Signature Abaya",
        slug: "signature-abaya",
        sortOrder: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
      }
    }),
    prisma.category.create({
      data: {
        name: "Outer & Layering",
        slug: "outer-layering",
        sortOrder: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
      }
    }),
    prisma.category.create({
      data: {
        name: "Prayer & Occasion",
        slug: "prayer-occasion",
        sortOrder: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
      }
    }),
    prisma.category.create({
      data: {
        name: "Scarf Essentials",
        slug: "scarf-essentials",
        sortOrder: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
      }
    })
  ]);

  const categoryMap = new Map(categories.map((category) => [category.slug, category.id]));

  await prisma.product.createMany({
    data: [
      {
        name: "Nayla Signature Abaya",
        slug: "nayla-signature-abaya",
        featured: true,
        price: 1299000,
        compareAtPrice: 1499000,
        shortDescription: "Abaya premium berpotongan lurus dengan drape halus dan detail manset lembut.",
        description:
          "Dibuat dari premium nida blend dengan handfeel lembut dan jatuh rapi. Cocok untuk aktivitas harian, meeting, hingga acara keluarga dengan tampilan yang tenang namun mewah.",
        imageUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
        ],
        variantOptions: [
          {
            name: "Mocha Rose",
            imageUrl:
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
            price: 1299000
          },
          {
            name: "Sand Beige",
            imageUrl:
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
            price: 1329000
          },
          {
            name: "Dusty Olive",
            imageUrl:
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
            price: 1349000
          }
        ],
        categoryId: categoryMap.get("signature-abaya")!,
        isActive: true
      },
      {
        name: "Ameera Occasion Set",
        slug: "ameera-occasion-set",
        featured: true,
        price: 1599000,
        compareAtPrice: 1799000,
        shortDescription: "Set modestwear elegan untuk momen istimewa dengan siluet refined.",
        description:
          "Set dua potong dengan potongan modest, tekstur lembut, dan warna ivory-mocha yang menonjolkan kesan premium. Ideal untuk undangan, gathering, dan sesi foto keluarga.",
        imageUrl:
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
        categoryId: categoryMap.get("prayer-occasion")!,
        isActive: true
      },
      {
        name: "Safa Layered Outer",
        slug: "safa-layered-outer",
        featured: true,
        price: 989000,
        compareAtPrice: 1129000,
        shortDescription: "Outer ringan dengan potongan clean untuk layering modest yang effortless.",
        description:
          "Memadukan struktur minimalis dan flowy movement, outer ini mudah di-style bersama inner dress atau set basic. Memberi dimensi mewah tanpa terasa berat.",
        imageUrl:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
        categoryId: categoryMap.get("outer-layering")!,
        isActive: true
      },
      {
        name: "Rania Everyday Abaya",
        slug: "rania-everyday-abaya",
        featured: true,
        price: 1149000,
        compareAtPrice: null,
        shortDescription: "Abaya daily premium dengan jahitan rapi dan warna netral yang versatile.",
        description:
          "Desain simpel dengan aksen clean seam yang membuat penampilan tetap polished sepanjang hari. Nyaman untuk kerja, brunch, hingga perjalanan.",
        imageUrl:
          "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80",
        categoryId: categoryMap.get("signature-abaya")!,
        isActive: true
      },
      {
        name: "Hana Soft Khimar",
        slug: "hana-soft-khimar",
        featured: false,
        price: 349000,
        compareAtPrice: 399000,
        shortDescription: "Khimar ringan dengan coverage nyaman dan tampilan refined.",
        description:
          "Terbuat dari material flowy anti-gerah dengan warna muted yang mudah dipadukan. Menjadi pilihan praktis untuk tampilan modest harian yang tetap elevated.",
        imageUrl:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
        ],
        variantOptions: [
          {
            name: "Stone",
            imageUrl:
              "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
            price: 349000
          },
          {
            name: "Cocoa",
            imageUrl:
              "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
            price: 359000
          }
        ],
        categoryId: categoryMap.get("scarf-essentials")!,
        isActive: true
      },
      {
        name: "Luma Prayer Dress",
        slug: "luma-prayer-dress",
        featured: false,
        price: 899000,
        compareAtPrice: null,
        shortDescription: "Prayer dress premium dengan material adem dan potongan anggun.",
        description:
          "Dirancang untuk kenyamanan ibadah sekaligus estetika yang lembut. Siluet longgar, finishing rapi, dan pilihan warna netral membuatnya tampil istimewa.",
        imageUrl:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
        categoryId: categoryMap.get("prayer-occasion")!,
        isActive: true
      },
      {
        name: "Zahra Open Abaya",
        slug: "zahra-open-abaya",
        featured: false,
        price: 1379000,
        compareAtPrice: 1529000,
        shortDescription: "Open abaya dengan garis tegas dan nuansa modern luxury.",
        description:
          "Potongan clean dengan finishing premium untuk tampilan layering yang sophisticated. Cocok untuk Anda yang menyukai modestwear dengan aura modern.",
        imageUrl:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
        categoryId: categoryMap.get("outer-layering")!,
        isActive: true
      },
      {
        name: "Maira Satin Shawl",
        slug: "maira-satin-shawl",
        featured: false,
        price: 289000,
        compareAtPrice: null,
        shortDescription: "Shawl satin matte premium untuk sentuhan lembut dan polished.",
        description:
          "Finishing matte-satin memberi efek anggun tanpa terlalu berkilau. Ringan dipakai dan pas untuk melengkapi busana formal maupun daily elevated look.",
        imageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        categoryId: categoryMap.get("scarf-essentials")!,
        isActive: true
      }
    ]
  });

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Shinta A.",
        city: "Jakarta",
        rating: 5,
        content: "Materialnya jatuh cantik dan tidak panas. Begitu dipakai langsung terlihat mahal tanpa effort berlebih.",
        imageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        isActive: true
      },
      {
        name: "Nabila K.",
        city: "Bandung",
        rating: 5,
        content: "Saya beli dari iklan lalu chat WhatsApp, prosesnya cepat dan produknya benar-benar sesuai ekspektasi premium.",
        imageUrl:
          "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=400&q=80",
        isActive: true
      },
      {
        name: "Raisa M.",
        city: "Surabaya",
        rating: 5,
        content: "Potongannya modest tapi modern. Cocok untuk meeting, acara keluarga, sampai traveling.",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        isActive: true
      },
      {
        name: "Farah L.",
        city: "Yogyakarta",
        rating: 4,
        content: "Packaging rapi dan tone warnanya mewah. Sangat nyaman untuk dipakai seharian.",
        imageUrl: null,
        isActive: true
      }
    ]
  });

  await prisma.fAQ.createMany({
    data: [
      {
        question: "Apakah bahan abaya nyaman untuk cuaca tropis?",
        answer: "Ya. Koleksi kami menggunakan material pilihan yang ringan, breathable, dan tetap jatuh rapi saat dipakai seharian.",
        sortOrder: 1,
        isActive: true
      },
      {
        question: "Bagaimana cara pemesanan?",
        answer: "Anda bisa klik tombol Beli Sekarang atau Chat WhatsApp pada halaman produk. Tim kami akan membantu proses pemesanan dengan cepat.",
        sortOrder: 2,
        isActive: true
      },
      {
        question: "Apakah tersedia size chart?",
        answer: "Setiap produk memiliki deskripsi ukuran dasar. Untuk bantuan lebih detail, Anda bisa menghubungi tim kami via WhatsApp.",
        sortOrder: 3,
        isActive: true
      },
      {
        question: "Apakah foto produk sesuai warna aslinya?",
        answer: "Kami berusaha menampilkan warna seakurat mungkin. Perbedaan tipis bisa terjadi karena pencahayaan dan pengaturan layar.",
        sortOrder: 4,
        isActive: true
      },
      {
        question: "Berapa lama pengiriman?",
        answer: "Pesanan diproses cepat setelah konfirmasi. Lama pengiriman mengikuti kota tujuan dan kurir yang dipilih.",
        sortOrder: 5,
        isActive: true
      }
    ]
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "Elegant Ramadan Edit",
        subtitle: "Koleksi abaya lembut bernuansa ivory, beige, dan mocha untuk momen yang lebih berkesan.",
        imageUrl:
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1400&q=80",
        ctaText: "Lihat Koleksi",
        ctaLink: "/products",
        isActive: true,
        sortOrder: 1
      },
      {
        title: "Premium Ready-to-Wear",
        subtitle: "Potongan modest modern dengan material flowy yang nyaman dan berkelas.",
        imageUrl:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1400&q=80",
        ctaText: "Shop Featured",
        ctaLink: "/products",
        isActive: true,
        sortOrder: 2
      }
    ]
  });

  await prisma.voucher.createMany({
    data: [
      {
        code: "WELCOME10",
        label: "Welcome Offer 10%",
        discountType: "PERCENT",
        discountValue: 10,
        minPurchase: 250000,
        usageLimit: 100,
        isActive: true
      },
      {
        code: "RAMADAN50",
        label: "Potongan Ramadan",
        discountType: "FIXED",
        discountValue: 50000,
        minPurchase: 500000,
        usageLimit: null,
        isActive: true
      }
    ]
  });

  await prisma.lead.createMany({
    data: [
      { name: "Nadya", email: "nadya@example.com", source: "hero-form" },
      { name: "Alya", phone: "081234567890", source: "footer-newsletter" },
      { name: "Salsa", email: "salsa@example.com", source: "product-detail" }
    ]
  });

  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Zahwa",
        email: "zahwa@example.com",
        phone: "081390001122",
        message: "Halo, saya ingin tahu rekomendasi abaya untuk acara nikahan outdoor."
      },
      {
        name: "Mey",
        email: "mey@example.com",
        phone: null,
        message: "Apakah bisa dibantu pilih size untuk tinggi badan 165 cm?"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
