import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalogSchema, providerSchema, type Provider } from "../schemas/catalog";

// The intake is an external, user-controlled JSON contract. Keep dynamic parsing
// isolated here and validate each sanitized publication record with Zod below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordValue = Record<string, any>;
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const argIndex = process.argv.indexOf("--input");
const inputPath = argIndex > -1 ? process.argv[argIndex + 1] : path.join(root, "_reference", "provider-intake-v3", "distilled_marketplace_candidate_intake_v3.json");
const dryRun = process.argv.includes("--dry-run");
if (!inputPath || !fs.existsSync(inputPath)) throw new Error(`Provider intake not found: ${inputPath ?? "missing --input path"}`);
const catalogPath = path.join(root, "data", "marketplace", "catalog.json");
const intake = JSON.parse(fs.readFileSync(inputPath, "utf8")) as RecordValue;
if (intake.contract !== "marketplace-provider-candidate-intake-v3" || !Array.isArray(intake.candidates)) throw new Error("Unexpected provider intake contract");
if (intake.publicationAuthorized !== true) throw new Error("Provider intake root is not owner-authorized for publication");
const categories = new Map<string, RecordValue>((JSON.parse(fs.readFileSync(catalogPath, "utf8")) as RecordValue).categories.map((item: RecordValue) => [item.id, item]));
const purposeValues = new Set<string>(["homepage", "landing_page", "product_page", "pricing_page", "documentation", "help_center", "blog", "resource", "partner_program", "partner_portal", "app_portal", "demo", "registration", "other", "saved_tracking_referral"]);
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "capability";
function isPublicHttps(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.hostname.endsWith(".notion.so") && url.hostname !== "notion.so" && !url.hostname.endsWith(".notion.com"); } catch { return false; }
}
function sourceRecord(url: unknown, label: string, supports: string[] = [], checkedAt?: string) {
  if (!isPublicHttps(url)) return null;
  return { label, url, supports, ...(checkedAt ? { checkedAt } : {}) };
}
function linkPurpose(value: string) { return purposeValues.has(value) ? value : "other"; }

const duplicateIds = new Set<string>();
const duplicateSlugs = new Set<string>();
const idCounts = new Map<string, number>();
const slugCounts = new Map<string, number>();
for (const candidate of intake.candidates as RecordValue[]) {
  idCounts.set(candidate.id, (idCounts.get(candidate.id) ?? 0) + 1);
  slugCounts.set(candidate.slug, (slugCounts.get(candidate.slug) ?? 0) + 1);
}
for (const [id, count] of idCounts) if (count > 1) duplicateIds.add(id);
for (const [slug, count] of slugCounts) if (count > 1) duplicateSlugs.add(slug);

const exceptions: Array<{ id: string; reason: string }> = [];
const published: Provider[] = [];
const referralIds = new Set<string>();
const websiteIds = new Set<string>();
for (const candidate of intake.candidates as RecordValue[]) {
  const id = String(candidate.id ?? "unknown");
  if (candidate.review?.status !== "owner_approved" || candidate.review?.publicationAuthorized !== true || candidate.review?.publiclyPublishable !== true || candidate.review?.approvalScope !== "public_directory_listing_and_saved_destination") {
    exceptions.push({ id, reason: "owner directory approval metadata is incomplete" }); continue;
  }
  if (duplicateIds.has(id)) { exceptions.push({ id, reason: "duplicate provider ID" }); continue; }
  if (duplicateSlugs.has(String(candidate.slug))) { exceptions.push({ id, reason: "duplicate provider slug" }); continue; }
  const category = categories.get(String(candidate.categoryId));
  if (!category) { exceptions.push({ id, reason: `unknown category ${String(candidate.categoryId)}` }); continue; }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(candidate.slug))) { exceptions.push({ id, reason: "invalid stable ID or slug" }); continue; }
  const candidateLinks = Array.isArray(candidate.links) ? candidate.links as RecordValue[] : [];
  const primaryLinks = candidateLinks.filter(link => link.isPrimary === true);
  if (primaryLinks.length !== 1) { exceptions.push({ id, reason: "expected exactly one primary destination" }); continue; }
  const primaryCandidateLink = primaryLinks[0];
  const linkType = candidate.linkType === "saved_tracking_referral" ? "saved_tracking_referral" : candidate.linkType === "inferred_homepage" ? "official_website" : null;
  if (!linkType) { exceptions.push({ id, reason: "unknown primary link classification" }); continue; }
  const primaryUrl = String(candidate.primaryUrl ?? "");
  if (!isPublicHttps(primaryUrl)) { exceptions.push({ id, reason: "primary destination is malformed, unsafe or not HTTPS" }); continue; }
  if (primaryCandidateLink.url !== primaryUrl) { exceptions.push({ id, reason: "typed primary destination does not match primaryUrl" }); continue; }
  const affiliateUrl = linkType === "saved_tracking_referral" ? candidate.affiliateUrl : null;
  if (linkType === "saved_tracking_referral" && (typeof affiliateUrl !== "string" || affiliateUrl !== primaryUrl || primaryCandidateLink.url !== affiliateUrl || primaryCandidateLink.isAffiliate !== true || primaryCandidateLink.linkType !== "saved_tracking_referral")) {
    exceptions.push({ id, reason: "saved referral destination conflicts with the declared primary link" }); continue;
  }
  if (linkType === "official_website" && (affiliateUrl !== null || primaryCandidateLink.isAffiliate === true)) { exceptions.push({ id, reason: "homepage primary is incorrectly classified as an affiliate link" }); continue; }

  const safeLinks = candidateLinks.filter(link => isPublicHttps(link.url) && link.visibility !== "review_only");
  const links = safeLinks.map((link, index) => {
    const isPrimary = link.isPrimary === true;
    const isAffiliate = link.isAffiliate === true;
    const sourceReferences = (Array.isArray(link.sourceReferences) ? link.sourceReferences : []).flatMap((reference: RecordValue) => {
      if (!["official_webpage", "official_documentation", "official_pricing_page"].includes(String(reference.sourceType))) return [];
      const source = sourceRecord(reference.reference, String(reference.sourceType).replaceAll("_", " "));
      return source ? [source] : [];
    });
    return {
      id: slugify(String(link.id ?? `link-${index + 1}`)), url: String(link.url), purpose: linkPurpose(String(link.linkType ?? "other")),
      linkType: isAffiliate ? "saved_tracking_referral" as const : "official_website" as const,
      isPrimary, isAffiliate,
      verificationStatus: ["verified", "invalid", "withdrawn"].includes(String(link.verificationStatus)) ? link.verificationStatus : "not_tested",
      sourceReferences
    };
  });
  const content = candidate.content ?? {};
  const evidence = content.summaryEvidence ?? {};
  const summaryEvidenceSource = sourceRecord(evidence.source, "Description source", ["provider summary"], evidence.checkedAt);
  const sourceMap = new Map<string, ReturnType<typeof sourceRecord>>();
  for (const link of links) for (const source of link.sourceReferences) sourceMap.set(source!.url, source);
  if (summaryEvidenceSource) sourceMap.set(summaryEvidenceSource.url, summaryEvidenceSource);
  const features = (Array.isArray(content.features) ? content.features : []).filter((feature: RecordValue) => typeof feature.title === "string" && feature.title.trim()).map((feature: RecordValue) => {
    const featureSource = sourceRecord(feature.sourceReference, "Feature source", [String(feature.title)]);
    return {
      name: String(feature.title).trim(), ...(typeof feature.description === "string" && feature.description.trim() ? { description: feature.description.trim() } : {}),
      sources: featureSource ? [featureSource] : [], evidenceStatus: String(feature.status ?? "candidate_record")
    };
  });
  const capabilityLabels = [...new Set<string>(features.map((feature: RecordValue) => String(feature.name)))];
  const officialPricingLink = links.find(link => link.purpose === "pricing_page");
  const pricingEvidence = sourceRecord(content.pricing?.sourceReference, "Provider pricing", ["pricing model"], content.pricing?.lastVerifiedAt);
  const publicFaqs = (Array.isArray(content.faq) ? content.faq : []).filter((faq: RecordValue) => typeof faq.question === "string" && faq.question.trim() && typeof faq.answer === "string" && faq.answer.trim()).map((faq: RecordValue) => {
    const faqSource = sourceRecord(faq.sourceReference, "FAQ source", [String(faq.question)]);
    return { question: String(faq.question).trim(), answer: String(faq.answer).trim(), ...(faqSource ? { source: faqSource } : {}) };
  });
  const shortExplanation = typeof content.shortExplanation === "string" ? content.shortExplanation.trim() : "";
  const containsCommissionAmount = /(?:commission|payout)(?:\s+(?:rate|of|at|up\s+to)){0,3}\s*\d+(?:\.\d+)?%|\d+(?:\.\d+)?%\s*(?:commission|payout)/i.test(shortExplanation);
  const summary = shortExplanation && !containsCommissionAmount ? shortExplanation : `Explore ${String(candidate.name)}’s website for current information. Listed in ${String(category.name)}: ${String(category.summary)}`;
  const record = {
    id, name: String(candidate.name), slug: String(candidate.slug), ...(typeof content.h1 === "string" && content.h1.trim() ? { h1: content.h1.trim() } : {}), summary,
    primaryCategoryId: String(candidate.categoryId), categoryIds: [String(candidate.categoryId)],
    primaryUrl, affiliateUrl, linkType, approvalStatus: "owner_approved" as const, status: "published" as const,
    relationshipStatus: String(candidate.ownership?.commercialRelationshipStatus ?? "not_recorded"),
    linkHealthStatus: candidate.enrichment?.linkDestinationTested === true ? "working" as const : "not_tested" as const,
    links, ...(isPublicHttps(candidate.media?.logoUrl) ? { logoUrl: candidate.media.logoUrl } : {}),
    capabilities: capabilityLabels.map((value: string) => slugify(value)), capabilityLabels, audiences: [], stages: [], suitableFor: [], features,
    limitations: Array.isArray(content.limitations) ? content.limitations.filter((value: unknown) => typeof value === "string" && value.trim()) : [],
    integrations: Array.isArray(content.integrations) ? content.integrations.filter((value: unknown) => typeof value === "string" && value.trim()) : [],
    ...(content.howItWorks && (content.howItWorks.summary || content.howItWorks.steps?.length) ? {
      howItWorks: { ...(content.howItWorks.summary ? { summary: String(content.howItWorks.summary) } : {}), steps: Array.isArray(content.howItWorks.steps) ? content.howItWorks.steps.filter((step: unknown) => typeof step === "string" && step.trim()) : [], sources: sourceRecord(content.howItWorks.sourceReference, "How it works source") ? [sourceRecord(content.howItWorks.sourceReference, "How it works source")] : [] }
    } : {}),
    faqs: publicFaqs,
    ...(officialPricingLink && content.pricing?.model && content.pricing.model !== "unknown" ? { pricingModel: String(content.pricing.model) } : {}),
    ...(officialPricingLink && pricingEvidence ? { pricingSource: pricingEvidence } : {}),
    sources: [...sourceMap.values()].filter((source): source is NonNullable<typeof source> => source !== null),
    ...(typeof evidence.classification === "string" ? { summaryEvidence: { classification: evidence.classification, ...(summaryEvidenceSource ? { sourceUrl: summaryEvidenceSource.url } : {}) } } : {}),
    ...(candidate.review?.linkCheckedAt ? { linkLastCheckedAt: candidate.review.linkCheckedAt } : {}),
    ...(candidate.review?.relationshipCheckedAt ? { relationshipLastCheckedAt: candidate.review.relationshipCheckedAt } : {}),
    ...(candidate.review?.productClaimsCheckedAt ? { productInfoUpdatedAt: candidate.review.productClaimsCheckedAt } : {}),
    ...(candidate.review?.pricingCheckedAt ? { pricingLastCheckedAt: candidate.review.pricingCheckedAt } : {}),
    ...(linkType === "saved_tracking_referral" ? { disclaimer: "Saved referral link. Current attribution and commercial terms have not been independently confirmed." } : {}),
    ...(content.metaTitleDraft ? { metadataTitle: String(content.metaTitleDraft) } : {}), ...(content.metaDescriptionDraft ? { metadataDescription: String(content.metaDescriptionDraft) } : {}),
    relatedProviderIds: []
  };
  const parsed = providerSchema.safeParse(record);
  if (!parsed.success) {
    exceptions.push({ id, reason: `publication record shape: ${parsed.error.issues.map(issue => issue.path.join(".")).join(", ")}` });
    continue;
  }
  published.push(parsed.data);
  if (linkType === "saved_tracking_referral") referralIds.add(id); else websiteIds.add(id);
}

const catalogData = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as RecordValue;
const sourceIds = new Set((intake.candidates as RecordValue[]).map(candidate => String(candidate.id)));
const authoredProviders = (catalogData.providers as RecordValue[]).filter(provider => !sourceIds.has(provider.id));
const merged = [...authoredProviders, ...published];
const fullCatalog = catalogSchema.safeParse({ ...catalogData, providers: merged });
if (!fullCatalog.success) throw new Error(`Catalog validation failed: ${fullCatalog.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
catalogData.providers = merged;
if (!dryRun) fs.writeFileSync(catalogPath, `${JSON.stringify(catalogData, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  dryRun, candidates: intake.candidates.length, published: published.length, referralPrimaryLinksPreserved: referralIds.size,
  officialWebsitePrimaryLinks: websiteIds.size, catalogProvidersTotal: merged.length, providerExceptions: exceptions
}, null, 2));
