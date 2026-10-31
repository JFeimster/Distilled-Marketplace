"use client";
import { useMemo, useState } from "react";
import { WorkflowCard } from "@/components/WorkflowCard";
import { emptyWorkflowFilters, filterWorkflowListings, workflowOutcomes, type WorkflowFilters, type WorkflowListing } from "@/lib/workflow-discovery";

type Option = { id:string; name:string };
function initialFilters(params:Record<string,string|undefined>): WorkflowFilters {
  return {q:params.q??"",industry:params.industry??"all",category:params.category??"all",provider:params.provider??"all",
    outcome:workflowOutcomes.some(item=>item.id===params.outcome)?params.outcome!:"all"};
}
function writeUrl(filters:WorkflowFilters) {
  const query=new URLSearchParams();
  for(const [key,value] of Object.entries(filters)) if(value && value!=="all") query.set(key,value);
  window.history.replaceState(null,"",`/workflows${query.size?`?${query}`:""}`);
}
export function WorkflowExplorer({workflows,providers,categories,industries,initial}:{workflows:WorkflowListing[];providers:Option[];categories:Option[];industries:Option[];initial:Record<string,string|undefined>}) {
  const [filters,setFilters]=useState<WorkflowFilters>(()=>initialFilters(initial));
  const results=useMemo(()=>filterWorkflowListings(workflows,filters),[workflows,filters]);
  const providerNames=useMemo(()=>Object.fromEntries(providers.map(item=>[item.id,item.name])),[providers]);
  const update=(patch:Partial<WorkflowFilters>)=>{const next={...filters,...patch};setFilters(next);writeUrl(next);};
  const clear=()=>{setFilters(emptyWorkflowFilters);writeUrl(emptyWorkflowFilters);};
  return <section className="wrap workflow-index-body">
    <div className="workflow-filter-head"><div><span className="eyebrow">BUSINESS AUTOMATION FINDER</span><h2>{results.length} blueprints to explore</h2><p>Filter by the work, service area, industry or provider already in your stack.</p></div><button type="button" onClick={clear}>Clear filters</button></div>
    <div className="workflow-outcome-guide" aria-label="Browse by business outcome"><div><span className="eyebrow">START WITH AN OUTCOME</span><p>Grouped from published blueprint wording and service areas. Review each blueprint’s prerequisites before choosing a tool.</p></div><div className="workflow-outcome-options"><button type="button" aria-pressed={filters.outcome==="all"} onClick={()=>update({outcome:"all"})}>All outcomes <small>{workflows.length}</small></button>{workflowOutcomes.map(item=><button key={item.id} type="button" aria-pressed={filters.outcome===item.id} onClick={()=>update({outcome:item.id})}>{item.label} <small>{filterWorkflowListings(workflows,{...emptyWorkflowFilters,outcome:item.id}).length}</small></button>)}</div></div>
    <div className="workflow-filters">
      <label>Search workflows<input type="search" value={filters.q} onChange={event=>update({q:event.target.value})} placeholder="Try intake, documents, invoices…"/></label>
      <label>Industry<select value={filters.industry} onChange={event=>update({industry:event.target.value})}><option value="all">All industries</option>{industries.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Service area<select value={filters.category} onChange={event=>update({category:event.target.value})}><option value="all">All services</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Provider<select value={filters.provider} onChange={event=>update({provider:event.target.value})}><option value="all">All providers</option>{providers.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </div>
    {results.length ? <div className="workflow-grid" aria-live="polite">{results.map(item=><WorkflowCard key={item.id} workflow={item} providerNames={providerNames}/>)}</div> : <div className="workflow-empty" role="status"><h3>No blueprints match these filters.</h3><p>Try a broader search, remove a provider filter or browse all service areas.</p><button type="button" className="button button-paper" onClick={clear}>Show all blueprints</button></div>}
  </section>;
}
