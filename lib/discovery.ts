import type { Category } from "@/schemas/catalog";

export type DirectoryFilters = { q: string; group: string; audience: string; stage: string; capability: string; sort: "name" | "group" };
export const emptyFilters: DirectoryFilters = { q: "", group: "all", audience: "all", stage: "all", capability: "all", sort: "name" };
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
