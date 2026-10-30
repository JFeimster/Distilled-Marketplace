import { catalogSchema, type Catalog } from "@/schemas/catalog";

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
  const providers = new Set(catalog.providers.map(x => x.id));
  for (const category of catalog.categories) for (const id of category.related) if (!categories.has(id) || id === category.id) errors.push(`Bad related category ${category.id} -> ${id}`);
  for (const collection of catalog.collections) for (const id of collection.categoryIds) if (!categories.has(id)) errors.push(`Unknown collection category ${collection.id} -> ${id}`);
  for (const provider of catalog.providers) {
    if (!categories.has(provider.primaryCategoryId) || !provider.categoryIds.includes(provider.primaryCategoryId)) errors.push(`Bad primary category for ${provider.id}`);
    for (const id of provider.categoryIds) if (!categories.has(id)) errors.push(`Unknown provider category ${provider.id} -> ${id}`);
    if (provider.affiliateRelationship === "documented" && !provider.sources.some(source => source.supports.includes("affiliate relationship"))) errors.push(`Affiliate relationship lacks source: ${provider.id}`);
    if (provider.pricingModel.toLowerCase() !== "unknown" && !provider.pricingSource) errors.push(`Pricing model lacks source: ${provider.id}`);
    if (provider.lastVerified > catalog.updated || provider.reviewedAt > catalog.updated || provider.outboundVerifiedAt > catalog.updated) errors.push(`Future verification date: ${provider.id}`);
    if (Date.parse(catalog.updated) - Date.parse(provider.lastVerified) > 180 * 86400000) errors.push(`Stale provider verification: ${provider.id}`);
    for (const source of provider.sources) if (source.checkedAt > catalog.updated) errors.push(`Future provider source date: ${provider.id}`);
  }
  for (const offer of catalog.offers) {
    if (!providers.has(offer.providerId)) errors.push(`Unknown offer provider ${offer.id}`);
    if (offer.expiresAt < catalog.updated || offer.startsAt > catalog.updated) errors.push(`Inactive offer ${offer.id}`);
    if (offer.lastVerified > catalog.updated || offer.source.checkedAt > catalog.updated) errors.push(`Future offer verification: ${offer.id}`);
    if (Date.parse(catalog.updated) - Date.parse(offer.lastVerified) > 30 * 86400000) errors.push(`Stale offer verification: ${offer.id}`);
  }
  for (const comparison of catalog.comparisons) for (const id of comparison.providerIds) if (!providers.has(id)) errors.push(`Unknown comparison provider ${comparison.id} -> ${id}`);
  unique([...new Set(catalog.categories.map(x => `/categories/${x.id}`)), ...catalog.collections.map(x => `/collections/${x.id}`), ...catalog.providers.map(x => `/providers/${x.slug}`), ...catalog.comparisons.map(x => `/compare/${x.id}`)], "route");
  return { catalog: catalog as Catalog, errors };
}
