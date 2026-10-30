import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectoryExplorer } from "@/components/DirectoryExplorer";
import { Disclosure } from "@/components/Disclosure";
import { pageMetadata } from "@/lib/seo";
import { catalog } from "@/lib/catalog";
export const metadata = pageMetadata("Business service directory", "Search and filter business service areas by need, stage, role and capability. Provider records appear only after source review.", "/directory");
export default async function Directory({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const initial = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  return <><Breadcrumbs items={[{ label: "Directory" }]}/><section className="wrap page-lead"><span className="eyebrow">DIRECTORY / {catalog.providers.length} BUSINESS SERVICE PROVIDERS</span><h1>Find the right<br/><em>service provider.</em></h1><p>Browse provider listings by service area, search by name or capability, and follow the saved company or referral destination.</p></section><section className="wrap directory-section"><DirectoryExplorer initial={initial}/><Disclosure compact/></section></>;
}
