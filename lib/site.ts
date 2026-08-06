export const transferBankOptions = [
  "BCA",
  "BRI",
  "Mandiri",
  "BNI",
  "BSI",
  "CIMB Niaga",
  "Permata Bank",
  "Danamon",
  "SeaBank",
  "Bank Lainnya"
] as const;

type TransferBankOption = (typeof transferBankOptions)[number];

type PaymentAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

const primaryPaymentAccount: PaymentAccount = {
  bankName: "SeaBank",
  accountNumber: "901353568694",
  accountHolder: "Muhammad Al Faruqi"
};

const placeholderPaymentAccount = (bankName: string): PaymentAccount => ({
  bankName,
  accountNumber: "No. XXX",
  accountHolder: "XXX"
});

const transferDestinationAccounts: Record<TransferBankOption, PaymentAccount> = {
  BCA: placeholderPaymentAccount("BCA"),
  BRI: placeholderPaymentAccount("BRI"),
  Mandiri: placeholderPaymentAccount("Mandiri"),
  BNI: placeholderPaymentAccount("BNI"),
  BSI: placeholderPaymentAccount("BSI"),
  "CIMB Niaga": placeholderPaymentAccount("CIMB Niaga"),
  "Permata Bank": placeholderPaymentAccount("Permata Bank"),
  Danamon: placeholderPaymentAccount("Danamon"),
  SeaBank: primaryPaymentAccount,
  "Bank Lainnya": placeholderPaymentAccount("Bank Lainnya")
};

function normalizeTransferBankLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveTransferDestinationAccount(selectedBank?: string | null) {
  const normalizedSelection = normalizeTransferBankLabel(selectedBank || "");
  const matchedBank = transferBankOptions.find(
    (bank) => normalizeTransferBankLabel(bank) === normalizedSelection
  );

  if (matchedBank && transferDestinationAccounts[matchedBank]) {
    return {
      selectedBank: matchedBank,
      account: transferDestinationAccounts[matchedBank],
      usesFallback: false
    };
  }

  return {
    selectedBank: matchedBank || selectedBank || primaryPaymentAccount.bankName,
    account: primaryPaymentAccount,
    usesFallback: true
  };
}

export function parseSelectedTransferBank(paymentMethod?: string | null) {
  if (!paymentMethod?.startsWith("Transfer Bank")) {
    return "";
  }

  const [, selectedBank = ""] = paymentMethod.split(" - ");
  return selectedBank.trim();
}

export const siteConfig = {
  name: "ANSLA",
  shortName: "ANSLA",
  description:
    "Abaya dan modestwear premium untuk wanita yang ingin tampil rapi, anggun, dan nyaman dipakai di momen sehari-hari maupun acara spesial.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@ansla.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890",
  paymentAccount: primaryPaymentAccount,
  marketplaceLinks: {
    shopee:
      "https://shopee.co.id/ansla.annisalabel?categoryId=100017&entryPoint=ShopByPDP&itemId=15697785832"
  },
  socialLinks: {
    facebook: "https://www.facebook.com/profile.php?id=61566699710583",
    instagram: "https://www.instagram.com/annisa_label/",
    tiktok: "https://www.tiktok.com/@ansla_annisalabel"
  },
  collectionItems: [
    {
      slug: "gamis",
      label: "Gamis",
      mappedCategorySlugs: ["gamis"],
      productKeywords: ["gamis"]
    },
    {
      slug: "kaftan",
      label: "Kaftan",
      mappedCategorySlugs: ["kaftan"],
      productKeywords: ["kaftan"]
    },
    {
      slug: "abaya",
      label: "Abaya",
      mappedCategorySlugs: ["abaya", "signature-abaya"],
      productKeywords: ["abaya"]
    },
    {
      slug: "outerwear",
      label: "Outerwear",
      mappedCategorySlugs: ["outerwear", "outer-layering", "outer-layer"],
      productKeywords: ["outerwear", "outer", "layered"]
    },
    {
      slug: "dress",
      label: "Dress",
      mappedCategorySlugs: ["dress"],
      productKeywords: ["dress"]
    },
    {
      slug: "pakaian-wanita-lainnya",
      label: "Pakaian Wanita Lainnya",
      mappedCategorySlugs: [
        "pakaian-wanita-lainnya",
        "scarf-essentials",
        "hijab",
        "khimar",
        "headscarf"
      ],
      productKeywords: ["khimar", "hijab", "headscarf", "scarf", "shawl", "pashmina", "kerudung"]
    }
  ],
  navItems: [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Koleksi" },
    { href: "/about", label: "Tentang" },
    { href: "/contact", label: "Kontak" }
  ],
  socialProof: {
    rating: "4.9/5",
    reviews: "1,250+",
    customers: "8,000+"
  },
  trustBadges: [
    "Bahan nyaman dan terasa premium",
    "Bisa tanya cepat lewat WhatsApp",
    "Siluet modest yang gampang dipakai",
    "Cocok untuk harian sampai acara spesial"
  ],
  uspItems: [
    {
      title: "Terlihat rapi tanpa terasa berlebihan",
      description:
        "Pilihan warna, tekstur, dan potongan membantu Anda terlihat anggun tanpa perlu styling yang rumit."
    },
    {
      title: "Nyaman dipakai lebih lama",
      description:
        "Material yang jatuh rapi dan coverage yang pas membantu Anda tetap nyaman dari pagi sampai acara selesai."
    },
    {
      title: "Mudah dipilih dan mudah diorder",
      description:
        "Anda bisa cepat menemukan model yang cocok, lalu langsung lanjut checkout atau konsultasi."
    }
  ]
} as const;

export type SiteConfig = typeof siteConfig;
