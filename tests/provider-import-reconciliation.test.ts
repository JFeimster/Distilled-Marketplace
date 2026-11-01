import assert from "node:assert/strict";
import { test } from "node:test";
import { reconcileProvider, reconcileProviderCatalog } from "@/lib/provider-import-reconciliation";
import { catalog } from "@/lib/catalog";
import type { Provider } from "@/schemas/catalog";

const existing = catalog.providers[0];

test("reimport preserves editorial enrichment and the exact saved primary destination", () => {
  const authored = { ...existing, summary: "Editorial summary retained.", useCases: ["Owner-authored use case"] };
  const source = { ...existing, summary: "Changed source summary", useCases: ["Source use case"], primaryUrl: "https://changed.example/" } as Provider;
  const result = reconcileProvider(authored, source);
  assert.equal(result.provider.summary, authored.summary);
  assert.deepEqual(result.provider.useCases, ["Owner-authored use case", "Source use case"]);
  assert.equal(result.provider.primaryUrl, authored.primaryUrl);
  assert.ok(result.conflicts.some(conflict => conflict.field === "summary"));
  const destinationConflict = result.conflicts.find(conflict => conflict.field === "primaryUrl");
  assert.deepEqual([destinationConflict?.canonical, destinationConflict?.incoming], ["[redacted]", "[redacted]"]);
});

test("reconciliation is idempotent, adds approved IDs once, and reports changed identity facts", () => {
  const added = { ...existing, id: "new-provider", slug: "new-provider", name: "New Provider" } as Provider;
  const first = reconcileProviderCatalog([existing], [existing, added]);
  const second = reconcileProviderCatalog(first.providers, [existing, added]);
  assert.equal(second.providers.length, 2);
  assert.deepEqual(second.conflicts, []);
  const altered = { ...existing, slug: "different-slug" } as Provider;
  assert.ok(reconcileProvider(existing, altered).conflicts.some(conflict => conflict.field === "slug"));
});

test("explicitly authorized source facts can update one field without dropping other editorial fields", () => {
  const authored = { ...existing, summary: "Retain this unless explicitly reconciled.", useCases: ["Editorial application"] };
  const source = { ...existing, summary: "Updated source-backed summary", useCases: ["New source application"] } as Provider;
  const result = reconcileProvider(authored, source, false, new Set(["summary"]));
  assert.equal(result.provider.summary, source.summary);
  assert.deepEqual(result.provider.useCases, ["Editorial application", "New source application"]);
});

test("an explicitly authorized primary replacement is applied", () => {
  const nextPrimary = { ...existing.links[0], url: "https://new.example/", linkType: "official_website" as const, isAffiliate: false };
  const updated = { ...existing, primaryUrl: "https://new.example/", affiliateUrl: null, linkType: "official_website", links: [nextPrimary] } as Provider;
  const result = reconcileProvider(existing, updated, true);
  assert.equal(result.provider.primaryUrl, updated.primaryUrl);
});

test("a new ID with an existing normalized company name is held as a possible alias", () => {
  const alias = { ...existing, id: "alternate-id", slug: "alternate-id" } as Provider;
  const result = reconcileProviderCatalog([existing], [alias]);
  assert.deepEqual(result.providers.map(provider => provider.id), [existing.id]);
  assert.equal(result.conflicts[0]?.field, "possible_name_alias");
});

test("source refresh adds dated evidence to an existing feature without duplicating its editorial copy", () => {
  const authored = { ...existing, features: [{ name: "Existing capability", description: "Editorial explanation", sources: [], evidenceStatus: "editorial" }] } as Provider;
  const sourced = { ...existing, features: [{ name: "Existing capability", description: "Source wording", sources: [{ label: "Official page", url: "https://provider.example/features", checkedAt: "2026-10-30", supports: ["Existing capability"] }], evidenceStatus: "draft_from_primary_source" }] } as Provider;
  const result = reconcileProvider(authored, sourced);
  assert.equal(result.provider.features.length, 1);
  assert.equal(result.provider.features[0].description, "Editorial explanation");
  assert.equal(result.provider.features[0].sources[0].checkedAt, "2026-10-30");
});
