import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/lib/config";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-700.css";
import "./globals.css";
import "./marketplace-v4.css";
import "./workflow-lab.css";

export const metadata: Metadata = { metadataBase: new URL(site.url), title: { default: site.name, template: `%s | ${site.name}` }, description: site.description, robots: { index: false, follow: false }, icons: { icon: "/icon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader/><main id="main-content">{children}</main><SiteFooter/></body></html>; }
