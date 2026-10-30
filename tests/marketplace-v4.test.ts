import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidElement } from "react";
import raw from "../data/marketplace/catalog.json";
import { catalog } from "@/lib/catalog";
import { getPrimaryLink, primaryCtaLabel, visibleSecondaryLinks } from "@/lib/affiliate-links";
import { emptyProviderFilters, filterProviders } from "@/lib/discovery";
import { validateCatalog } from "@/lib/validate";
import { ProviderCard } from "@/components/ProviderCard";
import ProviderPage from "@/app/providers/[slug]/page";
import type { Catalog } from "@/schemas/catalog";

function treeText(node: unknown): string {
  if (Array.isArray(node)) return node.map(treeText).join(" ");
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement(node)) return "";
  const props = node.props as Record<string, unknown>;
  return [props.className, props.href, props.rel, treeText(props.children)].filter(Boolean).join(" ");
}

test("public primary actions preserve every saved affiliate URL", () => {
  const affiliates = catalog.providers.filter(provider => provider.affiliateUrl);
  assert.equal(affiliates.length, 52);
  for (const provider of affiliates) {
    assert.equal(getPrimaryLink(provider).url, provider.affiliateUrl);
    assert.equal(getPrimaryLink(provider).url, provider.primaryUrl);
    assert.match(primaryCtaLabel(provider), /^Explore |^Get Started$/);
  }
});

test("untracked secondary conversion links do not bypass a tracked primary", () => {
  const provider = catalog.providers.find(item => item.slug === "browseai")!;
  const links = visibleSecondaryLinks(provider);
  assert.ok(links.some(link => link.purpose === "documentation"));
  assert.ok(!links.some(link => link.purpose === "homepage" || link.purpose === "product_page"));
  const withTracked = { ...provider, links: [...provider.links, { id: "approved-pricing", url: "https://partner.example/pricing?track=1", purpose: "pricing_page" as const, linkType: "saved_tracking_referral" as const, isAffiliate: true, isPrimary: false, verificationStatus: "verified" as const, sourceReferences: [], deepLinkSupported: false }] };
  assert.ok(visibleSecondaryLinks(withTracked).some(link => link.id === "approved-pricing"));
});

test("directory search and category, group, role, stage, and capability facets combine", () => {
  const target = catalog.providers.find(provider => provider.slug === "browseai")!;
  const filters = { ...emptyProviderFilters, q: "Browse AI", category: "ai-automation", group: "Systems", audience: "owner", stage: "growing", capability: "data-extraction" };
  assert.ok(filterProviders(catalog.providers, catalog.categories, filters).some(provider => provider.id === target.id));
  assert.equal(filterProviders(catalog.providers, catalog.categories, { ...filters, group: "Money" }).length, 0);
  assert.equal(filterProviders(catalog.providers, catalog.categories, { ...filters, stage: "starting" }).length, 0);
});

test("provider card supports grid and list views with customer-facing CTAs", () => {
  const provider = catalog.providers.find(item => item.slug === "browseai")!;
  const category = catalog.categories.find(item => item.id === provider.primaryCategoryId)!;
  for (const compact of [false, true]) {
    const html = treeText(ProviderCard({ provider, category, compact, selected: false, onSelect: () => {}, selectionDisabled: false }));
    assert.match(html, /View Details/);
    assert.match(html, /Explore Browse AI/);
    assert.match(html, /sponsored noopener noreferrer/);
    assert.equal(html.includes("market-card-list"), compact);
    assert.doesNotMatch(html, /Saved referral link|Current attribution/i);
  }
});

test("profiles render authored sections and omit missing workflow content", async () => {
  const rich = treeText(await ProviderPage({ params: Promise.resolve({ slug: "browseai" }) }));
  const sparse = treeText(await ProviderPage({ params: Promise.resolve({ slug: "xendooonlineaccounting" }) }));
  assert.match(rich, /What to explore/);
  assert.match(rich, /Before you decide/);
  assert.match(sparse, /Check Current Pricing/);
  assert.doesNotMatch(sparse, /WORKFLOW LAB/);
  assert.doesNotMatch(rich, /Saved referral link|Current attribution/i);
});

test("related references and CTA links must resolve to known catalog destinations", () => {
  const valid = structuredClone(raw) as unknown as Catalog;
  valid.providers[0].relatedProviderIds = [valid.providers[1].id];
  valid.providers[0].relatedResources = [{ id: "directory-guide", title: "Explore the directory", type: "guide", url: "/directory", description: "Browse service categories and providers." }];
  assert.deepEqual(validateCatalog(valid).errors, []);
  valid.providers[0].relatedResources[0].url = "/imaginary-guide";
  assert.ok(validateCatalog(valid).errors.some(error => error.includes("Unapproved related resource")));
  valid.providers[0].relatedResources = [];
  valid.providers[0].ctas = [{ label: "Get Started", linkRef: "missing-link", placement: "primary" }];
  assert.ok(validateCatalog(valid).errors.some(error => error.includes("Unknown CTA link")));
});
