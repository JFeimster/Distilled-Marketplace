import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectoryExplorer } from "@/components/DirectoryExplorer";
import { Disclosure } from "@/components/Disclosure";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Business service directory", "Find business tools and services by category, capability, role, and business stage.", "/directory");
export default async function Directory({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const initial = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  return <><Breadcrumbs items={[{ label: "Directory" }]}/><DirectoryExplorer initial={initial}/><div className="wrap"><Disclosure compact/></div></>;
}
