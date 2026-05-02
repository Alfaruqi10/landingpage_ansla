import { siteConfig } from "@/lib/site";

type ProductCollectionSource = {
  name: string;
  slug: string;
  category?: {
    name: string;
    slug?: string;
  } | null;
};

type CategoryCollectionSource = {
  name: string;
  slug: string;
  imageUrl?: string | null;
};

export type CollectionItem = {
  slug: string;
  label: string;
  mappedCategorySlugs: string[];
  productKeywords: string[];
  imageUrl?: string | null;
};

const baseCollectionItems: CollectionItem[] = siteConfig.collectionItems.map((collection) => ({
  slug: collection.slug,
  label: collection.label,
  mappedCategorySlugs: [...collection.mappedCategorySlugs],
  productKeywords: [...collection.productKeywords]
}));

const fallbackCollection = baseCollectionItems.find(
  (collection) => collection.slug === "pakaian-wanita-lainnya"
);

function normalize(value?: string | null) {
  return (value || "").toLowerCase().trim();
}

function includesAny(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

export function buildCollectionItems(categories: CategoryCollectionSource[] = []) {
  if (categories.length === 0) {
    return baseCollectionItems;
  }

  return categories.map<CollectionItem>((category) => ({
    slug: category.slug,
    label: category.name,
    mappedCategorySlugs: [category.slug],
    productKeywords: [
      category.slug,
      ...category.name
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    ],
    imageUrl: category.imageUrl || null
  }));
}

export function getProductCollection(product: ProductCollectionSource) {
  if (product.category?.slug && product.category?.name) {
    return {
      slug: product.category.slug,
      label: product.category.name,
      mappedCategorySlugs: [product.category.slug],
      productKeywords: [product.category.slug, product.category.name.toLowerCase()]
    };
  }

  const productText = `${product.name} ${product.slug}`.toLowerCase();

  const keywordMatch = baseCollectionItems.find((collection) =>
    includesAny(productText, collection.productKeywords)
  );

  if (keywordMatch) {
    return keywordMatch;
  }

  return keywordMatch ?? fallbackCollection ?? baseCollectionItems[0];
}

export function isProductInCollection(product: ProductCollectionSource, collectionSlug: string) {
  if (normalize(product.category?.slug) === normalize(collectionSlug)) {
    return true;
  }

  return getProductCollection(product).slug === collectionSlug;
}
