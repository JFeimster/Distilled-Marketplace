"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { evaluateWorkflowCoverage, type WorkflowConnection, type WorkflowListing } from "@/lib/workflow-discovery";

type Option={id:string;name:string};
export function CompatibilityWorkspace({workflows,connections,providers,initialIds}:{workflows:WorkflowListing[];connections:WorkflowConnection[];providers:Option[];initialIds:string[]}) {
  const [selected,setSelected]=useState<string[]>(initialIds);
  const [query,setQuery]=useState("");
  const names=useMemo(()=>Object.fromEntries(providers.map(p=>[p.id,p.name])),[providers]);
  const visible=useMemo(()=>providers.filter(p=>p.name.toLowerCase().includes(query.trim().toLowerCase())),[providers,query]);
  const results=useMemo(()=>evaluateWorkflowCoverage(workflows,selected,connections),[workflows,selected,connections]);
  const listed=new Set(workflows.flatMap(item=>item.providerIds));
  const unlisted=selected.filter(id=>!listed.has(id));
  const change=(id:string,checked:boolean)=>{
    const next=(checked?[...selected,id]:selected.filter(value=>value!==id)).sort();
    setSelected(next);
    const search=new URLSearchParams();if(next.length)search.set("providers",next.join(","));
    window.history.replaceState(null,"",`/compatibility${search.size?`?${search}`:""}`);
  };
  return <section className="wrap compatibility-layout">
    <aside className="compatibility-picker"><span className="eyebrow">YOUR CURRENT STACK</span><h2>Select providers</h2><p>Coverage checks only which providers each editorial blueprint names. Confirm other services and setup requirements on the blueprint page.</p><label htmlFor="compatibility-search">Find a provider<input id="compatibility-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search 154 listings"/></label><div className="compatibility-options">{visible.map(p=><label key={p.id}><input type="checkbox" checked={selected.includes(p.id)} onChange={event=>change(p.id,event.target.checked)}/><span>{p.name}</span></label>)}{!visible.length&&<p>No providers match that search.</p>}</div></aside>
    <div className="compatibility-results"><div className="workflow-filter-head"><div><span className="eyebrow">WORKFLOW COVERAGE</span><h2>{selected.length?results.filter(item=>item.coverage==="included").length:"—"} fully listed</h2><p>Missing means a required provider is absent from your selected stack. “Not listed” means no integration documentation is recorded here; it does not mean incompatible.</p></div></div>
      {!selected.length ? <div className="workflow-empty" role="status"><h3>Choose providers to see coverage.</h3><p>The result will show required providers and documented connection status separately.</p></div> : <>
        {unlisted.length>0&&<div className="compatibility-notice" role="status"><strong>No published workflow currently names {unlisted.map(id=>names[id]).join(", ")}.</strong><span>This is a catalog gap, not a compatibility finding.</span></div>}
        <div className="compatibility-list" aria-live="polite">{results.map(result=><article key={result.slug} className={result.coverage==="included"?"is-covered":""}><div><span className="eyebrow">{result.coverage==="included"?"REQUIRED PROVIDERS INCLUDED":"REQUIRED PROVIDER MISSING"}</span><h3><Link href={`/workflows/${result.slug}`}>{result.title}</Link></h3><p><b>Included:</b> {result.included.length?result.included.map(id=>names[id]).join(", "):"None"} <span aria-hidden="true">·</span> <b>Missing:</b> {result.missing.length?result.missing.map(id=>names[id]).join(", "):"None"}</p></div><div className="compatibility-connection"><b>Integration support</b><span>{result.integration==="documented"?"Documented for listed providers":result.integration==="not_applicable"?"Single provider blueprint":"Not listed in this catalog"}</span></div></article>)}</div>
      </>}
    </div>
  </section>;
}
