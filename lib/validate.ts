import { catalogSchema, type Catalog } from "@/schemas/catalog";
import { affiliateLinkErrors } from "@/lib/affiliate-links";

export function validateCatalog(input: unknown) {
  const catalog = catalogSchema.parse(input);
  const errors: string[] = [];
  const unique = (values: string[], label: string) => { const seen = new Set<string>(); for (const value of values) { if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`); seen.add(value); } };
  unique(catalog.categories.map(x => x.id), "category ID");
  unique(catalog.collections.map(x => x.id), "collection ID");
  unique(catalog.providers.map(x => x.id), "provider ID");
  unique(catalog.providers.map(x => x.slug), "provider slug");
  unique(catalog.offers.map(x => x.id), "offer ID");
  unique(catalog.comparisons.map(x => x.id), "comparison ID");
  const categories = new Set(catalog.categories.map(x => x.id));
  const providers = new Set(catalog.providers.filter(x => x.status === "published" || x.status === "needs_update").map(x => x.id));
  for (const category of catalog.categories) for (const id of category.related) if (!categories.has(id) || id === category.id) errors.push(`Bad related category ${category.id} -> ${id}`);
  for (const collection of catalog.collections) for (const id of collection.categoryIds) if (!categories.has(id)) errors.push(`Unknown collection category ${collection.id} -> ${id}`);
  for (const provider of catalog.providers) {
    if (!categories.has(provider.primaryCategoryId) || !provider.categoryIds.includes(provider.primaryCategoryId)) errors.push(`Bad primary category for ${provider.id}`);
    for (const id of provider.categoryIds) if (!categories.has(id)) errors.push(`Unknown provider category ${provider.id} -> ${id}`);
    if (provider.status === "published" && provider.approvalStatus !== "owner_approved") errors.push(`Published provider lacks owner approval: ${provider.id}`);
    for (const message of affiliateLinkErrors(provider)) errors.push(`${message}: ${provider.id}`);
    for (const id of provider.relatedProviderIds) if (!providers.has(id)) errors.push(`Unknown related provider ${provider.id} -> ${id}`);
  }
  for (const offer of catalog.offers) if (!providers.has(offer.providerId)) errors.push(`Unknown offer provider ${offer.id}`);
  for (const comparison of catalog.comparisons) for (const id of comparison.providerIds) if (!providers.has(id)) errors.push(`Unknown comparison provider ${comparison.id} -> ${id}`);
  const routes = [
    ...catalog.categories.map(x => `/categories/${x.id}`), ...catalog.collections.map(x => `/collections/${x.id}`),
    ...catalog.providers.filter(x => x.status === "published" || x.status === "needs_update").map(x => `/providers/${x.slug}`),
    ...catalog.comparisons.map(x => `/compare/${x.id}`)
  ];
  unique(routes, "route");
  return { catalog: catalog as Catalog, errors };
}
