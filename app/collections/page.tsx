import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Practical service collections", "Explore operating stacks that connect business service areas in an accountable order, without fabricated vendor recommendations.", "/collections");
export default function Collections() { return <><Breadcrumbs items={[{ label: "Collections" }]}/><section className="wrap page-lead"><span className="eyebrow">COLLECTIONS / OPERATING SEQUENCES</span><h1>Build a stack<br/><em>that holds up.</em></h1><p>Each collection names the sequence of service areas to evaluate. No provider placement is implied.</p></section><section className="wrap collections-index">{catalog.collections.map((item, index) => <Link href={`/collections/${item.id}`} className="collection-index-row" key={item.id}><span className="eyebrow">0{index + 1} / {item.audience.toUpperCase()}</span><strong>{item.name}</strong><p>{item.summary}</p><span>{item.categoryIds.length} areas ↗</span></Link>)}</section></>; }
