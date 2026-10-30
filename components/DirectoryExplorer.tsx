"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { catalog } from "@/lib/catalog";
import { getPrimaryLink, outboundRel } from "@/lib/affiliate-links";
import { emptyFilters, filterCategories, type DirectoryFilters } from "@/lib/discovery";
import { CategoryLink } from "@/components/CategoryLink";

type Filters = DirectoryFilters & { category: string; relationship: string };
function readFilters(params: Record<string, string | undefined>): Filters {
  return { q: params.q ?? "", group: params.group ?? "all", audience: params.audience ?? "all", stage: params.stage ?? "all", capability: params.capability ?? "all", category: params.category ?? "all", relationship: params.relationship ?? "all", sort: params.sort === "group" ? "group" : "name" };
}
export function DirectoryExplorer({ initial }: { initial: Record<string, string | undefined> }) {
  const [filters, setFilters] = useState<Filters>(() => readFilters(initial));
  const categories = useMemo(() => filterCategories(catalog.categories, filters).filter(category => filters.category === "all" || category.id === filters.category), [filters]);
  const providers = useMemo(() => {
    const terms = filters.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return catalog.providers.filter(provider => {
      const category = catalog.categories.find(item => item.id === provider.primaryCategoryId);
      const primary = getPrimaryLink(provider);
      const searchable = `${provider.name} ${provider.summary} ${provider.capabilities.join(" ")} ${provider.suitableFor.join(" ")} ${provider.features?.map(x => `${x.name} ${x.description ?? ""}`).join(" ") ?? ""}`.toLowerCase();
      return terms.every(term => searchable.includes(term)) &&
        (filters.category === "all" || provider.categoryIds.includes(filters.category)) &&
        (filters.group === "all" || category?.group === filters.group) &&
        (filters.capability === "all" || provider.capabilities.includes(filters.capability)) &&
        (filters.audience === "all" || provider.audiences.includes(filters.audience as "owner" | "operator")) &&
        (filters.stage === "all" || provider.stages.includes(filters.stage as "starting" | "growing" | "established")) &&
        (filters.relationship === "all" || (filters.relationship === "affiliate" ? primary?.isAffiliate === true : primary !== null && primary.isAffiliate === false));
    }).sort((a, b) => filters.sort === "group" ? (a.primaryCategoryId.localeCompare(b.primaryCategoryId) || a.name.localeCompare(b.name)) : a.name.localeCompare(b.name));
  }, [filters]);
  const capabilities = [...new Set([...catalog.categories.flatMap(x => x.capabilities), ...catalog.providers.flatMap(x => x.capabilities)])].sort();
  const set = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch }; setFilters(next); const query = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value && value !== "all" && !(key === "sort" && value === "name")) query.set(key, value); });
    window.history.replaceState(null, "", `/directory${query.size ? `?${query}` : ""}`);
  };
  const reset = () => set({ ...emptyFilters, category: "all", relationship: "all" });
  return <div className="directory-grid"><aside className="filter-panel"><div className="filter-heading"><span className="eyebrow">FILTER / SERVICE AND PROVIDER</span><button type="button" className="text-button" onClick={reset}>Reset all</button></div>
    <label htmlFor="directory-search">SEARCH PROVIDER, SERVICE OR CAPABILITY<input id="directory-search" type="search" value={filters.q} onChange={event => set({ q: event.target.value })} placeholder="Try cash, payroll, customers…"/></label>
    <label htmlFor="group">SERVICE GROUP<select id="group" value={filters.group} onChange={event => set({ group: event.target.value })}><option value="all">All groups</option>{["Money", "Growth", "Systems", "People & risk"].map(x => <option key={x}>{x}</option>)}</select></label>
    <label htmlFor="provider-category">CATEGORY<select id="provider-category" value={filters.category} onChange={event => set({ category: event.target.value })}><option value="all">All categories</option>{catalog.categories.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
    <label htmlFor="stage">BUSINESS STAGE<select id="stage" value={filters.stage} onChange={event => set({ stage: event.target.value })}><option value="all">Any stage</option><option value="starting">Starting</option><option value="growing">Growing</option><option value="established">Established</option></select></label>
    <label htmlFor="audience">ROLE<select id="audience" value={filters.audience} onChange={event => set({ audience: event.target.value })}><option value="all">Any role</option><option value="owner">Owner</option><option value="operator">Operator</option></select></label>
    <label htmlFor="capability">CAPABILITY<select id="capability" value={filters.capability} onChange={event => set({ capability: event.target.value })}><option value="all">Any capability</option>{capabilities.map(x => <option key={x} value={x}>{x.replaceAll("-", " ")}</option>)}</select></label>
    <label htmlFor="relationship">PRIMARY DESTINATION<select id="relationship" value={filters.relationship} onChange={event => set({ relationship: event.target.value })}><option value="all">Any destination</option><option value="affiliate">Saved referral link</option><option value="nonaffiliate">Official website</option></select></label>
    <p className="filter-note">Category facets describe the service area. Provider details and destination types reflect the available catalog records.</p></aside>
    <div className="directory-results"><div className="results-bar"><div><span className="eyebrow">DIRECTORY INDEX / PROVIDER LISTINGS</span><strong>{providers.length} providers · {categories.length} service areas</strong></div><label htmlFor="sort">SORT BY<select id="sort" value={filters.sort} onChange={event => set({ sort: event.target.value as Filters["sort"] })}><option value="name">Name</option><option value="group">Service group</option></select></label></div>
      {providers.length ? <section aria-label="Matching providers" className="provider-results">{providers.map(provider => { const category = catalog.categories.find(x => x.id === provider.primaryCategoryId)!; const primary = getPrimaryLink(provider); const outboundAllowed = primary.verificationStatus !== "invalid" && primary.verificationStatus !== "withdrawn"; return <article className="provider-card" key={provider.id}>{provider.logoUrl ? <Image className="provider-mark provider-logo" src={provider.logoUrl} width={54} height={54} unoptimized alt={`${provider.name} logo`}/> : <div className="provider-mark" aria-hidden="true">{provider.name.slice(0, 1).toUpperCase()}</div>}<div className="provider-card-copy"><span className="eyebrow">{category.name}</span><h2><Link href={`/providers/${provider.slug}`}>{provider.name}</Link></h2><p>{provider.summary}</p>{provider.capabilityLabels.length > 0 && <div className="provider-tags">{provider.capabilityLabels.slice(0, 4).map(capability => <span key={capability}>{capability}</span>)}</div>}<small>{primary.isAffiliate ? "Saved referral link · current attribution not confirmed" : "Company website"}</small></div><div className="provider-card-actions"><Link className="text-link" href={`/providers/${provider.slug}`}>View profile →</Link>{outboundAllowed && <a className="button button-orange" href={primary.url} target="_blank" rel={outboundRel(primary.isAffiliate)}>{primary.isAffiliate ? "Saved referral link" : "Company website"} ↗</a>}</div></article>; })}</section> : <div className="provider-empty"><span className="eyebrow">PROVIDER INDEX / NO MATCHING LISTINGS</span><p>No published provider listings match these filters. <Link href="/about">About directory listings →</Link></p><button className="button button-paper" type="button" onClick={reset}>Reset filters <span aria-hidden="true">↗</span></button></div>}
      <div className="results-bar"><div><span className="eyebrow">SERVICE AREA PATHWAYS</span><strong>{categories.length} of {catalog.categories.length} areas</strong></div></div><div aria-live="polite">{categories.length ? categories.map((category, index) => <CategoryLink key={category.id} category={category} index={index}/>) : <div className="zero-state"><h2>No service areas match.</h2><p>Try a broader phrase or clear a filter.</p><button className="button button-paper" type="button" onClick={reset}>Show all areas <span aria-hidden="true">↗</span></button></div>}</div>
    </div></div>;
}
