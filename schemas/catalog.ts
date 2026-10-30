import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.date();
const httpsUrl = z.url().refine(value => { try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; } }, "Use a public HTTPS URL without credentials");
const resourceDestination = z.union([httpsUrl, z.string().regex(/^\/(?!\/)[a-z0-9\-/]*$/)]);
const category = z.object({
  id: slug, name: z.string().min(3), group: z.enum(["Money", "Growth", "Systems", "People & risk"]),
  summary: z.string().min(50), question: z.string().min(20), watchFor: z.string().min(25),
  capabilities: z.array(slug).min(1), audiences: z.array(z.enum(["owner", "operator"])).min(1),
  stages: z.array(z.enum(["starting", "growing", "established"])).min(1), related: z.array(slug).min(1)
});
const collection = z.object({
  id: slug, name: z.string().min(4), summary: z.string().min(40), audience: z.string().min(4),
  categoryIds: z.array(slug).min(3), decision: z.string().min(40)
});
const publicSource = z.object({ label: z.string().min(2), url: httpsUrl, checkedAt: date.optional(), supports: z.array(z.string()).default([]) });
export const providerLinkPurposes = ["homepage", "landing_page", "product_page", "pricing_page", "documentation", "help_center", "blog", "resource", "partner_program", "partner_portal", "app_portal", "demo", "registration", "other", "saved_tracking_referral"] as const;
export const providerLifecycleStates = ["owner_approved", "published", "needs_update", "inactive", "excluded"] as const;
const providerLink = z.object({
  id: slug, url: httpsUrl, purpose: z.enum(providerLinkPurposes), linkType: z.enum(["official_website", "saved_tracking_referral"]),
  isPrimary: z.boolean(), isAffiliate: z.boolean(), verificationStatus: z.enum(["verified", "not_tested", "invalid", "withdrawn"]).default("not_tested"),
  sourceReferences: z.array(publicSource).default([]), ctaLabel: z.string().min(2).optional(),
  deepLinkSupported: z.boolean().default(false), trackingProvider: z.string().optional()
});
const media = z.object({ url: httpsUrl, alt: z.string().min(3), type: z.enum(["image", "video"]).default("image"), caption: z.string().optional() });
const feature = z.object({ name: z.string().min(2), description: z.string().optional(), icon: z.string().optional(), media: media.optional(), sources: z.array(publicSource).default([]), evidenceStatus: z.string().optional() });
const workflow = z.object({ id: slug, title: z.string().min(3), description: z.string().optional(), requirements: z.array(z.string()).default([]), steps: z.array(z.string()).min(1), expectedOutput: z.string().optional(), resourceUrl: resourceDestination.optional() });
const resource = z.object({ id: slug, title: z.string().min(2), type: z.enum(["article", "video", "calculator", "solution", "site", "guide", "template", "partner_resource"]), url: resourceDestination, description: z.string().min(3), thumbnail: httpsUrl.optional() });
const cta = z.object({ label: z.string().min(2), linkRef: z.string().min(1), placement: z.enum(["primary", "secondary", "pricing", "final"]), icon: z.string().optional() });
export const providerSchema = z.object({
  id: slug, name: z.string().min(2), slug, h1: z.string().min(2).optional(), summary: z.string().min(2),
  primaryCategoryId: slug, categoryIds: z.array(slug).min(1), serviceGroup: z.enum(["Money", "Growth", "Systems", "People & risk"]).optional(),
  primaryUrl: httpsUrl, affiliateUrl: httpsUrl.nullable(), linkType: z.enum(["saved_tracking_referral", "official_website"]),
  approvalStatus: z.literal("owner_approved"), status: z.enum(providerLifecycleStates),
  relationshipStatus: z.string().optional(), linkHealthStatus: z.enum(["not_tested", "working", "broken", "withdrawn"]).default("not_tested"),
  links: z.array(providerLink).min(1), logoUrl: httpsUrl.nullable().optional(), iconUrl: httpsUrl.nullable().optional(),
  capabilities: z.array(slug).default([]), capabilityLabels: z.array(z.string().min(2)).default([]), searchKeywords: z.array(z.string()).default([]),
  audiences: z.array(z.string()).default([]), stages: z.array(z.string()).default([]), roles: z.array(z.string()).default([]), businessStages: z.array(z.string()).default([]), suitableFor: z.array(z.string()).default([]),
  serviceTypes: z.array(z.string()).default([]), useCases: z.array(z.string()).default([]), industries: z.array(z.string()).default([]),
  hero: z.object({ headline: z.string().optional(), description: z.string().optional(), media: media.optional() }).optional(),
  media: z.array(media).default([]), featuredMedia: media.optional(),
  features: z.array(feature).default([]), limitations: z.array(z.string()).default([]), integrations: z.array(z.string()).default([]),
  howItWorks: z.object({ summary: z.string().optional(), steps: z.array(z.string()).default([]), sources: z.array(publicSource).default([]) }).optional(),
  workflowTemplates: z.array(workflow).default([]), promptTemplates: z.array(workflow).default([]),
  inputs: z.array(z.string()).default([]), outputs: z.array(z.string()).default([]),
  audienceFit: z.object({ roles: z.array(z.string()).default([]), businessStages: z.array(z.string()).default([]), industries: z.array(z.string()).default([]), problems: z.array(z.string()).default([]) }).optional(),
  faqs: z.array(z.object({ question: z.string().min(5), answer: z.string().min(5), source: publicSource.optional() })).default([]),
  pricingModel: z.string().optional(), pricingSource: publicSource.nullable().optional(), serviceCoverage: z.string().optional(),
  pricing: z.object({ model: z.string().optional(), startingPrice: z.string().optional(), billingPeriod: z.string().optional(), trialAvailable: z.boolean().optional(), freeTierAvailable: z.boolean().optional(), notes: z.string().optional(), source: publicSource.optional(), linkRef: z.string().optional() }).optional(),
  relatedResources: z.array(resource).default([]), ctas: z.array(cta).default([]),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  sources: z.array(publicSource).default([]), summaryEvidence: z.object({ classification: z.string(), sourceUrl: httpsUrl.optional() }).optional(),
  lastVerified: date.optional(), linkLastCheckedAt: date.nullable().optional(), relationshipLastCheckedAt: date.nullable().optional(),
  productInfoUpdatedAt: date.nullable().optional(), pricingLastCheckedAt: date.nullable().optional(),
  disclaimer: z.string().optional(), metadataTitle: z.string().optional(), metadataDescription: z.string().optional(), relatedProviderIds: z.array(slug).default([])
});
const offer = z.object({
  id: slug, providerId: slug, title: z.string().min(5), terms: z.string().min(20),
  source: z.object({ label: z.string().min(4), url: httpsUrl, checkedAt: date, supports: z.array(z.string().min(4)).min(1) }),
  startsAt: date, expiresAt: date, destination: httpsUrl, lastVerified: date, editorialStatus: z.literal("verified")
});
const comparison = z.object({ id: slug, title: z.string().min(10), providerIds: z.array(slug).min(2), summary: z.string().min(50), reviewedAt: date, sources: z.array(z.object({ label: z.string().min(2), url: httpsUrl, checkedAt: date.optional(), supports: z.array(z.string()).default([]) })).min(1) });
const crossLink = z.object({ id: slug, label: z.string(), url: httpsUrl, status: z.enum(["verified-preview", "verified-public"]), context: z.string() });
export const catalogSchema = z.object({
  version: z.literal(1), updated: date, editorialStatus: z.literal("staging"),
  categories: z.array(category).min(1), collections: z.array(collection), providers: z.array(providerSchema), offers: z.array(offer), comparisons: z.array(comparison), crossPropertyLinks: z.array(crossLink)
});
export type Catalog = z.infer<typeof catalogSchema>;
export type Category = Catalog["categories"][number];
export type Collection = Catalog["collections"][number];
export type Provider = z.infer<typeof providerSchema>;
