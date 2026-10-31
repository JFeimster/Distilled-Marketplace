import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Disclosure } from "@/components/Disclosure";
import { catalog } from "@/lib/catalog";
import { deriveWorkflowConnections } from "@/lib/workflow-discovery";
import { pageMetadata } from "@/lib/seo";
import { publishedWorkflows } from "@/lib/workflows";

export const metadata=pageMetadata("Workflow connections","See which Marketplace provider connections have documentation and which are only co-listed in editorial blueprints.","/integrations");
export default function IntegrationsPage(){
  const connections=deriveWorkflowConnections(publishedWorkflows);
  const names=Object.fromEntries(catalog.providers.map(p=>[p.id,p.name]));
  const slugs=Object.fromEntries(publishedWorkflows.map(w=>[w.slug,w.title]));
  return <><Breadcrumbs items={[{label:"Connections"}]}/><section className="wrap page-lead workflow-page-lead"><span className="eyebrow">WORKFLOW LAB / CONNECTIONS</span><h1>Know what’s<br/><em>documented.</em></h1><p>These pairings come from published blueprints. A named pair is a planning relationship; direct integration support appears only when a source documents it.</p></section>
    <section className="wrap workflow-index-body"><div className="workflow-filter-head"><div><span className="eyebrow">CATALOG CONNECTIONS</span><h2>{connections.length} provider pairs</h2></div><Link href="/compatibility" className="text-link">Check your stack →</Link></div>
      {connections.length?<div className="integration-grid">{connections.map(item=><article key={item.providerIds.join("-")}><span className={item.status==="documented"?"connection-status is-documented":"connection-status"}>{item.status==="documented"?"DOCUMENTED CONNECTION":"SUPPORT NOT LISTED"}</span><h3>{item.providerIds.map(id=>names[id]??id).join(" + ")}</h3><p>{item.status==="documented"?"A cited provider source documents this connection. Confirm the current plan, setup and permissions.":"These providers appear in the same editorial blueprint. Direct integration support has not been established here."}</p>{item.evidence&&<a href={item.evidence.url} target="_blank" rel="noopener noreferrer">Read the source: {item.evidence.label} ↗</a>}<div><b>Used in</b>{item.workflowSlugs.map(slug=><Link key={slug} href={`/workflows/${slug}`}>{slugs[slug]} ↗</Link>)}</div></article>)}</div>:<div className="workflow-empty" role="status"><h3>No connections are listed yet.</h3><p>Browse individual workflows while integration evidence is gathered.</p><Link href="/workflows" className="button button-paper">Browse workflows</Link></div>}
    </section><div className="wrap"><Disclosure compact/></div></>;
}
