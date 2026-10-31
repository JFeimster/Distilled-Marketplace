import type { WorkflowBlueprint } from "@/schemas/catalog";

export type WorkflowListing = Pick<WorkflowBlueprint, "id" | "slug" | "title" | "summary" | "useCase" | "outcome" | "trigger" | "humanReview" | "industryTags" | "categoryIds" | "providerIds">;
export type WorkflowFilters = { q: string; industry: string; category: string; provider: string };
export const emptyWorkflowFilters: WorkflowFilters = { q:"", industry:"all", category:"all", provider:"all" };

export function filterWorkflowListings(items: WorkflowListing[], filters: WorkflowFilters) {
  const terms = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const haystack = [item.title,item.summary,item.useCase,item.outcome,...item.industryTags].join(" ").toLowerCase();
    return terms.every(term => haystack.includes(term)) &&
      (filters.industry === "all" || item.industryTags.includes(filters.industry)) &&
      (filters.category === "all" || item.categoryIds.includes(filters.category)) &&
      (filters.provider === "all" || item.providerIds.includes(filters.provider));
  }).sort((a,b) => a.title.localeCompare(b.title));
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
