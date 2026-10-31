import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidElement } from "react";
import raw from "../data/marketplace/catalog.json";
import { catalog } from "@/lib/catalog";
import { validateCatalog } from "@/lib/validate";
import { deriveWorkflowConnections, emptyWorkflowFilters, evaluateWorkflowCoverage, filterWorkflowListings } from "@/lib/workflow-discovery";
import { publishedWorkflows, workflowListing, workflowsForIndustry, workflowsForProvider } from "@/lib/workflows";
import WorkflowIndex from "@/app/workflows/page";
import WorkflowPage from "@/app/workflows/[slug]/page";
import IntegrationsPage from "@/app/integrations/page";
import PlaybookPage from "@/app/playbooks/[slug]/page";

function treeText(node: unknown): string {
  if (Array.isArray(node)) return node.map(treeText).join(" ");
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement(node)) return "";
  const props = node.props as Record<string, unknown>;
  return [props.className, props.href, treeText(props.children)].filter(Boolean).join(" ");
}

test("workflow schema validates unique slugs and canonical provider references", () => {
  const valid = structuredClone(raw);
  assert.deepEqual(validateCatalog(valid).errors, []);
  valid.workflowBlueprints[1].slug = valid.workflowBlueprints[0].slug;
  assert.ok(validateCatalog(valid).errors.some(error => error.includes("Duplicate workflow slug")));
  valid.workflowBlueprints[1].slug = "unique-test-slug";
  valid.workflowBlueprints[1].providerIds = ["unknown-provider"];
  assert.ok(validateCatalog(valid).errors.some(error => error.includes("Unknown workflow provider")));
});

test("published workflows carry source and editorial reuse metadata", () => {
  assert.equal(publishedWorkflows.length, 20);
  for (const workflow of publishedWorkflows) {
    assert.ok(workflow.sourceReferences.length > 0);
    assert.equal(workflow.importStatus, "editorial_blueprint_only");
    assert.ok(workflow.licenseStatus);
    assert.ok(workflow.attribution);
  }
  assert.equal(catalog.providers.length, 154);
  assert.equal(catalog.providers.filter(provider => provider.affiliateUrl).length, 52);
});

test("workflow relationships and filters use catalog fields", () => {
  const quickbooks = workflowsForProvider("quickbooks");
  assert.ok(quickbooks.length > 0);
  assert.ok(quickbooks.every(workflow => workflow.providerIds.includes("quickbooks")));
  assert.ok(workflowsForIndustry("funding-agencies").every(workflow => workflow.industryTags.includes("funding-agencies")));
  const listings = publishedWorkflows.map(workflowListing);
  const filtered = filterWorkflowListings(listings, { ...emptyWorkflowFilters, q: "books", provider: "quickbooks" });
  assert.ok(filtered.some(workflow => workflow.slug === "weekly-books-review"));
  assert.equal(filterWorkflowListings(listings, { ...emptyWorkflowFilters, provider: "unknown-provider" }).length, 0);
});

test("stack coverage separates required providers from documented integration support", () => {
  const listings = publishedWorkflows.map(workflowListing);
  const connections = deriveWorkflowConnections(publishedWorkflows);
  const documented = connections.find(connection => connection.status === "documented");
  const unknown = connections.find(connection => connection.status === "not_listed");
  assert.ok(documented?.evidence?.url);
  assert.ok(unknown);
  const rampWorkflow = listings.find(workflow => workflow.slug === "ramp-quickbooks-reconciliation")!;
  const full = evaluateWorkflowCoverage([rampWorkflow], rampWorkflow.providerIds, connections)[0];
  assert.equal(full.coverage, "included");
  assert.equal(full.missing.length, 0);
  assert.equal(full.integration, "documented");
  const partial = evaluateWorkflowCoverage([rampWorkflow], [rampWorkflow.providerIds[0]], connections)[0];
  assert.equal(partial.coverage, "missing");
  assert.equal(partial.missing.length, 1);
  const undocumented = evaluateWorkflowCoverage(listings.filter(item => item.providerIds.includes(unknown.providerIds[0]) && item.providerIds.includes(unknown.providerIds[1])), unknown.providerIds, connections);
  assert.ok(undocumented.some(result => result.integration === "not_listed"));
});

test("workflow, integration, playbook, and provider pages render catalog handoffs", async () => {
  const index = treeText(await WorkflowIndex({ searchParams: Promise.resolve({}) }));
  const detail = treeText(await WorkflowPage({ params: Promise.resolve({ slug: "weekly-books-review" }) }));
  const integrations = treeText(IntegrationsPage());
  const playbook = treeText(await PlaybookPage({ params: Promise.resolve({ slug: "funding-agencies" }) }));
  assert.match(index, /WORKFLOW LAB/);
  assert.match(detail, /weekly books review/i);
  assert.match(detail, /HUMAN REVIEW BOUNDARY/);
  assert.match(detail, /editorial blueprint/i);
  assert.match(integrations, /CONNECTIONS/);
  assert.match(playbook, /Funding agencies/);
});
