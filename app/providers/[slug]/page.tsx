import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Disclosure } from "@/components/Disclosure";
import { catalog, categoryById, providerBySlug } from "@/lib/catalog";
import { getPrimaryLink, linkForRef, outboundRel, primaryCtaLabel, visibleSecondaryLinks } from "@/lib/affiliate-links";
import { pageMetadata } from "@/lib/seo";
import { workflowsForProvider } from "@/lib/workflows";
import type { Provider } from "@/schemas/catalog";

export function generateStaticParams() { return catalog.providers.map(provider => ({ slug: provider.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const provider = providerBySlug(slug);
  const title = provider?.seo?.title ?? provider?.metadataTitle ?? provider?.name ?? "";
  return provider ? pageMetadata(title.replace(/\s*\|\s*Distilled Marketplace$/i, ""), provider.seo?.description ?? provider.metadataDescription ?? provider.summary, `/providers/${slug}`) : {};
}
const infoLabels: Record<string, string> = { documentation: "Documentation", help_center: "Help center", blog: "Articles", resource: "Resources", pricing_page: "Pricing details", product_page: "Product details", demo: "Book a Demo", registration: "Get Started", landing_page: "Explore more" };
function distinctFeatures(features: Provider["features"]) {
  const words = (value: string) => new Set(value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(word => word.length > 2 && !["and", "the", "for", "with", "from", "your"].includes(word)));
  const kept: Provider["features"] = [];
  for (const feature of features) {
    const current = words(feature.name);
    const duplicate = kept.some(previous => {
      const prior = words(previous.name);
      const overlap = [...current].filter(word => prior.has(word)).length;
      return overlap / Math.max(1, Math.min(current.size, prior.size)) >= 0.8;
    });
    if (!duplicate) kept.push(feature);
  }
  return kept;
}
function PrimaryAction({ item, className = "button button-orange" }: { item: Provider; className?: string }) {
  const primary = getPrimaryLink(item);
  if (["invalid", "withdrawn"].includes(primary.verificationStatus) || ["broken", "withdrawn"].includes(item.linkHealthStatus)) return null;
  return <a className={className} href={primary.url} target="_blank" rel={outboundRel(primary.isAffiliate)}>{primaryCtaLabel(item)} <span aria-hidden="true">↗</span></a>;
}
export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = providerBySlug(slug); if (!item) notFound();
  const category = categoryById(item.primaryCategoryId); if (!category) notFound();
  const primary = getPrimaryLink(item);
  const media = item.hero?.media ?? item.featuredMedia ?? item.media[0];
  const secondaryLinks = visibleSecondaryLinks(item).filter(link => link.purpose !== "pricing_page" || link.id !== item.pricing?.linkRef);
  const pricingLink = item.pricing?.linkRef ? linkForRef(item, item.pricing.linkRef) : secondaryLinks.find(link => link.purpose === "pricing_page");
  const safePricingLink = pricingLink && (pricingLink.isPrimary || secondaryLinks.some(link => link.id === pricingLink.id)) ? pricingLink : primary;
  const related = item.relatedProviderIds.length ? item.relatedProviderIds.map(id => catalog.providers.find(provider => provider.id === id)).filter((provider): provider is Provider => Boolean(provider) && provider!.id !== item.id) : catalog.providers.filter(provider => provider.id !== item.id && provider.categoryIds.includes(category.id)).slice(0, 4);
  const relatedWorkflows = workflowsForProvider(item.id);
  const workflows = [...item.workflowTemplates, ...item.promptTemplates];
  const roleFit = item.audienceFit?.roles.length ? item.audienceFit.roles : item.roles;
  const stageFit = item.audienceFit?.businessStages.length ? item.audienceFit.businessStages : item.businessStages;
  const industryFit = item.audienceFit?.industries.length ? item.audienceFit.industries : item.industries;
  const hasPricing = Boolean(item.pricing?.model || item.pricingModel || item.pricing?.startingPrice || item.pricing?.notes || item.pricing?.trialAvailable !== undefined || item.pricing?.freeTierAvailable !== undefined);
  return <><Breadcrumbs items={[{ label: "Directory", href: "/directory" }, { label: category.name, href: `/categories/${category.id}` }, { label: item.name }]}/>
    <section className="provider-hero"><div className="wrap provider-hero-grid"><div className="provider-hero-copy"><div className="provider-identity">{item.logoUrl ? <Image src={item.logoUrl} alt={`${item.name} logo`} width={62} height={62} unoptimized/> : <span aria-hidden="true">{item.name.slice(0, 1).toUpperCase()}</span>}<div><span className="eyebrow">{category.name} / {category.group}</span><span>{item.name}</span></div></div><h1>{item.h1 ?? item.name}</h1><p className="provider-value">{item.hero?.headline ?? item.summary}</p>{item.hero?.description && <p>{item.hero.description}</p>}<div className="provider-hero-actions"><PrimaryAction item={item}/><Link href={`/directory?category=${category.id}`} className="button button-paper">Browse Alternatives <span aria-hidden="true">→</span></Link></div><div className="provider-quick-facts"><span>{category.name}</span>{item.serviceCoverage && <span>{item.serviceCoverage}</span>}{(item.pricing?.model ?? item.pricingModel) && <span>{item.pricing?.model ?? item.pricingModel}</span>}</div></div><div className="provider-visual">{media?.type === "image" ? <Image src={media.url} alt={media.alt} width={700} height={520} unoptimized/> : media?.type === "video" ? <video controls preload="none" aria-label={media.alt} src={media.url}/> : <div className="provider-visual-mark" aria-hidden="true"><span>{item.name.slice(0, 1).toUpperCase()}</span><b>{item.name}</b></div>}{media?.caption && <small>{media.caption}</small>}</div></div></section>
    <div className="wrap provider-main"><nav className="provider-jump" aria-label="Profile sections"><a href="#overview">Overview</a>{item.features.length > 0 && <a href="#features">Features</a>}{workflows.length > 0 && <a href="#workflows">Workflow lab</a>}<a href="#pricing">Pricing</a>{related.length > 0 && <a href="#alternatives">Alternatives</a>}</nav>
      <section id="overview" className="profile-section provider-overview"><div><span className="eyebrow">THE OVERVIEW</span><h2>Where {item.name} fits.</h2></div><div><p>{item.summary}</p>{item.capabilityLabels.length > 0 && <div className="market-card-tags">{item.capabilityLabels.slice(0, 8).map(label => <span key={label}>{label}</span>)}</div>}</div></section>
      {distinctFeatures(item.features).length > 0 && <section id="features" className="profile-section"><span className="eyebrow">FEATURES & CAPABILITIES</span><h2>What to explore.</h2><div className="profile-feature-grid">{distinctFeatures(item.features).map((feature, index) => <article key={`${feature.name}-${index}`}><span className="profile-feature-number">{String(index + 1).padStart(2, "0")}</span><h3>{feature.name}</h3>{feature.description && <p>{feature.description}</p>}{feature.media?.type === "image" && <Image src={feature.media.url} alt={feature.media.alt} width={440} height={250} unoptimized/>}</article>)}</div></section>}
      {item.howItWorks && (item.howItWorks.summary || item.howItWorks.steps.length > 0) && <section className="profile-section profile-steps"><span className="eyebrow">HOW IT WORKS</span><h2>From setup to use.</h2>{item.howItWorks.summary && <p>{item.howItWorks.summary}</p>}{item.howItWorks.steps.length > 0 && <ol>{item.howItWorks.steps.map((step, index) => <li key={`${index}-${step}`}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></li>)}</ol>}</section>}
      {workflows.length > 0 && <section id="workflows" className="profile-section profile-workflows"><span className="eyebrow">WORKFLOW LAB</span><h2>Put it to work.</h2><div>{workflows.map(workflow => <article key={workflow.id}><span className="eyebrow">PRACTICAL TEMPLATE</span><h3>{workflow.title}</h3>{workflow.description && <p>{workflow.description}</p>}{workflow.requirements.length > 0 && <p><b>Before you start:</b> {workflow.requirements.join(", ")}</p>}<ol>{workflow.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>{workflow.expectedOutput && <p><b>Expected output:</b> {workflow.expectedOutput}</p>}{workflow.resourceUrl && <a href={workflow.resourceUrl} target="_blank" rel="noopener noreferrer">Open resource ↗</a>}</article>)}</div></section>}
      {(item.inputs.length > 0 || item.outputs.length > 0 || item.integrations.length > 0 || item.useCases.length > 0) && <section className="profile-section"><span className="eyebrow">WORKFLOW DETAILS</span><h2>Inputs to outcomes.</h2><div className="profile-data-grid">{item.inputs.length > 0 && <div><h3>Typical inputs</h3><ul>{item.inputs.map(value => <li key={value}>{value}</li>)}</ul></div>}{item.outputs.length > 0 && <div><h3>Outputs</h3><ul>{item.outputs.map(value => <li key={value}>{value}</li>)}</ul></div>}{item.integrations.length > 0 && <div><h3>Integrations</h3><ul>{item.integrations.map(value => <li key={value}>{value}</li>)}</ul></div>}{item.useCases.length > 0 && <div><h3>Use cases</h3><ul>{item.useCases.map(value => <li key={value}>{value}</li>)}</ul></div>}</div></section>}
      {(roleFit.length > 0 || stageFit.length > 0 || industryFit.length > 0 || (item.audienceFit?.problems.length ?? 0) > 0) && <section className="profile-section profile-fit"><span className="eyebrow">WHO IT MAY FIT</span><h2>Match your context.</h2><div className="profile-data-grid">{roleFit.length > 0 && <div><h3>Roles</h3><p>{roleFit.join(" · ")}</p></div>}{stageFit.length > 0 && <div><h3>Business stages</h3><p>{stageFit.join(" · ")}</p></div>}{industryFit.length > 0 && <div><h3>Industries</h3><p>{industryFit.join(" · ")}</p></div>}{(item.audienceFit?.problems.length ?? 0) > 0 && <div><h3>Problems</h3><p>{item.audienceFit?.problems.join(" · ")}</p></div>}</div></section>}
      <section id="pricing" className="profile-section profile-pricing"><div><span className="eyebrow">PRICING</span><h2>Check the current terms.</h2><p>{hasPricing ? "Review the available pricing details and confirm current terms with the provider." : "Pricing varies or has not been supplied in this listing. Check with the provider for current details."}</p></div><div>{(item.pricing?.model ?? item.pricingModel) && <p><b>Model</b><span>{item.pricing?.model ?? item.pricingModel}</span></p>}{item.pricing?.startingPrice && <p><b>Starting price</b><span>{item.pricing.startingPrice}{item.pricing.billingPeriod ? ` / ${item.pricing.billingPeriod}` : ""}</span></p>}{item.pricing?.trialAvailable !== undefined && <p><b>Trial</b><span>{item.pricing.trialAvailable ? "Available" : "Not listed"}</span></p>}{item.pricing?.freeTierAvailable !== undefined && <p><b>Free tier</b><span>{item.pricing.freeTierAvailable ? "Available" : "Not listed"}</span></p>}{item.pricing?.notes && <p>{item.pricing.notes}</p>}{!["invalid", "withdrawn"].includes(safePricingLink.verificationStatus) && !["broken", "withdrawn"].includes(item.linkHealthStatus) && <a className="button button-orange" href={safePricingLink.url} target="_blank" rel={outboundRel(safePricingLink.isAffiliate)}>{hasPricing ? "View Pricing" : "Check Current Pricing"} <span aria-hidden="true">↗</span></a>}</div></section>
      {item.faqs.length > 0 && <section className="profile-section profile-faq"><span className="eyebrow">COMMON QUESTIONS</span><h2>Before you decide.</h2><div>{item.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>}
      {relatedWorkflows.length > 0 && <section className="profile-section"><span className="eyebrow">WORKFLOW LAB</span><h2>Put {item.name} in context.</h2><div className="workflow-related">{relatedWorkflows.slice(0,4).map(workflow => <Link href={`/workflows/${workflow.slug}`} key={workflow.id}><strong>{workflow.title}</strong><span>{workflow.summary}</span><b aria-hidden="true">↗</b></Link>)}</div>{relatedWorkflows.length>4&&<Link className="text-link" href={`/workflows?provider=${item.id}`}>See all {relatedWorkflows.length} blueprints →</Link>}</section>}
      {related.length > 0 && <section id="alternatives" className="profile-section"><span className="eyebrow">KEEP EXPLORING</span><h2>Related providers.</h2><div className="profile-related">{related.map(provider => <Link href={`/providers/${provider.slug}`} key={provider.id}><span className="eyebrow">{categoryById(provider.primaryCategoryId)?.name}</span><strong>{provider.name}</strong><span>{provider.summary}</span><b aria-hidden="true">↗</b></Link>)}</div></section>}
      {item.relatedResources.length > 0 && <section className="profile-section"><span className="eyebrow">DISTILLED RESOURCES</span><h2>Learn more.</h2><div className="profile-related">{item.relatedResources.map(resource => <a href={resource.url} key={resource.id} target="_blank" rel="noopener noreferrer"><span className="eyebrow">{resource.type.replaceAll("_", " ")}</span><strong>{resource.title}</strong><span>{resource.description}</span><b aria-hidden="true">↗</b></a>)}</div></section>}
      {secondaryLinks.length > 0 && <section className="profile-section profile-resources"><span className="eyebrow">MORE INFORMATION</span><h2>From {item.name}.</h2><div>{secondaryLinks.map(link => <a key={link.id} href={link.url} target="_blank" rel={outboundRel(link.isAffiliate)}>{link.ctaLabel ?? infoLabels[link.purpose] ?? "More information"} <span aria-hidden="true">↗</span></a>)}</div></section>}
      <section className="profile-final"><div><span className="eyebrow">NEXT STEP</span><h2>Explore {item.name}.</h2><p>See current features and terms directly from the provider.</p></div><PrimaryAction item={item}/></section><Disclosure compact/>
    </div>
  </>;
}
