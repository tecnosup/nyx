import { SITE_CONFIG } from "@/lib/constants";
import type { Drop, Product } from "@/lib/types";
import { totalStock } from "@/lib/types";

export function siteUrl(path = ""): string {
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: siteUrl("/"),
    sameAs: [SITE_CONFIG.instagram],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: siteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl("/produtos")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product): JsonLd {
  const stock = totalStock(product);
  const availability =
    stock === 0
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images,
    url: siteUrl(`/produtos/${product.slug}`),
    brand: { "@type": "Brand", name: SITE_CONFIG.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (product.pricePix ?? 0).toFixed(2),
      availability,
      url: siteUrl(`/produtos/${product.slug}`),
      seller: { "@type": "Organization", name: SITE_CONFIG.name },
    },
  };
}

export function dropJsonLd(drop: Drop): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: drop.name,
    description: drop.description,
    startDate: new Date(drop.releaseDate).toISOString(),
    eventStatus:
      drop.status === "archived"
        ? "https://schema.org/EventMovedOnline"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: siteUrl(`/drops/${drop.slug}`),
    },
    image: drop.heroImage ? [drop.heroImage] : undefined,
    organizer: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: siteUrl("/"),
    },
  };
}
