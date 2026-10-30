import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.date();
const httpsUrl = z.url().refine(value => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }, "Use a public HTTPS URL without credentials");
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
const source = z.object({ label: z.string().min(4), url: httpsUrl, checkedAt: date, supports: z.array(z.string().min(4)).min(1) });
export const providerSchema = z.object({
  id: slug, name: z.string().min(2), slug, summary: z.string().min(60), legalIdentity: z.string().min(2),
  homepageUrl: httpsUrl, primaryCategoryId: slug, categoryIds: z.array(slug).min(1),
  capabilities: z.array(slug), audiences: z.array(z.enum(["owner", "operator"])),
  stages: z.array(z.enum(["starting", "growing", "established"])),
  suitableFor: z.array(z.string().min(12)).min(1), limitations: z.array(z.string().min(12)).min(1),
  integrations: z.array(z.string()), pricingModel: z.string().min(3), pricingSource: source.nullable(),
  serviceCoverage: z.string().min(3), sources: z.array(source).min(1), lastVerified: date,
  editorialStatus: z.literal("verified"), affiliateRelationship: z.enum(["none", "documented"]),
  outboundUrl: httpsUrl, outboundVerifiedAt: date, disclaimer: z.string().min(10),
  reviewedAt: date, indexStatus: z.enum(["noindex", "reviewed-for-indexing"])
});
const offer = z.object({
  id: slug, providerId: slug, title: z.string().min(5), terms: z.string().min(20),
  source, startsAt: date, expiresAt: date, destination: httpsUrl, lastVerified: date,
  editorialStatus: z.literal("verified")
});
const comparison = z.object({ id: slug, title: z.string().min(10), providerIds: z.array(slug).min(2),
  summary: z.string().min(50), reviewedAt: date, sources: z.array(source).min(2) });
const crossLink = z.object({ id: slug, label: z.string(), url: httpsUrl, status: z.enum(["verified-preview", "verified-public"]), context: z.string() });
export const catalogSchema = z.object({
  version: z.literal(1), updated: date, editorialStatus: z.literal("staging"),
  categories: z.array(category).min(1), collections: z.array(collection),
  providers: z.array(providerSchema), offers: z.array(offer), comparisons: z.array(comparison),
  crossPropertyLinks: z.array(crossLink)
});
export type Catalog = z.infer<typeof catalogSchema>;
export type Category = Catalog["categories"][number];
export type Collection = Catalog["collections"][number];
export type Provider = z.infer<typeof providerSchema>;
