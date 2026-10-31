import Link from "next/link";
import type { WorkflowListing } from "@/lib/workflow-discovery";

export function WorkflowCard({ workflow, providerNames }: { workflow:WorkflowListing; providerNames:Record<string,string> }) {
  return <article className="workflow-card">
    <div className="workflow-card-top"><span className="eyebrow">EDITORIAL BLUEPRINT</span><span>{workflow.industryTags.map(tag=>tag.replaceAll("-"," ")).join(" · ")}</span></div>
    <h3><Link href={`/workflows/${workflow.slug}`}>{workflow.title}</Link></h3>
    <p>{workflow.summary}</p>
    <div className="workflow-card-meta"><span><b>Starts when</b>{workflow.trigger}</span><span><b>Expected outcome</b>{workflow.outcome}</span></div>
    <div className="workflow-card-bottom"><span><b>Named provider{workflow.providerIds.length===1?"":"s"}</b>{workflow.providerIds.map(id=>providerNames[id]??id).join(" + ")}</span><div><Link href={`/workflows/${workflow.slug}`}>Explore blueprint ↗</Link><Link href={`/workflows/${workflow.slug}#customize-workflow`}>Customize plan →</Link></div></div>
  </article>;
}
