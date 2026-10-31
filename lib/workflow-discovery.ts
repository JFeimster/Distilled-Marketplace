import type { WorkflowBlueprint } from "@/schemas/catalog";

export type WorkflowListing = Pick<WorkflowBlueprint, "id" | "slug" | "title" | "summary" | "useCase" | "outcome" | "trigger" | "humanReview" | "industryTags" | "categoryIds" | "providerIds" | "requiredServices">;
export const workflowOutcomes = [
  { id: "leads", label: "Capture and follow up with leads", terms: ["lead", "intake", "pipeline", "contact"], categories: [] },
  { id: "onboarding", label: "Improve intake and onboarding", terms: ["intake", "portal", "handoff", "document request"], categories: [] },
  { id: "administration", label: "Reduce repetitive administration", terms: ["routine", "operations", "task", "digest", "portal", "handoff"], categories: [] },
  { id: "finance", label: "Manage invoices and finances", terms: ["invoice", "bookkeeping", "accounting", "expense", "spend", "payment"], categories: ["accounting-bookkeeping", "budgeting-finops"] },
  { id: "support", label: "Improve customer support", terms: ["support", "ticket", "order"], categories: [] },
  { id: "documents", label: "Coordinate documents and reviews", terms: ["document", "packet", "secure", "checklist"], categories: [] },
  { id: "exceptions", label: "Monitor exceptions and handoffs", terms: ["monitor", "exception", "missing", "duplicate", "escalat", "alert", "failed"], categories: [] }
] as const;
export type WorkflowFilters = { q: string; industry: string; category: string; provider: string; outcome: string };
export const emptyWorkflowFilters: WorkflowFilters = { q:"", industry:"all", category:"all", provider:"all", outcome:"all" };

export function workflowOutcomeScore(item: WorkflowListing, outcomeId: string) {
  const outcome = workflowOutcomes.find(value => value.id === outcomeId);
  if (!outcome) return 0;
  const haystack = [item.title, item.summary, item.useCase, item.outcome].join(" ").toLowerCase();
  const matches = outcome.terms.filter(term => haystack.includes(term)).length;
  return matches * 2 + outcome.categories.filter(id => item.categoryIds.includes(id)).length;
}

export function filterWorkflowListings(items: WorkflowListing[], filters: WorkflowFilters) {
  const terms = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const haystack = [item.title,item.summary,item.useCase,item.outcome,...item.industryTags].join(" ").toLowerCase();
    return terms.every(term => haystack.includes(term)) &&
      (filters.industry === "all" || item.industryTags.includes(filters.industry)) &&
      (filters.category === "all" || item.categoryIds.includes(filters.category)) &&
      (filters.provider === "all" || item.providerIds.includes(filters.provider)) &&
      (filters.outcome === "all" || workflowOutcomeScore(item, filters.outcome) > 0);
  }).sort((a,b) => filters.outcome === "all"
    ? a.title.localeCompare(b.title)
    : workflowOutcomeScore(b, filters.outcome) - workflowOutcomeScore(a, filters.outcome) || a.title.localeCompare(b.title));
}

const genericWords = new Set(["with","from","into","before","after","review","reviewed","workflow","owner","team","record","records","using","use","make","through","available","selected","service","services","business","human","person","personnel","clear","current","process","data","without","that","this"]);
function objectiveTerms(item: WorkflowListing) {
  return new Set([item.title,item.useCase,item.outcome].join(" ").toLowerCase().match(/[a-z]{4,}/g)?.filter(word => !genericWords.has(word)) ?? []);
}
export function recommendRelatedWorkflows(item: WorkflowListing, all: WorkflowListing[], limit = 3) {
  const terms = objectiveTerms(item);
  return all.filter(other => other.id !== item.id).map(other => {
    const commonTerms = [...objectiveTerms(other)].filter(term => terms.has(term)).length;
    const commonServices = item.requiredServices.filter(service => other.requiredServices.includes(service)).length;
    const commonCategories = item.categoryIds.filter(id => other.categoryIds.includes(id)).length;
    const commonIndustries = item.industryTags.filter(id => other.industryTags.includes(id)).length;
    const commonProviders = item.providerIds.filter(id => other.providerIds.includes(id)).length;
    const score = commonTerms * 3 + commonServices * 3 + commonCategories * 2 + commonProviders + commonIndustries;
    const reason = commonTerms ? "Similar business objective" : commonServices ? "Shared service prerequisite" :
      commonCategories ? "Shared service area" : commonProviders ? "Named provider overlap" : "Same industry context";
    return { workflow: other, reason, score };
  }).filter(value => value.score > 0)
    .sort((a,b) => b.score - a.score || a.workflow.title.localeCompare(b.workflow.title))
    .slice(0,limit);
}

export type WorkflowConnection = { providerIds: [string,string]; workflowSlugs: string[]; status: "documented" | "not_listed"; evidence?: { label:string; url:string } };
export function deriveWorkflowConnections(blueprints: WorkflowBlueprint[]): WorkflowConnection[] {
  const found = new Map<string,WorkflowConnection>();
  for(const blueprint of blueprints.filter(item => item.status === "published")) {
    for(let i=0;i<blueprint.providerIds.length;i++) for(let j=i+1;j<blueprint.providerIds.length;j++) {
      const providerIds = [blueprint.providerIds[i],blueprint.providerIds[j]].sort() as [string,string];
      const key = providerIds.join("|");
      const entry: WorkflowConnection = found.get(key) ?? {providerIds,workflowSlugs:[],status:"not_listed"};
      entry.workflowSlugs.push(blueprint.slug);
      const proof = blueprint.integrationEvidence.find(item => [...item.providerIds].sort().join("|") === key);
      if(proof) {entry.status="documented";entry.evidence={label:proof.source.label,url:proof.source.url};}
      found.set(key,entry);
    }
  }
  return [...found.values()].sort((a,b) => (a.status === b.status ? a.providerIds.join("|").localeCompare(b.providerIds.join("|")) : a.status === "documented" ? -1 : 1));
}

export type WorkflowCoverage = { slug:string; title:string; included:string[]; missing:string[]; coverage:"included"|"missing"; integration:"documented"|"not_listed"|"not_applicable" };
export function workflowStackPresets(blueprints: WorkflowListing[], limit = 4) {
  const seen = new Set<string>();
  return [...blueprints].sort((a,b) => b.providerIds.length - a.providerIds.length || a.title.localeCompare(b.title))
    .filter(item => {
      const key = [...item.providerIds].sort().join("|");
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).slice(0,limit).map(item => ({ slug:item.slug, title:item.title, providerIds:[...item.providerIds] }));
}
export function evaluateWorkflowCoverage(blueprints: WorkflowListing[], selectedIds: string[], connections: WorkflowConnection[]): WorkflowCoverage[] {
  const selected = new Set(selectedIds);
  const byPair = new Map(connections.map(item => [item.providerIds.join("|"),item]));
  return blueprints.map((item): WorkflowCoverage => {
    const included=item.providerIds.filter(id=>selected.has(id));
    const missing=item.providerIds.filter(id=>!selected.has(id));
    const pairs: string[]=[];
    for(let i=0;i<item.providerIds.length;i++) for(let j=i+1;j<item.providerIds.length;j++) pairs.push([item.providerIds[i],item.providerIds[j]].sort().join("|"));
    const integration = pairs.length === 0 ? "not_applicable" : pairs.every(pair=>byPair.get(pair)?.status === "documented") ? "documented" : "not_listed";
    return {slug:item.slug,title:item.title,included,missing,coverage:missing.length===0?"included":"missing",integration};
  }).sort((a,b)=>Number(b.coverage==="included")-Number(a.coverage==="included") || b.included.length-a.included.length || a.title.localeCompare(b.title));
}
