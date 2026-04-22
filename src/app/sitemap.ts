import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { listProducts } from "@/lib/products";
import { listDrops } from "@/lib/drops";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  const [products, drops] = await Promise.all([listProducts(), listDrops()]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/drops`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produtos/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const dropRoutes: MetadataRoute.Sitemap = drops.map((d) => ({
    url: `${base}/drops/${d.slug}`,
    lastModified: new Date(d.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...dropRoutes];
}
