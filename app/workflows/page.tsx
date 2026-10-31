import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Disclosure } from "@/components/Disclosure";
import { WorkflowExplorer } from "@/components/WorkflowExplorer";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { industryName, industryTags, publishedWorkflows, workflowListing } from "@/lib/workflows";

export const metadata=pageMetadata("Workflow Lab","Explore practical, reviewable business automation blueprints by service area, provider and industry.","/workflows");
export default async function WorkflowsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const raw=await searchParams;
  const initial=Object.fromEntries(Object.entries(raw).map(([key,value])=>[key,typeof value==="string"?value:undefined]));
  const usedProviders=new Set(publishedWorkflows.flatMap(item=>item.providerIds));
  const usedCategories=new Set(publishedWorkflows.flatMap(item=>item.categoryIds));
  return <><Breadcrumbs items={[{label:"Workflow Lab"}]}/>
    <section className="workflow-hero"><div className="wrap workflow-hero-grid"><div><span className="eyebrow">DISTILLED MARKETPLACE / WORKFLOW LAB</span><h1>Make the handoff<br/><em>work.</em></h1><p>Explore editorial blueprints that turn a business need into a trigger, a sequence and a human review point.</p><div className="actions"><a className="button button-orange" href="#workflow-finder">Find a workflow ↗</a><Link className="button button-paper" href="/compatibility">Check your stack →</Link></div></div><div className="workflow-hero-side"><strong>{publishedWorkflows.length}</strong><span>published blueprints</span><p>Guides for planning and evaluation. No workflow files or credentials are provided.</p></div></div></section>
    <div id="workflow-finder"><WorkflowExplorer workflows={publishedWorkflows.map(workflowListing)} providers={catalog.providers.filter(p=>usedProviders.has(p.id)).map(p=>({id:p.id,name:p.name})).sort((a,b)=>a.name.localeCompare(b.name))} categories={catalog.categories.filter(c=>usedCategories.has(c.id)).map(c=>({id:c.id,name:c.name}))} industries={industryTags.map(id=>({id,name:industryName(id)}))} initial={initial}/></div>
    <section className="wrap workflow-link-band"><div><span className="eyebrow">NEXT DECISION</span><h2>See how the pieces connect.</h2></div><div><Link href="/integrations">Explore documented connections ↗</Link><Link href="/playbooks">Browse industry playbooks ↗</Link></div></section><div className="wrap"><Disclosure compact/></div>
  </>;
}
