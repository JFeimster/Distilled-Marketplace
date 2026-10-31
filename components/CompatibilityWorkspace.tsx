"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  evaluateWorkflowCoverage, workflowStackPresets,
  type WorkflowConnection, type WorkflowCoverage, type WorkflowListing
} from "@/lib/workflow-discovery";

type Option = { id: string; name: string; slug: string };
function CoverageCard({ result, workflow, names, slugs }: {
  result: WorkflowCoverage; workflow: WorkflowListing; names: Record<string,string>; slugs: Record<string,string>
}) {
  return <article className={result.coverage === "included" ? "is-covered" : ""}>
    <div><span className="eyebrow">{result.coverage === "included" ? "ALL NAMED PROVIDERS SELECTED" : "STACK GAP TO REVIEW"}</span>
      <h3><Link href={`/workflows/${result.slug}`}>{result.title}</Link></h3><p>{workflow.outcome}</p>
      <div className="compatibility-provider-list"><span><b>In your selection:</b> {result.included.length ? result.included.map(id => names[id]).join(", ") : "None"}</span>
        {result.missing.length > 0 && <span><b>Named providers missing:</b> {result.missing.map(id => <Link key={id} href={`/providers/${slugs[id]}`}>{names[id]} ↗</Link>)}</span>}</div>
      <Link className="text-link" href={`/workflows/${result.slug}#customize-workflow`}>Customize this plan →</Link>
    </div>
    <div className="compatibility-connection"><b>Integration evidence</b><span>{result.integration === "documented" ? "Documented for the named provider pair" : result.integration === "not_applicable" ? "Single named provider" : "Support not listed here"}</span></div>
  </article>;
}

export function CompatibilityWorkspace({ workflows, connections, providers, initialIds }: {
  workflows: WorkflowListing[]; connections: WorkflowConnection[]; providers: Option[]; initialIds: string[]
}) {
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [query, setQuery] = useState("");
  const [example, setExample] = useState("");
  const names = useMemo(() => Object.fromEntries(providers.map(provider => [provider.id, provider.name])), [providers]);
  const slugs = useMemo(() => Object.fromEntries(providers.map(provider => [provider.id, provider.slug])), [providers]);
  const bySlug = useMemo(() => Object.fromEntries(workflows.map(workflow => [workflow.slug, workflow])), [workflows]);
  const referenced = useMemo(() => new Set(workflows.flatMap(workflow => workflow.providerIds)), [workflows]);
  const presets = useMemo(() => workflowStackPresets(workflows), [workflows]);
  const visible = useMemo(() => providers.filter(provider =>
    provider.name.toLowerCase().includes(query.trim().toLowerCase())), [providers, query]);
  const linkedProviders = visible.filter(provider => referenced.has(provider.id));
  const otherProviders = visible.filter(provider => !referenced.has(provider.id));
  const results = useMemo(() => evaluateWorkflowCoverage(workflows, selected, connections), [workflows, selected, connections]);
  const covered = results.filter(result => result.coverage === "included");
  const gaps = results.filter(result => result.coverage === "missing");
  const unlisted = selected.filter(id => !referenced.has(id));
  const setStack = (ids: string[], exampleTitle = "") => {
    const next = [...new Set(ids)].sort();
    setSelected(next); setExample(exampleTitle);
    const search = new URLSearchParams();
    if (next.length) search.set("providers", next.join(","));
    window.history.replaceState(null, "", `/compatibility${search.size ? `?${search}` : ""}`);
  };
  const change = (id: string, checked: boolean) =>
    setStack(checked ? [...selected, id] : selected.filter(value => value !== id));
  const options = (items: Option[]) => items.map(provider => <label key={provider.id}>
    <input type="checkbox" checked={selected.includes(provider.id)} onChange={event => change(provider.id, event.target.checked)}/>
    <span>{provider.name}</span></label>);

  return <section className="wrap compatibility-layout">
    <aside className="compatibility-picker"><span className="eyebrow">YOUR CURRENT STACK</span><h2>Select providers</h2>
      <p>Choose the providers you actually use. The result checks named blueprint providers; confirm service prerequisites and permissions on each workflow page.</p>
      <label htmlFor="compatibility-search">Find a provider<input id="compatibility-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search 154 listings"/></label>
      <fieldset><legend>Named in published blueprints <span>{linkedProviders.length}</span></legend><div className="compatibility-options">{options(linkedProviders)}{linkedProviders.length === 0 && <p>No blueprint-linked providers match this search.</p>}</div></fieldset>
      <details className="compatibility-other"><summary>Other Marketplace providers ({otherProviders.length})</summary><div className="compatibility-options">{options(otherProviders)}{otherProviders.length === 0 && <p>No other providers match this search.</p>}</div></details>
      {selected.length > 0 && <button type="button" className="text-button" onClick={() => setStack([])}>Clear selected stack</button>}
    </aside>
    <div className="compatibility-results"><div className="workflow-filter-head"><div><span className="eyebrow">WORKFLOW COVERAGE</span><h2>{selected.length ? `${covered.length} fully named` : "Start with your stack."}</h2><p>Coverage and integration evidence are separate. “Support not listed” means documentation is missing here, not that the products are incompatible.</p></div></div>
      <div className="compatibility-presets"><span className="eyebrow">QUICK-SELECT EXAMPLES</span><p>These sample stacks come from actual blueprint provider requirements. Selecting one is for exploration; adjust it to your real stack.</p><div>{presets.map(preset => <button type="button" key={preset.slug} onClick={() => setStack(preset.providerIds, preset.title)}>{preset.title}<small>{preset.providerIds.map(id => names[id]).join(" + ")}</small></button>)}</div></div>
      {example && <div className="compatibility-notice" role="status"><strong>Example stack: {example}</strong><span>Replace the example providers with the tools you actually use before treating the coverage as yours.</span></div>}
      {unlisted.length > 0 && <div className="compatibility-notice" role="status"><strong>No published blueprint names {unlisted.map(id => names[id]).join(", ")}.</strong><span>This is a catalog gap, not an incompatibility finding.</span></div>}
      {!selected.length ? <div className="compatibility-samples"><h3>Explore what a match looks like.</h3><p>Select your providers above or try an example stack. These published workflows show the requirements that will be checked.</p><div>{presets.slice(0,3).map(preset => <article key={preset.slug}><span className="eyebrow">SAMPLE BLUEPRINT</span><h4><Link href={`/workflows/${preset.slug}`}>{preset.title}</Link></h4><p>{bySlug[preset.slug].outcome}</p><small>Named providers: {preset.providerIds.map(id => names[id]).join(" + ")}</small></article>)}</div></div> : <>
        <section className="compatibility-group"><div className="compatibility-group-head"><h3>Fully named in your stack</h3><span>{covered.length} workflows</span></div>{covered.length ? <div className="compatibility-list">{covered.map(result => <CoverageCard key={result.slug} result={result} workflow={bySlug[result.slug]} names={names} slugs={slugs}/>)}</div> : <div className="workflow-empty" role="status"><h3>No full named-provider match yet.</h3><p>Review the gaps below or broaden your selected stack. A different service may still fit after human evaluation.</p></div>}</section>
        <section className="compatibility-group"><div className="compatibility-group-head"><h3>Needs named providers</h3><span>{gaps.length} workflows</span></div><div className="compatibility-list">{gaps.map(result => <CoverageCard key={result.slug} result={result} workflow={bySlug[result.slug]} names={names} slugs={slugs}/>)}</div></section>
      </>}
    </div>
  </section>;
}
