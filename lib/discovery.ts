import type { Category, Provider } from "@/schemas/catalog";

export type DirectoryFilters = { q: string; group: string; audience: string; stage: string; capability: string; sort: "relevance" | "name" | "group" };
export const emptyFilters: DirectoryFilters = { q: "", group: "all", audience: "all", stage: "all", capability: "all", sort: "relevance" };
export function filterCategories(categories: Category[], filters: DirectoryFilters) {
  const words = filters.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return categories.filter(item =>
    (filters.group === "all" || item.group === filters.group) &&
    (filters.audience === "all" || item.audiences.includes(filters.audience as "owner" | "operator")) &&
    (filters.stage === "all" || item.stages.includes(filters.stage as "starting" | "growing" | "established")) &&
    (filters.capability === "all" || item.capabilities.includes(filters.capability)) &&
    words.every(word => `${item.name} ${item.summary} ${item.question} ${item.capabilities.join(" ")}`.toLowerCase().includes(word))
  ).sort((a, b) => filters.sort === "group" ? a.group.localeCompare(b.group) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
}
export type ProviderFilters = DirectoryFilters & { category: string; serviceType: string; pricing: string };
export const emptyProviderFilters: ProviderFilters = { ...emptyFilters, category: "all", serviceType: "all", pricing: "all" };
export function providerRoles(provider: Provider, category: Category) { return provider.roles.length ? provider.roles : provider.audiences.length ? provider.audiences : category.audiences; }
export function providerStages(provider: Provider, category: Category) { return provider.businessStages.length ? provider.businessStages : provider.stages.length ? provider.stages : category.stages; }
export function providerDiscoveryScore(provider: Provider, category: Category) {
  const summary = provider.summary.trim();
  const generic = /^(?:[^:]+: )?(?:compare|evaluate|review)\b/i.test(summary);
  const summaryScore = generic ? 0 : Math.min(summary.length, 180) / 30;
  const detailedFeatures = provider.features.filter(feature => feature.description?.trim().length);
  const categoryCapabilities = new Set(category.capabilities);
  const relevance = provider.capabilities.filter(capability => categoryCapabilities.has(capability)).length;
  return summaryScore + detailedFeatures.length * 2 + provider.workflowTemplates.length * 3 + provider.promptTemplates.length * 3 + provider.useCases.length + provider.integrations.length + (provider.howItWorks?.steps.length ?? 0) + relevance;
}
export function filterProviders(providers: Provider[], categories: Category[], filters: ProviderFilters) {
  const byId = new Map(categories.map(category => [category.id, category]));
  const terms = filters.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return providers.filter(provider => {
    const category = byId.get(provider.primaryCategoryId);
    if (!category) return false;
    const text = [provider.name, provider.summary, ...provider.capabilities, ...provider.capabilityLabels, ...provider.searchKeywords, ...provider.useCases, ...provider.features.map(feature => `${feature.name} ${feature.description ?? ""}`)].join(" ").toLowerCase();
    return terms.every(term => text.includes(term)) &&
      (filters.group === "all" || category.group === filters.group) &&
      (filters.category === "all" || provider.categoryIds.includes(filters.category)) &&
      (filters.audience === "all" || providerRoles(provider, category).includes(filters.audience)) &&
      (filters.stage === "all" || providerStages(provider, category).includes(filters.stage)) &&
      (filters.capability === "all" || provider.capabilities.includes(filters.capability)) &&
      (filters.serviceType === "all" || provider.serviceTypes.includes(filters.serviceType)) &&
      (filters.pricing === "all" || (provider.pricing?.model ?? provider.pricingModel) === filters.pricing);
  }).sort((a, b) => {
    if (filters.sort === "group") return (byId.get(a.primaryCategoryId)?.group ?? "").localeCompare(byId.get(b.primaryCategoryId)?.group ?? "") || a.name.localeCompare(b.name);
    if (filters.sort === "name") return a.name.localeCompare(b.name);
    return providerDiscoveryScore(b, byId.get(b.primaryCategoryId)!) - providerDiscoveryScore(a, byId.get(a.primaryCategoryId)!) || a.name.localeCompare(b.name);
  });
}
export type StackInput = { goal: "get-organized" | "grow-sales" | "manage-cash" | "hire-safely"; stage: "starting" | "growing" | "established"; needs: string[] };
const goals: Record<StackInput["goal"], { ids: string[]; reason: string }> = {
  "get-organized": { ids: ["accounting-bookkeeping", "productivity", "banking-neobanking"], reason: "Reliable records and handoffs make later tools easier to evaluate." },
  "grow-sales": { ids: ["marketing-seo", "crm-sales", "payments-pos"], reason: "Connect demand, follow-up and payment before adding channels." },
  "manage-cash": { ids: ["accounting-bookkeeping", "budgeting-finops", "banking-neobanking"], reason: "Current reconciled records come before a useful forecast." },
  "hire-safely": { ids: ["hr-payroll", "legal-compliance", "insurance-benefits"], reason: "Hiring changes pay, obligations and risk at the same time." }
};
const needMap: Record<string, string> = { "sell-online": "ecommerce", "automate-work": "ai-automation", "manage-customers": "crm-sales", "protect-business": "insurance-benefits" };
export function findStack(input: StackInput) {
  const base = goals[input.goal];
  const ids = [...new Set([...base.ids, ...input.needs.map(need => needMap[need]).filter(Boolean)])].slice(0, 5);
  return { ids, explanation: base.reason, stageNote: input.stage === "starting" ? "Begin with a small accountable process; add software after the records exist." : input.stage === "growing" ? "Check integrations and handoff ownership as the team expands." : "Review permissions, reporting and change management across existing systems." };
}
