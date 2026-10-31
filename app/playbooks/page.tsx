import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Disclosure } from "@/components/Disclosure";
import { pageMetadata } from "@/lib/seo";
import { industryName, industryTags, workflowsForIndustry } from "@/lib/workflows";

export const metadata=pageMetadata("Industry workflow playbooks","Browse workflow sequences for selected industries using published Marketplace blueprints.","/playbooks");
export default function PlaybooksPage(){return <><Breadcrumbs items={[{label:"Playbooks"}]}/><section className="wrap page-lead workflow-page-lead"><span className="eyebrow">WORKFLOW LAB / PLAYBOOKS</span><h1>Start with<br/><em>your work.</em></h1><p>Each playbook collects published blueprints for a specific operating context. Adapt the steps and review boundaries to your team.</p></section><section className="wrap workflow-index-body"><div className="playbook-grid">{industryTags.map(tag=><Link key={tag} href={`/playbooks/${tag}`}><span className="eyebrow">INDUSTRY PLAYBOOK</span><strong>{industryName(tag)}</strong><span>{workflowsForIndustry(tag).length} relevant blueprints</span><b aria-hidden="true">↗</b></Link>)}</div></section><div className="wrap"><Disclosure compact/></div></>;}
