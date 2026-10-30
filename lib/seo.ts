import type { Metadata } from "next";
import { canonical, site } from "@/lib/config";

export function pageMetadata(title: string, description: string, route: string): Metadata {
  return { title, description, alternates: { canonical: canonical(route) },
    robots: { index: false, follow: false }, openGraph: { title, description, url: canonical(route), siteName: site.name, type: "website" } };
}
export function jsonLd(title: string, description: string, route: string, crumbs: { name: string; route: string }[]) {
  const url = canonical(route);
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url },
    { "@type": "WebPage", "@id": `${url}#webpage`, name: title, description, url, isPartOf: { "@id": `${site.url}/#website` } },
    { "@type": "BreadcrumbList", itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: canonical(item.route) })) }
  ] };
}
export const safeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
