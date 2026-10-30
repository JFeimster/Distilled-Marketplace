import { catalog } from "@/lib/catalog";
export const fixedRoutes = ["/", "/directory", "/categories", "/compare", "/collections", "/deals", "/about", "/disclosures", "/submit"] as const;
export const routes = [...fixedRoutes, ...catalog.categories.map(item => `/categories/${item.id}`), ...catalog.collections.map(item => `/collections/${item.id}`), ...catalog.providers.map(item => `/providers/${item.slug}`), ...catalog.comparisons.map(item => `/compare/${item.id}`)];
