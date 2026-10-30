import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ComparisonWorkspace } from "@/components/ComparisonWorkspace";
import { Disclosure } from "@/components/Disclosure";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Compare business services", "Compare owner-approved provider listings by category and see which details are present or missing.", "/compare");
export default function Compare() { return <><Breadcrumbs items={[{ label: "Compare" }]}/><section className="wrap page-lead"><span className="eyebrow">DECISION WORKSPACE / COMPARISON</span><h1>Compare provider<br/><em>listings.</em></h1><p>Compare providers within a service category. The table shows available details and labels missing fields as not supplied.</p></section><section className="wrap compare-section"><ComparisonWorkspace/><div className="comparison-method"><h2>How to read a comparison</h2><ol><li>Listings are grouped by their assigned service category</li><li>Only supplied fields appear in the table</li><li>“Not supplied” does not mean the provider lacks a feature</li><li>Saved referral destinations are labeled and use sponsored link attributes</li><li>No ratings or paid placement determine a ranking</li></ol><Link href="/about" className="text-link">Read how the Marketplace works →</Link></div><Disclosure compact/></section></>; }
