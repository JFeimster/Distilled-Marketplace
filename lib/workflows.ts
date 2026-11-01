import { catalog } from "@/lib/catalog";
import type { WorkflowBlueprint } from "@/schemas/catalog";
import type { WorkflowListing } from "@/lib/workflow-discovery";

export const publishedWorkflows = catalog.workflowBlueprints.filter(item => item.status === "published");
export const workflowBySlug = (slug:string) => publishedWorkflows.find(item => item.slug === slug);
export const workflowListing = (item:WorkflowBlueprint):WorkflowListing => ({
  id:item.id,slug:item.slug,title:item.title,summary:item.summary,useCase:item.useCase,outcome:item.outcome,
  trigger:item.trigger,humanReview:item.humanReview,industryTags:item.industryTags,categoryIds:item.categoryIds,providerIds:item.providerIds,requiredServices:item.requiredServices
});
export const workflowsForProvider = (providerId:string) => publishedWorkflows.filter(item => item.providerIds.includes(providerId));
export function workflowDiscoveriesForProvider(providerId: string, categoryIds: string[], limit = 4) {
  const categories = new Set(categoryIds);
  const listed = workflowsForProvider(providerId).map(workflow => ({ workflow, matchType: "provider-listed" as const }));
  const listedIds = new Set(listed.map(item => item.workflow.id));
  const categoryMatches = publishedWorkflows.filter(workflow => !listedIds.has(workflow.id) && workflow.categoryIds.some(id => categories.has(id)))
    .map(workflow => ({ workflow, matchType: "category-related" as const }));
  return [...listed, ...categoryMatches].slice(0, limit);
}
export const industryTags = [...new Set(publishedWorkflows.flatMap(item => item.industryTags))].sort();
const industryNames: Record<string,string> = {
  "ecommerce":"E-commerce teams",
  "funding-agencies":"Funding agencies",
  "professional-services":"Professional services"
};
export const industryName = (tag:string) => industryNames[tag] ?? tag.split("-").map(word=>word[0].toUpperCase()+word.slice(1)).join(" ");
export const workflowsForIndustry = (tag:string): WorkflowBlueprint[] => publishedWorkflows.filter(item => item.industryTags.includes(tag));
