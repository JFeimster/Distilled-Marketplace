import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompatibilityWorkspace } from "@/components/CompatibilityWorkspace";
import { Disclosure } from "@/components/Disclosure";
import { catalog } from "@/lib/catalog";
import { deriveWorkflowConnections } from "@/lib/workflow-discovery";
import { pageMetadata } from "@/lib/seo";
import { publishedWorkflows, workflowListing } from "@/lib/workflows";

export const metadata=pageMetadata("Stack workflow coverage","Check which editorial workflows name providers in your selected stack and where integration support is documented.","/compatibility");
export default async function CompatibilityPage({searchParams}:{searchParams:Promise<{providers?:string}>}){
  const raw=await searchParams;const allowed=new Set(catalog.providers.map(p=>p.id));
  const initialIds=[...new Set((raw.providers??"").split(",").filter(id=>allowed.has(id)))].sort();
  return <><Breadcrumbs items={[{label:"Compatibility"}]}/><section className="wrap page-lead workflow-page-lead"><span className="eyebrow">WORKFLOW LAB / STACK COVERAGE</span><h1>See what your<br/><em>stack covers.</em></h1><p>Select the providers you use. The result checks blueprint requirements and documented connections; missing documentation is shown as “not listed.”</p></section>
    <CompatibilityWorkspace workflows={publishedWorkflows.map(workflowListing)} connections={deriveWorkflowConnections(publishedWorkflows)} providers={catalog.providers.map(p=>({id:p.id,name:p.name,slug:p.slug})).sort((a,b)=>a.name.localeCompare(b.name))} initialIds={initialIds}/><div className="wrap"><Disclosure compact/></div></>;
}
