import { db } from "@/lib/db";
import { buildCollectionItems, isProductInCollection } from "@/lib/collections";

export type ProductSortOption = "latest" | "featured" | "price-asc" | "price-desc";

export async function getHomePageData() {
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
}

export async function getProductsPageData(
  collectionSlug?: string,
  sort: ProductSortOption = "latest"
) {
  const [allProducts, categories] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    }),
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    })
  ]);

  const collectionItems = buildCollectionItems(categories);
  const selectedCollection = collectionItems.find((item) => item.slug === collectionSlug);

  const products = selectedCollection
    ? allProducts.filter((product) => isProductInCollection(product, selectedCollection.slug))
    : allProducts;

  const sortedProducts = [...products].sort((left, right) => {
    switch (sort) {
      case "featured":
        if (left.featured !== right.featured) {
          return Number(right.featured) - Number(left.featured);
        }

        return right.createdAt.getTime() - left.createdAt.getTime();
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "latest":
      default:
        return right.createdAt.getTime() - left.createdAt.getTime();
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
  return db.product.findUnique({
    where: { slug },
    include: { category: true }
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  return db.product.findMany({
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
  });
}
