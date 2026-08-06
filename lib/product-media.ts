export type ProductMediaImage = {
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

function isValidMediaUrl(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith("/uploads/");
}

function normalizeAlt(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeSortOrder(value: unknown, fallback: number) {
  const sortOrder = Number(value);
  return Number.isFinite(sortOrder) ? Math.max(0, Math.floor(sortOrder)) : fallback;
}

export function normalizeProductMediaImages(
  value: unknown,
  fallbackAlt = "Foto produk"
): ProductMediaImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenUrls = new Set<string>();

  return value
    .map<ProductMediaImage | null>((item, index) => {
      if (typeof item === "string") {
        const url = item.trim();

        if (!isValidMediaUrl(url)) {
          return null;
        }

        return {
          url,
          alt: fallbackAlt,
          sortOrder: index,
          isPrimary: false
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const image = item as {
        url?: unknown;
        alt?: unknown;
        sortOrder?: unknown;
        isPrimary?: unknown;
      };
      const url = typeof image.url === "string" ? image.url.trim() : "";

      if (!isValidMediaUrl(url)) {
        return null;
      }

      return {
        url,
        alt: normalizeAlt(image.alt, fallbackAlt),
        sortOrder: normalizeSortOrder(image.sortOrder, index),
        isPrimary: image.isPrimary === true
      };
    })
    .filter((image): image is ProductMediaImage => {
      if (!image) {
        return false;
      }

      const normalizedUrl = image.url.toLowerCase();

      if (seenUrls.has(normalizedUrl)) {
        return false;
      }

      seenUrls.add(normalizedUrl);
      return true;
    })
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((image, index) => ({
      ...image,
      sortOrder: index
    }));
}

export function parseProductMediaJson(value: FormDataEntryValue | null, fallbackAlt: string) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    return normalizeProductMediaImages(JSON.parse(value), fallbackAlt);
  } catch {
    return [];
  }
}

export function parseProductMediaLines(value: FormDataEntryValue | null, fallbackAlt: string) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return normalizeProductMediaImages(
    value
      .split(/\r?\n/)
      .map((line, index) => {
        const [url = "", alt = ""] = line.split("|").map((item) => item.trim());

        return {
          url,
          alt: alt || fallbackAlt,
          sortOrder: index,
          isPrimary: false
        };
      }),
    fallbackAlt
  );
}

export function buildProductMediaGallery({
  coverUrl,
  images,
  fallbackAlt
}: {
  coverUrl: string;
  images: ProductMediaImage[];
  fallbackAlt: string;
}) {
  const normalizedImages = normalizeProductMediaImages(images, fallbackAlt);
  const coverImage: ProductMediaImage = {
    url: coverUrl,
    alt: fallbackAlt,
    sortOrder: -1,
    isPrimary: true
  };
  const mergedImages = normalizeProductMediaImages([coverImage, ...normalizedImages], fallbackAlt);

  return mergedImages.map((image, index) => ({
    ...image,
    sortOrder: index,
    isPrimary: image.url === coverUrl
  }));
}

export function getProductCoverImage(
  galleryImages: unknown,
  fallbackCoverUrl: string,
  fallbackAlt: string
) {
  const images = normalizeProductMediaImages(galleryImages, fallbackAlt);
  return images.find((image) => image.isPrimary)?.url || fallbackCoverUrl;
}

export function getProductGalleryUrls(
  galleryImages: unknown,
  fallbackCoverUrl: string,
  fallbackAlt: string
) {
  const images = buildProductMediaGallery({
    coverUrl: fallbackCoverUrl,
    images: normalizeProductMediaImages(galleryImages, fallbackAlt),
    fallbackAlt
  });

  return images.map((image) => image.url);
}
