import Image from "next/image";
import Link from "next/link";
import type { Category, Provider } from "@/schemas/catalog";
import { getPrimaryLink, outboundRel, primaryCtaLabel } from "@/lib/affiliate-links";
import { workflowDiscoveriesForProvider } from "@/lib/workflows";

export function ProviderCard({ provider, category, compact, selected = false, onSelect, selectionDisabled = false, showCompare = true }: { provider: Provider; category: Category; compact?: boolean; selected?: boolean; onSelect?: (id: string, checked: boolean) => void; selectionDisabled?: boolean; showCompare?: boolean }) {
  const primary = getPrimaryLink(provider);
  const available = primary.verificationStatus !== "invalid" && primary.verificationStatus !== "withdrawn" && provider.linkHealthStatus !== "broken" && provider.linkHealthStatus !== "withdrawn";
  const media = provider.featuredMedia ?? provider.hero?.media;
  const workflows = workflowDiscoveriesForProvider(provider.id, provider.categoryIds, 2);
  return <article className={`market-card ${compact ? "market-card-list" : ""}`}>
    <div className="market-card-top"><div className="market-brand">{provider.logoUrl ? <Image src={provider.logoUrl} alt={`${provider.name} logo`} width={52} height={52} unoptimized/> : <span aria-hidden="true">{provider.name.slice(0, 1).toUpperCase()}</span>}</div><div className="market-card-heading"><span className="eyebrow">{category.name}</span><h2><Link href={`/providers/${provider.slug}`}>{provider.name}</Link></h2></div>{showCompare && onSelect && <label className="market-select"><input type="checkbox" aria-label={`Compare ${provider.name}`} checked={selected} disabled={selectionDisabled && !selected} onChange={event => onSelect(provider.id, event.target.checked)}/><span>Compare</span></label>}</div>
    {media?.type === "image" && <div className="market-card-media"><Image src={media.url} alt={media.alt} width={480} height={240} unoptimized/></div>}
    <p className="market-card-summary">{provider.summary}</p>
    {provider.capabilityLabels.length > 0 && <div className="market-card-tags">{provider.capabilityLabels.slice(0, 4).map(label => <span key={label}>{label}</span>)}</div>}
    {provider.useCases.length > 0 && <p className="market-card-applications"><b>Useful for:</b> {provider.useCases.slice(0, 2).join(" · ")}</p>}
    {workflows.length > 0 && <div className="market-card-workflows" aria-label="Related workflow blueprints">{workflows.map(({ workflow, matchType }) => <Link href={`/workflows/${workflow.slug}`} key={workflow.id}>{workflow.title}<small>{matchType === "provider-listed" ? "Names this provider" : "Same service area"}</small><span aria-hidden="true">↗</span></Link>)}</div>}
    <div className="market-card-actions"><Link href={`/providers/${provider.slug}`} className="market-detail">View Details <span aria-hidden="true">↗</span></Link>{available && <a className="button button-orange" href={primary.url} target="_blank" rel={outboundRel(primary.isAffiliate)}>{primaryCtaLabel(provider)} <span aria-hidden="true">↗</span></a>}</div>
  </article>;
}
