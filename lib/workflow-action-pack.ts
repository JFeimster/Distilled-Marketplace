import type { WorkflowBlueprint } from "@/schemas/catalog";

export type ActionPackProvider = { id: string; name: string; slug: string; logoUrl?: string | null };
export type ActionPackBlueprint = Pick<WorkflowBlueprint,
  "slug" | "title" | "summary" | "useCase" | "outcome" | "providerIds" | "requiredServices" |
  "trigger" | "inputs" | "outputs" | "flowSteps" | "setupSteps" | "humanReview" |
  "failureNotes" | "maintenanceNotes"> & { sources: { label: string; url: string }[] };
export type ActionPackPriority = "exploring" | "next" | "urgent";
export type ActionPackConfig = {
  objective: string;
  selectedProviderIds: string[];
  owner: string;
  reviewer: string;
  priority: ActionPackPriority;
  assumptions: string;
  notes: string;
};

export function actionPackBlueprint(item: WorkflowBlueprint): ActionPackBlueprint {
  return {
    slug: item.slug, title: item.title, summary: item.summary, useCase: item.useCase,
    outcome: item.outcome, providerIds: item.providerIds, requiredServices: item.requiredServices,
    trigger: item.trigger, inputs: item.inputs, outputs: item.outputs, flowSteps: item.flowSteps,
    setupSteps: item.setupSteps, humanReview: item.humanReview, failureNotes: item.failureNotes,
    maintenanceNotes: item.maintenanceNotes,
    sources: item.sourceReferences.flatMap(source =>
      source.visibility === "public" && source.url ? [{ label: source.label, url: source.url }] : [])
  };
}

export function defaultActionPackConfig(item: ActionPackBlueprint): ActionPackConfig {
  return { objective: item.useCase, selectedProviderIds: [], owner: "", reviewer: "",
    priority: "exploring", assumptions: "", notes: "" };
}

const pilotChecks = [
  "Run a small test with fictional or de-identified records; do not put credentials or sensitive documents in the pack.",
  "Confirm each input, required service, permission, and output with the system owner.",
  "Exercise a missing input and a failed handoff; verify the exception reaches a person.",
  "Have the responsible reviewer approve the result before any live operational use.",
  "Record the owner, monitoring interval, and rollback or manual fallback."
];

export function buildActionPack(item: ActionPackBlueprint, providers: ActionPackProvider[], config: ActionPackConfig) {
  const byId = new Map(providers.map(provider => [provider.id, provider]));
  const selected = new Set(config.selectedProviderIds.filter(id => byId.has(id)));
  const matchedProviders = item.providerIds.filter(id => selected.has(id)).flatMap(id => byId.get(id) ?? []);
  const missingProviders = item.providerIds.filter(id => !selected.has(id)).flatMap(id => byId.get(id) ?? []);
  const otherStackProviders = [...selected].filter(id => !item.providerIds.includes(id)).flatMap(id => byId.get(id) ?? [])
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    title: item.title,
    slug: item.slug,
    objective: config.objective.trim() || item.useCase,
    expectedOutcome: item.outcome,
    owner: config.owner.trim() || "Assign a workflow owner",
    reviewer: config.reviewer.trim() || "Assign a responsible reviewer",
    priority: config.priority,
    trigger: item.trigger,
    matchedProviders,
    missingProviders,
    otherStackProviders,
    requiredServicesToConfirm: item.requiredServices,
    implementationSteps: item.setupSteps,
    workflowSteps: item.flowSteps,
    inputs: item.inputs,
    outputs: item.outputs,
    humanReview: item.humanReview,
    failureNotes: item.failureNotes,
    maintenanceNotes: item.maintenanceNotes,
    assumptions: config.assumptions.trim(),
    notes: config.notes.trim(),
    pilotChecks,
    sources: item.sources
  };
}

export type ActionPack = ReturnType<typeof buildActionPack>;

function safeLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").replace(/[<>]/g, "").trim();
}
function bulletLines(values: string[]) {
  return values.length ? values.map(value => `- ${safeLine(value)}`).join("\n") : "- None listed.";
}
function providerLines(providers: ActionPackProvider[], origin: string) {
  return providers.length ? providers.map(provider =>
    `- [${safeLine(provider.name)}](${origin}/providers/${provider.slug})`).join("\n") : "- None selected.";
}

export function formatActionPackMarkdown(pack: ActionPack, origin: string) {
  const base = origin.replace(/\/$/, "");
  const steps = pack.implementationSteps.map((step, index) => `${index + 1}. ${safeLine(step)}`).join("\n");
  const workflow = pack.workflowSteps.map((step, index) =>
    `${index + 1}. **${safeLine(step.label)}:** ${safeLine(step.detail)}`).join("\n");
  const sources = pack.sources.length ? pack.sources.map(source =>
    `- [${safeLine(source.label)}](${source.url})`).join("\n") : "- No public source link is listed for this blueprint.";
  return `# ${safeLine(pack.title)} — Action Pack

Editorial planning guide only. This is not an importable or executable workflow. Review requirements and permissions before use.
Blueprint: ${base}/workflows/${pack.slug}

## Objective and ownership
- Objective: ${safeLine(pack.objective)}
- Expected outcome: ${safeLine(pack.expectedOutcome)}
- Trigger: ${safeLine(pack.trigger)}
- Priority: ${pack.priority}
- Workflow owner: ${safeLine(pack.owner)}
- Responsible reviewer: ${safeLine(pack.reviewer)}

## Stack and prerequisites
Named providers already in your stack:
${providerLines(pack.matchedProviders, base)}

Named providers missing from your selected stack:
${providerLines(pack.missingProviders, base)}

Other selected providers (no blueprint connection claimed):
${providerLines(pack.otherStackProviders, base)}

Required services and setup assumptions to verify:
${bulletLines(pack.requiredServicesToConfirm)}
${pack.assumptions ? `\nYour assumptions: ${safeLine(pack.assumptions)}\n` : ""}
## Implementation checklist
${steps}

Workflow sequence:
${workflow}

## Inputs and outputs
Inputs:
${bulletLines(pack.inputs)}

Outputs:
${bulletLines(pack.outputs)}

## Human review
- ${safeLine(pack.humanReview)}
- Reviewer: ${safeLine(pack.reviewer)}

## Failure and maintenance
- Failure handling: ${safeLine(pack.failureNotes)}
- Ongoing maintenance: ${safeLine(pack.maintenanceNotes)}

## Pilot validation
${pack.pilotChecks.map(check => `- [ ] ${safeLine(check)}`).join("\n")}
${pack.notes ? `\n## Additional requirements and notes\n${safeLine(pack.notes)}\n` : ""}
## Relevant links
${providerLines([...pack.matchedProviders, ...pack.missingProviders], base)}
${sources}
`;
}

export async function copyActionPack(text: string, clipboard: Pick<Clipboard, "writeText">) {
  await clipboard.writeText(text);
}

export function actionPackDownload(pack: ActionPack, origin: string) {
  return { fileName: `${pack.slug}-action-pack.md`, mimeType: "text/markdown;charset=utf-8",
    content: formatActionPackMarkdown(pack, origin) };
}
