import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import raw from "../data/marketplace/catalog.json";
import { validateCatalog } from "../lib/validate";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { catalog, errors } = validateCatalog(raw);
if (errors.length) throw new Error(errors.join("\n"));
const routes = ["/", "/directory", "/categories", "/compare", "/collections", "/deals", "/about", "/disclosures", "/submit", "/workflows", "/integrations", "/compatibility", "/playbooks", ...catalog.categories.map(x => `/categories/${x.id}`), ...catalog.collections.map(x => `/collections/${x.id}`), ...catalog.providers.filter(x => x.status === "published").map(x => `/providers/${x.slug}`), ...catalog.workflowBlueprints.filter(x => x.status === "published").map(x => `/workflows/${x.slug}`), ...new Set(catalog.workflowBlueprints.filter(x => x.status === "published").flatMap(x => x.industryTags).map(tag => `/playbooks/${tag}`)), ...catalog.comparisons.map(x => `/compare/${x.id}`)];
const derived = path.join(root, "data", "marketplace", "generated");
fs.mkdirSync(derived, { recursive: true });
fs.writeFileSync(path.join(derived, "routes.json"), `${JSON.stringify(routes, null, 2)}\n`);
fs.writeFileSync(path.join(derived, "relationships.json"), `${JSON.stringify({ categories: catalog.categories.map(x => ({ id: x.id, related: x.related })), collections: catalog.collections.map(x => ({ id: x.id, categories: x.categoryIds })) }, null, 2)}\n`);
fs.writeFileSync(path.join(root, "CANONICAL-SITEMAP.txt"), `${routes.join("\n")}\n`);
console.log(`Generated ${routes.length} canonical routes (${catalog.categories.length} categories, ${catalog.collections.length} collections, ${catalog.providers.length} providers, ${catalog.workflowBlueprints.length} workflows).`);
