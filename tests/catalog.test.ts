import assert from "node:assert/strict";
import { test } from "node:test";
import raw from "../data/marketplace/catalog.json";
import { validateCatalog } from "../lib/validate";
import { filterCategories, findStack, emptyFilters } from "../lib/discovery";

test("catalog publishes the owner-approved provider inventory", () => {
  const { catalog, errors } = validateCatalog(raw);
  assert.deepEqual(errors, []);
  assert.equal(catalog.categories.length, 16);
  assert.equal(catalog.providers.length, 154);
  assert.equal(catalog.providers.filter(provider => provider.linkType === "saved_tracking_referral").length, 52);
  assert.equal(catalog.providers.filter(provider => provider.linkType === "official_website").length, 102);
  assert.ok(catalog.providers.every(provider => provider.approvalStatus === "owner_approved" && provider.status === "published"));
  assert.ok(catalog.providers.every(provider => provider.links.filter(link => link.isPrimary).length === 1));
  assert.equal(catalog.offers.length, 0);
});
test("duplicate IDs and broken relations fail validation", () => {
  const duplicate = structuredClone(raw);
  duplicate.categories[1].id = duplicate.categories[0].id;
  const errors = validateCatalog(duplicate).errors;
  assert.ok(errors.some(x => x.includes("Duplicate category ID")));
  assert.ok(errors.some(x => x.includes("Bad related category")));
});
test("directory filtering combines query and facets without invented provider data", () => {
  const categories = validateCatalog(raw).catalog.categories;
  const results = filterCategories(categories, { ...emptyFilters, q: "payroll", stage: "growing", audience: "operator" });
  assert.deepEqual(results.map(x => x.id), ["hr-payroll"]);
  assert.deepEqual(filterCategories(categories, { ...emptyFilters, q: "unmatched-term" }), []);
});
test("stack finder is deterministic and explains its path", () => {
  const input = { goal: "manage-cash" as const, stage: "growing" as const, needs: ["sell-online", "sell-online"] };
  const result = findStack(input);
  assert.deepEqual(result.ids, ["accounting-bookkeeping", "budgeting-finops", "banking-neobanking", "ecommerce"]);
  assert.match(result.explanation, /records/);
});
