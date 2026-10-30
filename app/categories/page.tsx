import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryLink } from "@/components/CategoryLink";
import { catalog, groups } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Service categories", "Browse 16 business service areas organized by operating need, with evaluation questions and source status.", "/categories");
export default function Categories() { return <><Breadcrumbs items={[{ label: "Categories" }]}/><section className="wrap page-lead"><span className="eyebrow">CATEGORY INDEX / EDITORIAL TAXONOMY</span><h1>One business.<br/><em>Many systems.</em></h1><p>Find the area that owns your next decision, then review what to verify before choosing a service.</p></section><div className="wrap category-index">{groups.map(group => <section key={group}><div className="index-header"><span className="eyebrow">{group.toUpperCase()}</span><strong>{catalog.categories.filter(x => x.group === group).length} areas</strong></div>{catalog.categories.filter(x => x.group === group).map((category, index) => <CategoryLink category={category} index={index} key={category.id}/>)}</section>)}</div><div className="wrap after-index"><Link href="/directory" className="button button-orange">Search by need <span aria-hidden="true">↗</span></Link></div></>; }
