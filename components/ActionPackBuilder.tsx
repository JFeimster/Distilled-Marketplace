"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  actionPackDownload, buildActionPack, copyActionPack, defaultActionPackConfig,
  formatActionPackMarkdown, type ActionPackBlueprint, type ActionPackConfig, type ActionPackProvider
} from "@/lib/workflow-action-pack";

export function ActionPackBuilder({ blueprint, providers, origin }: {
  blueprint: ActionPackBlueprint; providers: ActionPackProvider[]; origin: string
}) {
  const [config, setConfig] = useState<ActionPackConfig>(() => defaultActionPackConfig(blueprint));
  const [providerQuery, setProviderQuery] = useState("");
  const [message, setMessage] = useState("");
  const byId = useMemo(() => new Map(providers.map(provider => [provider.id, provider])), [providers]);
  const named = blueprint.providerIds.flatMap(id => byId.get(id) ?? []);
  const other = providers.filter(provider => !blueprint.providerIds.includes(provider.id) &&
    provider.name.toLowerCase().includes(providerQuery.trim().toLowerCase()));
  const pack = useMemo(() => buildActionPack(blueprint, providers, config), [blueprint, providers, config]);
  const markdown = useMemo(() => formatActionPackMarkdown(pack, origin), [pack, origin]);
  const update = (patch: Partial<ActionPackConfig>) => { setConfig(value => ({ ...value, ...patch })); setMessage(""); };
  const select = (id: string, checked: boolean) => update({
    selectedProviderIds: checked
      ? [...new Set([...config.selectedProviderIds, id])]
      : config.selectedProviderIds.filter(value => value !== id)
  });
  const copy = async () => {
    try {
      await copyActionPack(markdown, navigator.clipboard);
      setMessage("Action pack copied to clipboard.");
    } catch {
      setMessage("Clipboard unavailable. Use Download Markdown instead.");
    }
  };
  const download = () => {
    const artifact = actionPackDownload(pack, origin);
    const url = URL.createObjectURL(new Blob([artifact.content], { type: artifact.mimeType }));
    const link = document.createElement("a");
    link.href = url; link.download = artifact.fileName;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Markdown action pack downloaded.");
  };
  const reset = () => {
    setConfig(defaultActionPackConfig(blueprint)); setProviderQuery("");
    setMessage("Restored blueprint defaults.");
  };

  return <section id="customize-workflow" className="workflow-section action-pack-section" aria-labelledby="action-pack-title">
    <div className="workflow-section-head"><div><span className="eyebrow">WORKFLOW ACTION PACK</span><h2 id="action-pack-title">Make this your plan.</h2></div><p>Customize the editorial blueprint and take a practical checklist with you. Your entries stay in this browser until you copy or download them.</p></div>
    <div className="action-pack-layout">
      <form className="action-pack-form" onSubmit={event => event.preventDefault()}>
        <div className="action-pack-form-head"><strong>01 / Your context</strong><span>All fields can be edited later.</span></div>
        <label>Business or project objective<textarea rows={3} value={config.objective} onChange={event => update({ objective: event.target.value })} maxLength={500}/></label>
        <div className="action-pack-form-pair">
          <label>Workflow owner<input type="text" value={config.owner} onChange={event => update({ owner: event.target.value })} placeholder="Team or role" maxLength={120}/></label>
          <label>Responsible reviewer<input type="text" value={config.reviewer} onChange={event => update({ reviewer: event.target.value })} placeholder="Team or role" maxLength={120}/></label>
        </div>
        <label>Implementation priority<select value={config.priority} onChange={event => update({ priority: event.target.value as ActionPackConfig["priority"] })}>
          <option value="exploring">Exploring options</option><option value="next">Next planned pilot</option><option value="urgent">Urgent review</option>
        </select></label>
        <fieldset className="action-pack-provider-fieldset"><legend>Providers already in your stack</legend><p>These are named in the blueprint. Selecting one confirms only that you use it; connection support is assessed separately.</p>
          <div className="action-pack-provider-list">{named.map(provider => <label key={provider.id}><input type="checkbox" checked={config.selectedProviderIds.includes(provider.id)} onChange={event => select(provider.id, event.target.checked)}/><span>{provider.name}</span></label>)}</div>
          <details><summary>Add another Marketplace provider</summary><label className="action-pack-provider-search">Search the full catalog<input type="search" value={providerQuery} onChange={event => setProviderQuery(event.target.value)} placeholder="Find a provider"/></label><div className="action-pack-provider-list action-pack-provider-scroll">{other.map(provider => <label key={provider.id}><input type="checkbox" checked={config.selectedProviderIds.includes(provider.id)} onChange={event => select(provider.id, event.target.checked)}/><span>{provider.name}</span></label>)}{other.length === 0 && <p>No providers match that search.</p>}</div></details>
        </fieldset>
        <label>Setup assumptions<textarea rows={3} value={config.assumptions} onChange={event => update({ assumptions: event.target.value })} placeholder="Access, timing or service prerequisites to verify" maxLength={1200}/></label>
        <label>Additional requirements or notes<textarea rows={3} value={config.notes} onChange={event => update({ notes: event.target.value })} placeholder="Decisions for your owner or reviewer" maxLength={1200}/></label>
        <p className="action-pack-safety">Use roles and secure document references. Do not enter passwords, borrower financial details or document contents.</p>
      </form>
      <div className="action-pack-preview">
        <div className="action-pack-preview-head"><div><span className="eyebrow">LIVE PREVIEW</span><h3>{pack.title}</h3></div><span className="action-pack-priority">{pack.priority}</span></div>
        <div className="action-pack-preview-body">
          <p className="action-pack-objective">{pack.objective}</p>
          <dl className="action-pack-facts"><div><dt>Expected outcome</dt><dd>{pack.expectedOutcome}</dd></div><div><dt>Owner</dt><dd>{pack.owner}</dd></div><div><dt>Reviewer</dt><dd>{pack.reviewer}</dd></div></dl>
          <div className="action-pack-preview-block"><h4>Stack coverage</h4><p><b>{pack.matchedProviders.length}</b> named {pack.matchedProviders.length === 1 ? "provider" : "providers"} selected · <b>{pack.missingProviders.length}</b> missing from your selection</p>
            <div className="action-pack-pills">{pack.matchedProviders.map(provider => <span key={provider.id} className="is-selected">{provider.name} ✓</span>)}{pack.missingProviders.map(provider => <Link href={`/providers/${provider.slug}`} key={provider.id}>{provider.name} ↗</Link>)}</div>
            {pack.otherStackProviders.length > 0 && <p className="fine-print">Other selected providers: {pack.otherStackProviders.map(provider => provider.name).join(", ")}. No blueprint connection is claimed.</p>}
            <p className="fine-print">Required services still to confirm: {pack.requiredServicesToConfirm.join("; ")}.</p>
          </div>
          <div className="action-pack-preview-block"><h4>Implementation checklist</h4><ol>{pack.implementationSteps.map((step, index) => <li key={index}>{step}</li>)}</ol><h4>Workflow sequence</h4><ol>{pack.workflowSteps.map((step, index) => <li key={index}><b>{step.label}:</b> {step.detail}</li>)}</ol></div>
          <div className="action-pack-preview-block"><h4>Input → output</h4><p><b>Inputs:</b> {pack.inputs.join("; ")}</p><p><b>Outputs:</b> {pack.outputs.join("; ")}</p></div>
          <div className="action-pack-preview-block"><h4>Human review</h4><p>{pack.humanReview}</p></div>
          <div className="action-pack-preview-block"><h4>Failure and maintenance</h4><p><b>If it fails:</b> {pack.failureNotes}</p><p><b>Keep current:</b> {pack.maintenanceNotes}</p></div>
          <div className="action-pack-preview-block"><h4>Pilot validation</h4><ul>{pack.pilotChecks.map(check => <li key={check}>{check}</li>)}</ul></div>
          <div className="action-pack-preview-block"><h4>Relevant links</h4><div className="action-pack-pills">{[...pack.matchedProviders,...pack.missingProviders].map(provider=><Link key={provider.id} href={`/providers/${provider.slug}`}>{provider.name} profile ↗</Link>)}{pack.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</div></div>
          {(pack.assumptions || pack.notes) && <div className="action-pack-preview-block"><h4>Your additions</h4>{pack.assumptions && <p><b>Assumptions:</b> {pack.assumptions}</p>}{pack.notes && <p><b>Notes:</b> {pack.notes}</p>}</div>}
        </div>
        <div className="action-pack-actions"><button type="button" className="button button-orange" onClick={copy}>Copy action pack ↗</button><button type="button" className="button button-lime" onClick={download}>Download Markdown ↓</button><button type="button" className="text-button" onClick={reset}>Reset to blueprint defaults</button></div>
        <p className="action-pack-status" role="status" aria-live="polite">{message}</p>
      </div>
    </div>
  </section>;
}
