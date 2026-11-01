import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalogSchema, providerSchema, type Provider } from "../schemas/catalog";
import { reconcileProviderCatalog } from "../lib/provider-import-reconciliation";

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
const fallbackCopy: Record<string, string> = {
  "accounting-bookkeeping": "Compare accounting support around reconciliations, reporting, and tax handoffs.", "ai-automation": "Evaluate automation around repeatable tasks, data quality, and human review.",
  "banking-neobanking": "Compare business accounts around access, cash movement, and controls.", "budgeting-finops": "Evaluate spending visibility, planning routines, and reporting needs.",
  "business-credit": "Review business credit education, records, and product fit before applying.", "crm-sales": "Compare customer records, follow-up processes, and sales handoffs.",
  ecommerce: "Evaluate storefront operations, order flow, and customer experience.", financing: "Compare financing approaches against your timing, documentation, and repayment needs.",
  "hr-payroll": "Review hiring, payroll, and people operations against your team needs.", "insurance-benefits": "Compare coverage and benefits against your business risks and workforce.",
  "legal-compliance": "Evaluate legal and compliance support for your obligations and recordkeeping.", "marketing-seo": "Compare marketing tools around channels, measurement, and campaign workflow.",
  "payments-pos": "Review payment acceptance, checkout, and reconciliation needs.", productivity: "Compare ways to coordinate work, handoffs, and shared knowledge.",
  "real-estate-services": "Evaluate property workflows, records, and transaction support.", "social-media-content": "Compare content planning, publishing, and audience workflow."
};
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
  const linkType = candidate.linkType === "saved_tracking_referral" ? "saved_tracking_referral" : ["inferred_homepage", "official_website"].includes(String(candidate.linkType)) ? "official_website" : null;
  if (!linkType) { exceptions.push({ id, reason: "unknown primary link classification" }); continue; }
  const primaryUrl = String(candidate.primaryUrl ?? "");
  if (!isPublicHttps(primaryUrl)) { exceptions.push({ id, reason: "primary destination is malformed, unsafe or not HTTPS" }); continue; }
  if (primaryCandidateLink.url !== primaryUrl) { exceptions.push({ id, reason: "typed primary destination does not match primaryUrl" }); continue; }
  const affiliateUrl = linkType === "saved_tracking_referral" ? candidate.affiliateUrl : null;
  if (linkType === "saved_tracking_referral" && (typeof affiliateUrl !== "string" || affiliateUrl !== primaryUrl || primaryCandidateLink.url !== affiliateUrl || primaryCandidateLink.isAffiliate !== true || primaryCandidateLink.linkType !== "saved_tracking_referral")) {
    exceptions.push({ id, reason: "saved referral destination conflicts with the declared primary link" }); continue;
  }
  if (linkType === "official_website" && (affiliateUrl !== null || primaryCandidateLink.isAffiliate === true)) { exceptions.push({ id, reason: "homepage primary is incorrectly classified as an affiliate link" }); continue; }

  const safeLinks = candidateLinks.filter(link => isPublicHttps(link.url) && link.visibility !== "review_only" && (link.isAffiliate !== true || link.isPrimary === true));
  const links = safeLinks.map((link, index) => {
    const isPrimary = link.isPrimary === true;
    const isAffiliate = link.isAffiliate === true;
    const sourceReferences = (Array.isArray(link.sourceReferences) ? link.sourceReferences : []).flatMap((reference: RecordValue) => {
      const direct = isPublicHttps(reference.url) && typeof reference.label === "string";
      if (!direct && !["official_webpage", "official_documentation", "official_pricing_page"].includes(String(reference.sourceType))) return [];
      const source = direct ? sourceRecord(reference.url, reference.label, Array.isArray(reference.supports) ? reference.supports : [], reference.checkedAt) : sourceRecord(reference.reference, String(reference.sourceType).replaceAll("_", " "));
      return source ? [source] : [];
    });
    return {
      id: slugify(String(link.id ?? `link-${index + 1}`)), url: String(link.url), purpose: linkPurpose(String(link.purpose ?? link.linkType ?? "other")),
      linkType: isAffiliate ? "saved_tracking_referral" as const : "official_website" as const,
      isPrimary, isAffiliate,
      ...(typeof link.ctaLabel === "string" ? { ctaLabel: link.ctaLabel } : {}), deepLinkSupported: link.deepLinkSupported === true,
      ...(typeof link.trackingProvider === "string" ? { trackingProvider: link.trackingProvider } : {}),
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
  const features = (Array.isArray(content.features) ? content.features : []).filter((feature: RecordValue) =>
    typeof (feature.title ?? feature.name) === "string" && String(feature.title ?? feature.name).trim() &&
    isPublicHttps(feature.sourceReference) && feature.sourceReference === evidence.source && typeof evidence.checkedAt === "string"
  ).map((feature: RecordValue) => {
    const featureSource = sourceRecord(feature.sourceReference, "Official product information", [String(feature.title ?? feature.name)], evidence.checkedAt);
    return {
      name: String(feature.title ?? feature.name).trim(), ...(typeof feature.description === "string" && feature.description.trim() ? { description: feature.description.trim() } : {}),
      ...(typeof feature.icon === "string" ? { icon: feature.icon } : {}), ...(feature.media ? { media: feature.media } : {}),
      sources: featureSource ? [featureSource] : [], evidenceStatus: String(feature.status ?? "candidate_record")
    };
  });
  const capabilityLabels = [...new Set<string>(features.map((feature: RecordValue) => String(feature.name)))];
  const officialPricingLink = links.find(link => link.purpose === "pricing_page");
  const pricingEvidence = sourceRecord(content.pricing?.sourceReference, "Provider pricing", ["pricing model"], content.pricing?.lastVerifiedAt);
  const publicFaqs = (Array.isArray(content.faq) ? content.faq : []).filter((faq: RecordValue) => typeof faq.question === "string" && faq.question.trim() && typeof faq.answer === "string" && faq.answer.trim() && isPublicHttps(faq.sourceReference) && faq.sourceReference === evidence.source && evidence.checkedAt).map((faq: RecordValue) => {
    const faqSource = sourceRecord(faq.sourceReference, "Official product information", [String(faq.question)], evidence.checkedAt);
    return { question: String(faq.question).trim(), answer: String(faq.answer).trim(), ...(faqSource ? { source: faqSource } : {}) };
  });
  const shortExplanation = typeof content.shortExplanation === "string" ? content.shortExplanation.trim() : "";
  const containsCommissionAmount = /(?:commission|payout)(?:\s+(?:rate|of|at|up\s+to)){0,3}\s*\d+(?:\.\d+)?%|\d+(?:\.\d+)?%\s*(?:commission|payout)/i.test(shortExplanation);
  const summary = shortExplanation && summaryEvidenceSource && !containsCommissionAmount ? shortExplanation : `${String(candidate.name)}: ${fallbackCopy[String(candidate.categoryId)]}`;
  const approvedCategories = Array.isArray(candidate.review?.approvedCategoryIds) ? candidate.review.approvedCategoryIds.filter((value: unknown) => typeof value === "string" && categories.has(value)) : [];
  const categoryIds = [...new Set([String(candidate.categoryId), ...approvedCategories])];
  const optionalFields = ["hero", "featuredMedia", "serviceTypes", "useCases", "industries", "workflowTemplates", "promptTemplates", "inputs", "outputs", "audienceFit", "relatedProviderIds", "relatedResources", "seo"];
  const optionalContent = Object.fromEntries(optionalFields.filter(field => content[field] !== undefined || candidate[field] !== undefined).map(field => [field, content[field] ?? candidate[field]]));
  if (Array.isArray(content.media)) optionalContent.media = content.media.filter((item: RecordValue) => isPublicHttps(item?.url) && typeof item?.alt === "string" && item.alt.trim().length >= 3).map((item: RecordValue) => ({ url: item.url, alt: item.alt.trim(), ...(item.type === "video" ? { type: "video" } : { type: "image" }), ...(typeof item.caption === "string" ? { caption: item.caption } : {}) }));
  delete optionalContent.pricing;
  const record = {
    id, name: String(candidate.name), slug: String(candidate.slug), ...(summaryEvidenceSource && typeof content.h1 === "string" && content.h1.trim() ? { h1: content.h1.trim() } : {}), summary,
    primaryCategoryId: String(candidate.categoryId), categoryIds, serviceGroup: category.group,
    primaryUrl, affiliateUrl, linkType, approvalStatus: "owner_approved" as const, status: "published" as const,
    relationshipStatus: String(candidate.ownership?.commercialRelationshipStatus ?? "not_recorded"),
    linkHealthStatus: candidate.enrichment?.linkDestinationTested === true ? "working" as const : "not_tested" as const,
    links,
    capabilities: Array.isArray(content.capabilities) ? content.capabilities : capabilityLabels.map((value: string) => slugify(value)), capabilityLabels,
    audiences: Array.isArray(content.audiences) ? content.audiences : [], stages: Array.isArray(content.stages) ? content.stages : [],
    roles: Array.isArray(content.roles) ? content.roles : Array.isArray(content.audiences) ? content.audiences : category.audiences,
    businessStages: Array.isArray(content.businessStages) ? content.businessStages : Array.isArray(content.stages) ? content.stages : category.stages,
    searchKeywords: Array.isArray(content.searchKeywords) ? content.searchKeywords : capabilityLabels, suitableFor: [], features, ...optionalContent,
    limitations: Array.isArray(content.limitations) ? content.limitations.filter((value: unknown) => typeof value === "string" && value.trim()) : [],
    integrations: Array.isArray(content.integrations) ? content.integrations.filter((value: unknown) => typeof value === "string" && value.trim()) : [],
    ...(content.howItWorks && (content.howItWorks.summary || content.howItWorks.steps?.length) && isPublicHttps(content.howItWorks.sourceReference ?? evidence.source) && (content.howItWorks.sourceReference ?? evidence.source) === evidence.source && evidence.checkedAt ? {
      howItWorks: { ...(content.howItWorks.summary ? { summary: String(content.howItWorks.summary) } : {}), steps: Array.isArray(content.howItWorks.steps) ? content.howItWorks.steps.filter((step: unknown) => typeof step === "string" && step.trim()) : [], sources: [sourceRecord(evidence.source, "Official product information", ["How it works"], evidence.checkedAt)!] }
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
    ...(linkType === "saved_tracking_referral" ? { disclaimer: "Affiliate relationship details are managed privately." } : {}),
    ...(content.metaTitleDraft ? { metadataTitle: String(content.metaTitleDraft) } : {}), ...(content.metaDescriptionDraft && summaryEvidenceSource ? { metadataDescription: String(content.metaDescriptionDraft) } : summaryEvidenceSource && shortExplanation ? { metadataDescription: summary } : {}),
    ...(content.pricing && pricingEvidence && officialPricingLink ? { pricing: {
      ...(typeof content.pricing.model === "string" && content.pricing.model !== "unknown" ? { model: content.pricing.model } : {}),
      ...(typeof content.pricing.amount === "string" ? { startingPrice: content.pricing.amount } : {}),
      ...(typeof content.pricing.billingPeriod === "string" ? { billingPeriod: content.pricing.billingPeriod } : {}),
      ...(typeof content.pricing.trial === "boolean" ? { trialAvailable: content.pricing.trial } : {}),
      ...(typeof content.pricing.freePlan === "boolean" ? { freeTierAvailable: content.pricing.freePlan } : {}),
      source: pricingEvidence
    } } : {})
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
const primaryReplacementIds = new Set((intake.candidates as RecordValue[])
  .filter(candidate => candidate.review?.primaryDestinationReplacementAuthorized === true)
  .map(candidate => String(candidate.id)));
const sourceFieldOverrides = new Map<string, Set<string>>((intake.candidates as RecordValue[])
  .filter(candidate => Array.isArray(candidate.review?.sourceFieldsAuthorizedToReplace))
  .map(candidate => [String(candidate.id), new Set<string>(candidate.review.sourceFieldsAuthorizedToReplace.filter((field: unknown) => typeof field === "string" && field !== "id" && field !== "slug" && field !== "primaryUrl" && field !== "affiliateUrl" && field !== "linkType" && field !== "links"))]));
const canonicalById = new Map((catalogData.providers as Provider[]).map(provider => [provider.id, provider]));
const sourceCandidateById = new Map((intake.candidates as RecordValue[]).map(candidate => [String(candidate.id), candidate]));
for (const candidate of intake.candidates as RecordValue[]) {
  const current = canonicalById.get(String(candidate.id));
  const content = candidate.content ?? {};
  const evidence = content.summaryEvidence ?? {};
  const shortExplanation = typeof content.shortExplanation === "string" ? content.shortExplanation.trim() : "";
  const hasDatedOfficialEvidence = isPublicHttps(evidence.source) && typeof evidence.checkedAt === "string" && Boolean(Date.parse(evidence.checkedAt)) && shortExplanation.length > 0 && !/(?:commission|payout)(?:\s+(?:rate|of|at|up\s+to)){0,3}\s*\d+(?:\.\d+)?%|\d+(?:\.\d+)?%\s*(?:commission|payout)/i.test(shortExplanation);
  const genericSummary = current && (/^A listed option in .+\. Verify current features and terms with .+ before choosing\.$/i.test(current.summary) || /^[^:]+: (?:Compare|Evaluate|Review) (?:accounting|automation|business accounts|spending|business credit|customer records|financing|hiring|coverage|legal|marketing|payment|content)\b/i.test(current.summary));
  if (hasDatedOfficialEvidence && genericSummary) {
    const fields = sourceFieldOverrides.get(String(candidate.id)) ?? new Set<string>();
    fields.add("summary");
    if (current.metadataDescription === current.summary) fields.add("metadataDescription");
    sourceFieldOverrides.set(String(candidate.id), fields);
  }
}
const sourcedPublications = published.map(provider => {
  const current = canonicalById.get(provider.id);
  const evidence = sourceCandidateById.get(provider.id)?.content?.summaryEvidence ?? {};
  const hasDatedSource = isPublicHttps(evidence.source) && typeof evidence.checkedAt === "string" && Boolean(Date.parse(evidence.checkedAt));
  return current && !hasDatedSource ? { ...provider, summary: current.summary } : provider;
});
const reconciliation = reconcileProviderCatalog(catalogData.providers as Provider[], sourcedPublications, primaryReplacementIds, sourceFieldOverrides);
const merged = reconciliation.providers;
const conflictGroups = new Map<string, Set<string>>();
for (const conflict of reconciliation.conflicts) {
  const ids = conflictGroups.get(conflict.field) ?? new Set<string>();
  ids.add(conflict.providerId);
  conflictGroups.set(conflict.field, ids);
}
const fullCatalog = catalogSchema.safeParse({ ...catalogData, providers: merged });
if (!fullCatalog.success) throw new Error(`Catalog validation failed: ${fullCatalog.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
catalogData.providers = merged;
if (!dryRun) fs.writeFileSync(catalogPath, `${JSON.stringify(catalogData, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  dryRun, candidates: intake.candidates.length, published: published.length, referralPrimaryLinksPreserved: referralIds.size,
  officialWebsitePrimaryLinks: websiteIds.size, catalogProvidersTotal: merged.length,
  sourceConflicts: [...conflictGroups].map(([field, ids]) => ({ field, count: ids.size, providerIds: [...ids].sort() })), providerExceptions: exceptions
}, null, 2));
