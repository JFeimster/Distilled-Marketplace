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
  unique(catalog.workflowBlueprints.map(x => x.id), "workflow ID");
  unique(catalog.workflowBlueprints.map(x => x.slug), "workflow slug");
  unique(catalog.offers.map(x => x.id), "offer ID");
  unique(catalog.comparisons.map(x => x.id), "comparison ID");
  const categories = new Set(catalog.categories.map(x => x.id));
  const categoryById = new Map(catalog.categories.map(x => [x.id, x]));
  const providers = new Set(catalog.providers.filter(x => x.status === "published" || x.status === "needs_update").map(x => x.id));
  const industryTags = [...new Set(catalog.workflowBlueprints.filter(x => x.status === "published").flatMap(x => x.industryTags))];
  const validRoutes = new Set(["/", "/directory", "/categories", "/compare", "/collections", "/deals", "/about", "/disclosures", "/submit", "/workflows", "/integrations", "/compatibility", "/playbooks", ...catalog.categories.map(x => `/categories/${x.id}`), ...catalog.collections.map(x => `/collections/${x.id}`), ...catalog.providers.map(x => `/providers/${x.slug}`), ...catalog.workflowBlueprints.map(x => `/workflows/${x.slug}`), ...industryTags.map(x => `/playbooks/${x}`), ...catalog.comparisons.map(x => `/compare/${x.id}`)]);
  const approvedExternalResources = new Set(catalog.crossPropertyLinks.map(link => link.url));
  const validResource = (url: string) => url.startsWith("/") ? validRoutes.has(url) : approvedExternalResources.has(url);
  for (const category of catalog.categories) for (const id of category.related) if (!categories.has(id) || id === category.id) errors.push(`Bad related category ${category.id} -> ${id}`);
  for (const collection of catalog.collections) for (const id of collection.categoryIds) if (!categories.has(id)) errors.push(`Unknown collection category ${collection.id} -> ${id}`);
  for (const provider of catalog.providers) {
    if (!categories.has(provider.primaryCategoryId) || !provider.categoryIds.includes(provider.primaryCategoryId)) errors.push(`Bad primary category for ${provider.id}`);
    if (provider.serviceGroup && provider.serviceGroup !== categoryById.get(provider.primaryCategoryId)?.group) errors.push(`Service group must match taxonomy for ${provider.id}`);
    for (const id of provider.categoryIds) if (!categories.has(id)) errors.push(`Unknown provider category ${provider.id} -> ${id}`);
    if (provider.status === "published" && provider.approvalStatus !== "owner_approved") errors.push(`Published provider lacks owner approval: ${provider.id}`);
    for (const message of affiliateLinkErrors(provider)) errors.push(`${message}: ${provider.id}`);
    const primary = provider.links.find(link => link.isPrimary);
    for (const link of provider.links) if (link.deepLinkSupported && (!link.isAffiliate || link.sourceReferences.length === 0)) errors.push(`Tracked deep link needs partner documentation for ${provider.id}: ${link.id}`);
    for (const cta of provider.ctas) {
      const link = cta.linkRef === "primary" ? primary : provider.links.find(value => value.id === cta.linkRef);
      if (!link) errors.push(`Unknown CTA link for ${provider.id}: ${cta.linkRef}`);
      else if (cta.placement === "primary" && !link.isPrimary) errors.push(`Primary CTA must use primary link for ${provider.id}`);
      else if (primary?.isAffiliate && !link.isPrimary && !link.isAffiliate) errors.push(`Affiliate CTA cannot bypass primary link for ${provider.id}`);
    }
    for (const id of provider.relatedProviderIds) if (!providers.has(id)) errors.push(`Unknown related provider ${provider.id} -> ${id}`);
    for (const resource of provider.relatedResources) if (!validResource(resource.url)) errors.push(`Unapproved related resource for ${provider.id}: ${resource.url}`);
    for (const workflow of [...provider.workflowTemplates, ...provider.promptTemplates]) if (workflow.resourceUrl && !validResource(workflow.resourceUrl)) errors.push(`Unapproved workflow resource for ${provider.id}: ${workflow.resourceUrl}`);
  }
  for (const offer of catalog.offers) if (!providers.has(offer.providerId)) errors.push(`Unknown offer provider ${offer.id}`);
  for (const blueprint of catalog.workflowBlueprints) {
    for (const id of blueprint.providerIds) if (!providers.has(id)) errors.push(`Unknown workflow provider ${blueprint.id} -> ${id}`);
    for (const id of blueprint.categoryIds) if (!categories.has(id)) errors.push(`Unknown workflow category ${blueprint.id} -> ${id}`);
    if (new Set(blueprint.providerIds).size !== blueprint.providerIds.length) errors.push(`Duplicate workflow provider for ${blueprint.id}`);
    for (const evidence of blueprint.integrationEvidence) {
      if (evidence.providerIds[0] === evidence.providerIds[1] || evidence.providerIds.some(id => !blueprint.providerIds.includes(id))) errors.push(`Invalid workflow integration evidence for ${blueprint.id}`);
    }
  }
  for (const comparison of catalog.comparisons) for (const id of comparison.providerIds) if (!providers.has(id)) errors.push(`Unknown comparison provider ${comparison.id} -> ${id}`);
  const routes = [
    ...catalog.categories.map(x => `/categories/${x.id}`), ...catalog.collections.map(x => `/collections/${x.id}`),
    ...catalog.providers.filter(x => x.status === "published" || x.status === "needs_update").map(x => `/providers/${x.slug}`),
    ...catalog.workflowBlueprints.filter(x => x.status === "published").map(x => `/workflows/${x.slug}`),
    ...industryTags.map(x => `/playbooks/${x}`),
    ...catalog.comparisons.map(x => `/compare/${x.id}`)
  ];
  unique(routes, "route");
  return { catalog: catalog as Catalog, errors };
}
