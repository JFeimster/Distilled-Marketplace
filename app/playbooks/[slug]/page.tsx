import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Disclosure } from "@/components/Disclosure";
import { WorkflowCard } from "@/components/WorkflowCard";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { industryName, industryTags, workflowListing, workflowsForIndustry } from "@/lib/workflows";

export function generateStaticParams(){return industryTags.map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return industryTags.includes(slug)?pageMetadata(`${industryName(slug)} workflows`,`Practical Marketplace workflow blueprints for ${industryName(slug).toLowerCase()}.`,`/playbooks/${slug}`):{};}
export default async function PlaybookPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!industryTags.includes(slug))notFound();const workflows=workflowsForIndustry(slug);const names=Object.fromEntries(catalog.providers.map(p=>[p.id,p.name]));return <><Breadcrumbs items={[{label:"Playbooks",href:"/playbooks"},{label:industryName(slug)}]}/><section className="workflow-detail-hero"><div className="wrap"><span className="eyebrow">INDUSTRY PLAYBOOK / {workflows.length} BLUEPRINTS</span><h1>{industryName(slug)}</h1><p>Work through the relevant handoffs, prerequisites and human review points. Each blueprint stands on its own; choose the sequence that fits your operating process.</p><Link href="/compatibility" className="button button-orange">Check your stack ↗</Link></div></section><section className="wrap workflow-index-body"><div className="workflow-filter-head"><div><span className="eyebrow">PUBLISHED BLUEPRINTS</span><h2>Build from a small pilot.</h2></div><Link href="/workflows" className="text-link">Find all workflows →</Link></div>{workflows.length?<div className="workflow-grid">{workflows.map(item=><WorkflowCard key={item.id} workflow={workflowListing(item)} providerNames={names}/>)}</div>:<div className="workflow-empty" role="status"><h3>No blueprints are published for this playbook.</h3><p>Browse the full Workflow Lab for other operating patterns.</p></div>}</section><div className="wrap"><Disclosure compact/></div></>;}
