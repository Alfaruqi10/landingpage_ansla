import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/about",
    "/contact",
    "/admin/login"
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7
  }));

  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true }
    });

    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8
      }))
    ];
  } catch {
    return staticRoutes;
  }
}
