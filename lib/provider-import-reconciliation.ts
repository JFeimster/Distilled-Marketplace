import type { Provider } from "@/schemas/catalog";

export type ReconciliationConflict = { providerId: string; field: string; canonical: unknown; incoming: unknown };
export type ReconciliationResult = { provider: Provider; conflicts: ReconciliationConflict[] };

const primaryFields = new Set(["primaryUrl", "affiliateUrl", "linkType", "links"]);
const identityFields = new Set(["id", "slug"]);
const categoryFields = new Set(["primaryCategoryId", "categoryIds"]);

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeArray(current: unknown[], incoming: unknown[]) {
  const values = new Map<string, unknown>();
  for (const value of [...current, ...incoming]) values.set(JSON.stringify(value), value);
  return [...values.values()];
}

function mergeFeatures(current: unknown[], incoming: unknown[]) {
  const result = new Map<string, Record<string, unknown>>();
  for (const value of current) {
    if (value && typeof value === "object" && "name" in value) {
      const feature = value as Record<string, unknown>;
      const key = String(feature.name).toLocaleLowerCase();
      const previous = result.get(key);
      if (!previous) result.set(key, feature);
      else result.set(key, { ...feature, ...previous, sources: mergeArray(Array.isArray(previous.sources) ? previous.sources : [], Array.isArray(feature.sources) ? feature.sources : []) });
    }
  }
  for (const value of incoming) {
    if (!value || typeof value !== "object" || !("name" in value)) continue;
    const feature = value as Record<string, unknown>;
    const key = String(feature.name).toLocaleLowerCase();
    const previous = result.get(key);
    if (!previous) {
      result.set(key, feature);
      continue;
    }
    const sources = mergeArray(Array.isArray(previous.sources) ? previous.sources : [], Array.isArray(feature.sources) ? feature.sources : []);
    result.set(key, { ...feature, ...previous, sources });
  }
  return [...result.values()];
}

/** Merge an approved source record without erasing canonical editorial work.
 * Divergent source facts are kept on the canonical record and reported for review.
 */
export function reconcileProvider(existing: Provider, incoming: Provider, allowPrimaryReplacement = false, approvedSourceFields = new Set<string>()): ReconciliationResult {
  const conflicts: ReconciliationConflict[] = [];
  const merged: Record<string, unknown> = { ...existing };

  for (const [field, value] of Object.entries(incoming)) {
    const current = existing[field as keyof Provider];
    if (identityFields.has(field)) {
      if (!sameValue(current, value)) conflicts.push({ providerId: existing.id, field, canonical: current, incoming: value });
      continue;
    }
    if (categoryFields.has(field)) {
      if (approvedSourceFields.has(field)) merged[field] = value;
      else if (!sameValue(current, value)) conflicts.push({ providerId: existing.id, field, canonical: current, incoming: value });
      continue;
    }
    if (primaryFields.has(field) && !allowPrimaryReplacement) {
      if (!sameValue(current, value)) conflicts.push({ providerId: existing.id, field, canonical: "[redacted]", incoming: "[redacted]" });
      continue;
    }
    if (primaryFields.has(field) && allowPrimaryReplacement) {
      merged[field] = value;
      continue;
    }
    if (approvedSourceFields.has(field) && !primaryFields.has(field) && !identityFields.has(field) && !categoryFields.has(field)) {
      merged[field] = value;
      continue;
    }
    if (current === undefined || current === null || current === "") {
      merged[field] = value;
    } else if (Array.isArray(current) && Array.isArray(value)) {
      merged[field] = field === "features" ? mergeFeatures(current, value) : mergeArray(current, value);
    } else if (!sameValue(current, value)) {
      conflicts.push({ providerId: existing.id, field, canonical: current, incoming: value });
    }
  }

  return { provider: merged as Provider, conflicts };
}

export function reconcileProviderCatalog(existing: Provider[], incoming: Provider[], primaryReplacementIds = new Set<string>(), sourceFieldOverrides = new Map<string, Set<string>>()) {
  const byId = new Map<string, Provider>();
  const byName = new Map<string, Provider>();
  const conflicts: ReconciliationConflict[] = [];
  const nameKey = (name: string) => name.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  for (const provider of existing) {
    if (byId.has(provider.id)) throw new Error(`Duplicate canonical provider ID: ${provider.id}`);
    byId.set(provider.id, provider);
    const key = nameKey(provider.name);
    if (byName.has(key)) throw new Error(`Duplicate canonical provider name: ${provider.name}`);
    byName.set(key, provider);
  }
  for (const provider of incoming) {
    const current = byId.get(provider.id);
    if (!current) {
      byId.set(provider.id, provider);
      const sameName = byName.get(nameKey(provider.name));
      if (sameName) {
        byId.delete(provider.id);
        conflicts.push({ providerId: provider.id, field: "possible_name_alias", canonical: sameName.id, incoming: provider.id });
      } else {
        byName.set(nameKey(provider.name), provider);
      }
      continue;
    }
    const result = reconcileProvider(current, provider, primaryReplacementIds.has(provider.id), sourceFieldOverrides.get(provider.id));
    byId.set(provider.id, result.provider);
    byName.set(nameKey(result.provider.name), result.provider);
    conflicts.push(...result.conflicts);
  }
  return { providers: [...byId.values()], conflicts };
}
