import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Disclosure } from "@/components/Disclosure";
import { catalog, categoryById, providerBySlug } from "@/lib/catalog";
import { getPrimaryLink, outboundRel } from "@/lib/affiliate-links";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() { return catalog.providers.map(provider => ({ slug: provider.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const provider = providerBySlug(slug);
  return provider ? pageMetadata(provider.metadataTitle ?? provider.name, provider.metadataDescription ?? provider.summary, `/providers/${slug}`) : {};
}
const linkLabels: Record<string, string> = { homepage: "Company website", landing_page: "Overview", product_page: "Product details", pricing_page: "Pricing", documentation: "Documentation", help_center: "Help center", blog: "Blog", resource: "Resource", partner_program: "Partner information", partner_portal: "Partner portal", app_portal: "Application portal", demo: "Demo", registration: "Registration", other: "More information", saved_tracking_referral: "Saved referral link" };

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = providerBySlug(slug); if (!item) notFound();
  const category = categoryById(item.primaryCategoryId); if (!category) notFound();
  const primary = getPrimaryLink(item);
  const outboundAllowed = primary.verificationStatus !== "invalid" && primary.verificationStatus !== "withdrawn" && item.linkHealthStatus !== "broken" && item.linkHealthStatus !== "withdrawn";
  const secondaryLinks = item.links.filter(link => !link.isPrimary && link.verificationStatus !== "invalid" && link.verificationStatus !== "withdrawn");
  const pricingLink = secondaryLinks.find(link => link.purpose === "pricing_page");
  const related = catalog.providers.filter(provider => provider.id !== item.id && provider.categoryIds.includes(category.id)).slice(0, 4);
  return <><Breadcrumbs items={[{ label: "Directory", href: "/directory" }, { label: category.name, href: `/categories/${category.id}` }, { label: item.name }]}/>
    <section className="wrap page-lead provider-page-lead">{item.logoUrl ? <Image className="provider-profile-logo" src={item.logoUrl} width={72} height={72} unoptimized alt={`${item.name} logo`}/> : <span className="provider-profile-fallback" aria-hidden="true">{item.name.slice(0, 1).toUpperCase()}</span>}<span className="eyebrow">BUSINESS SERVICE PROVIDER / {category.name.toUpperCase()}</span><h1>{item.h1 ?? item.name}</h1><p>{item.summary}</p></section>
    <section className="wrap provider-detail"><div>
      <section><h2>About {item.name}</h2><p>{item.summary}</p>{item.capabilityLabels.length > 0 && <div className="provider-tags">{item.capabilityLabels.map(label => <span key={label}>{label}</span>)}</div>}</section>
      {item.features.length > 0 && <section><h2>Capabilities and features</h2><div className="provider-feature-list">{item.features.map((feature, index) => <article key={`${feature.name}-${index}`}><strong>{feature.name}</strong>{feature.description && <p>{feature.description}</p>}{feature.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</article>)}</div></section>}
      {item.audiences.length > 0 && <section><h2>Intended audiences</h2><ul>{item.audiences.map(audience => <li key={audience}>{audience}</li>)}</ul></section>}
      {item.howItWorks && (item.howItWorks.summary || item.howItWorks.steps.length > 0) && <section><h2>How it works</h2>{item.howItWorks.summary && <p>{item.howItWorks.summary}</p>}{item.howItWorks.steps.length > 0 && <ol>{item.howItWorks.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>}{item.howItWorks.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">Source: {source.label} ↗</a>)}</section>}
      {item.limitations.length > 0 && <section><h2>Limitations</h2><ul>{item.limitations.map(value => <li key={value}>{value}</li>)}</ul></section>}
      {item.integrations.length > 0 && <section><h2>Integrations</h2><p>{item.integrations.join(", ")}</p></section>}
      {item.faqs.length > 0 && <section><h2>Frequently asked questions</h2>{item.faqs.map(faq => <article className="provider-faq" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p>{faq.source && <a href={faq.source.url} target="_blank" rel="noopener noreferrer">Source: {faq.source.label} ↗</a>}</article>)}</section>}
      {related.length > 0 && <section><h2>More providers in {category.name}</h2><div className="provider-related">{related.map(provider => <Link href={`/providers/${provider.slug}`} key={provider.id}><b>{provider.name}</b><span>{provider.summary}</span></Link>)}</div></section>}
    </div><aside><span className="eyebrow">EXPLORE PROVIDER</span><p><b>Category:</b> <Link href={`/categories/${category.id}`}>{category.name}</Link></p>
      {item.pricingModel && <p><b>Pricing model:</b> {item.pricingModel}</p>}{pricingLink && <p><a href={pricingLink.url} target="_blank" rel="noopener noreferrer">See pricing information ↗</a></p>}
      {item.serviceCoverage && <p><b>Service coverage:</b> {item.serviceCoverage}</p>}
      {outboundAllowed && <a className="button button-orange" href={primary.url} target="_blank" rel={outboundRel(primary.isAffiliate)}>{primary.isAffiliate ? "Continue to saved referral link" : "Visit company website"} ↗</a>}
      {primary.isAffiliate && <p className="fine-print">{item.disclaimer ?? "This is a saved referral destination. Current attribution and commercial terms have not been independently confirmed."}</p>}
      {secondaryLinks.length > 0 && <div className="provider-secondary-links"><b>More from {item.name}</b>{secondaryLinks.map(link => <a key={link.id} href={link.url} target="_blank" rel={outboundRel(link.isAffiliate)}>{linkLabels[link.purpose] ?? "More information"} ↗</a>)}</div>}
      <p className="fine-print">Confirm current services, pricing and terms directly with the provider.</p>
    </aside></section>
    {item.sources.length > 0 && <section className="wrap provider-sources"><h2>Source references</h2><ul>{item.sources.map(source => <li key={`${source.url}-${source.label}`}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>{source.checkedAt && <span>Observed {source.checkedAt}</span>}</li>)}</ul></section>}
    <section className="wrap provider-sources"><Link href={`/categories/${item.primaryCategoryId}`} className="text-link">Explore {category.name} →</Link><Disclosure/></section>
  </>;
}
