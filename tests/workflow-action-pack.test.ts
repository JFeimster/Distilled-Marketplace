import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ActionPackBuilder } from "@/components/ActionPackBuilder";
import { catalog } from "@/lib/catalog";
import {
  actionPackBlueprint, actionPackDownload, buildActionPack, copyActionPack,
  defaultActionPackConfig, formatActionPackMarkdown
} from "@/lib/workflow-action-pack";

const workflow = catalog.workflowBlueprints.find(item => item.slug === "funding-intake-review")!;
const blueprint = actionPackBlueprint(workflow);
const providers = catalog.providers.map(provider => ({ id: provider.id, name: provider.name, slug: provider.slug }));
const origin = "https://distilled-marketplace.vercel.app";

test("action pack separates selected, missing, and unrelated stack providers", () => {
  const defaults = defaultActionPackConfig(blueprint);
  const empty = buildActionPack(blueprint, providers, defaults);
  assert.deepEqual(empty.matchedProviders, []);
  assert.deepEqual(empty.missingProviders.map(provider => provider.id), workflow.providerIds);
  assert.deepEqual(empty.requiredServicesToConfirm, workflow.requiredServices);
  const customized = buildActionPack(blueprint, providers, {
    ...defaults, selectedProviderIds: ["n8n", "quickbooks", "unknown-id", "n8n"],
    objective: "Route consented inquiries for broker review", owner: "Operations", reviewer: "Broker"
  });
  assert.deepEqual(customized.matchedProviders.map(provider => provider.id), ["n8n"]);
  assert.deepEqual(customized.missingProviders.map(provider => provider.id), ["pipedrive"]);
  assert.deepEqual(customized.otherStackProviders.map(provider => provider.id), ["quickbooks"]);
  assert.equal(customized.owner, "Operations");
  assert.equal(customized.reviewer, "Broker");
});

test("Markdown output is useful, linked, editorial, and downloadable", () => {
  const pack = buildActionPack(blueprint, providers, {
    ...defaultActionPackConfig(blueprint),
    selectedProviderIds: ["n8n"], priority: "next",
    assumptions: "Consent field is available", notes: "Review the exception queue weekly"
  });
  const markdown = formatActionPackMarkdown(pack, origin);
  const download = actionPackDownload(pack, origin);
  assert.equal(download.fileName, "funding-intake-review-action-pack.md");
  assert.equal(download.mimeType, "text/markdown;charset=utf-8");
  assert.equal(download.content, markdown);
  for (const section of ["Objective and ownership", "Stack and prerequisites", "Implementation checklist",
    "Inputs and outputs", "Human review", "Failure and maintenance", "Pilot validation", "Relevant links"]) {
    assert.ok(markdown.includes(`## ${section}`));
  }
  assert.match(markdown, /editorial planning guide only/i);
  assert.match(markdown, /providers\/pipedrive/);
  assert.match(markdown, /Consent field is available/);
  assert.doesNotMatch(markdown, /affiliateUrl|trackingProvider|credential=/i);
});

test("copy adapter writes the exact generated action pack", async () => {
  let copied = "";
  const pack = buildActionPack(blueprint, providers, defaultActionPackConfig(blueprint));
  const markdown = formatActionPackMarkdown(pack, origin);
  await copyActionPack(markdown, { writeText: async text => { copied = text; } });
  assert.equal(copied, markdown);
});

test("builder renders native labeled controls and export actions", () => {
  const html = renderToStaticMarkup(createElement(ActionPackBuilder, { blueprint, providers, origin }));
  assert.match(html, /Business or project objective/);
  assert.match(html, /Workflow owner/);
  assert.match(html, /Responsible reviewer/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /Copy action pack/);
  assert.match(html, /Download Markdown/);
  assert.match(html, /Reset to blueprint defaults/);
  assert.match(html, /aria-live="polite"/);
});
