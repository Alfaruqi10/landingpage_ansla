import { db } from "@/lib/db";
import { buildCollectionItems, isProductInCollection } from "@/lib/collections";
import { unstable_cache } from "next/cache";

export type ProductSortOption = "latest" | "featured" | "price-asc" | "price-desc";

const STOREFRONT_REVALIDATE_SECONDS = 300;

function toSortableTimestamp(value: unknown) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string" || typeof value === "number") {
    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  return 0;
}

const getCachedHomePageData = unstable_cache(
  async () => {
    const [banners, featuredProducts, categories, testimonials, faqs] = await Promise.all([
      db.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 3
      }),
      db.product.findMany({
        where: { isActive: true, featured: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 4
      }),
      db.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }),
      db.testimonial.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6
      }),
      db.fAQ.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      })
    ]);

    const collectionItems = buildCollectionItems(categories);

    return {
      banners,
      featuredProducts,
      categories,
      collectionItems,
      testimonials,
      faqs
    };
  },
  ["storefront-home"],
  {
    revalidate: STOREFRONT_REVALIDATE_SECONDS,
    tags: ["storefront"]
  }
);

const getCachedCatalogSnapshot = unstable_cache(
  async () => {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
      }),
      db.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      })
    ]);

    return {
      products,
      categories,
      collectionItems: buildCollectionItems(categories)
    };
  },
  ["storefront-catalog"],
  {
    revalidate: STOREFRONT_REVALIDATE_SECONDS,
    tags: ["storefront"]
  }
);

export async function getHomePageData() {
  return getCachedHomePageData();
}

export async function getProductsPageData(
  collectionSlug?: string,
  sort: ProductSortOption = "latest"
) {
  const { products: allProducts, categories, collectionItems } = await getCachedCatalogSnapshot();
  const selectedCollection = collectionItems.find((item) => item.slug === collectionSlug);

  const products = selectedCollection
    ? allProducts.filter((product) => isProductInCollection(product, selectedCollection.slug))
    : allProducts;

  const sortedProducts = [...products].sort((left, right) => {
    const leftCreatedAt = toSortableTimestamp(left.createdAt);
    const rightCreatedAt = toSortableTimestamp(right.createdAt);

    switch (sort) {
      case "featured":
        if (left.featured !== right.featured) {
          return Number(right.featured) - Number(left.featured);
        }

        return rightCreatedAt - leftCreatedAt;
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "latest":
      default:
        return rightCreatedAt - leftCreatedAt;
    }
  });

  return {
    products: sortedProducts,
    categories,
    collectionItems,
    selectedCollection,
    selectedSort: sort
  };
}

export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () =>
      db.product.findUnique({
        where: { slug },
        include: { category: true }
      }),
    ["storefront-product", slug],
    {
      revalidate: STOREFRONT_REVALIDATE_SECONDS,
      tags: ["storefront", `product:${slug}`]
    }
  )();
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  return unstable_cache(
    async () =>
      db.product.findMany({
        where: {
          categoryId,
          isActive: true,
          id: {
            not: excludeId
          }
        },
        include: { category: true },
        take: 3,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
      }),
    ["storefront-related-products", categoryId, excludeId],
    {
      revalidate: STOREFRONT_REVALIDATE_SECONDS,
      tags: ["storefront"]
    }
  )();
}
