import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import raw from "../data/marketplace/catalog.json";
import { validateCatalog } from "../lib/validate";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { catalog, errors } = validateCatalog(raw);
const expected = ["/", "/directory", "/categories", "/compare", "/collections", "/deals", "/about", "/disclosures", "/submit", "/workflows", "/integrations", "/compatibility", "/playbooks", ...catalog.categories.map(x => `/categories/${x.id}`), ...catalog.collections.map(x => `/collections/${x.id}`), ...catalog.providers.filter(x => x.status === "published").map(x => `/providers/${x.slug}`), ...catalog.workflowBlueprints.filter(x => x.status === "published").map(x => `/workflows/${x.slug}`), ...new Set(catalog.workflowBlueprints.filter(x => x.status === "published").flatMap(x => x.industryTags).map(tag => `/playbooks/${tag}`)), ...catalog.comparisons.map(x => `/compare/${x.id}`)];
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data", "marketplace", "generated", "routes.json"), "utf8"));
if (JSON.stringify(manifest) !== JSON.stringify(expected)) errors.push("Generated routes are stale; run npm run generate");
if (fs.readFileSync(path.join(root, "CANONICAL-SITEMAP.txt"), "utf8") !== `${expected.join("\n")}\n`) errors.push("CANONICAL-SITEMAP.txt is stale");
if (process.env.ALLOW_INDEXING === "true") errors.push("Indexing cannot be enabled in staging");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${expected.length} routes, ${catalog.categories.length} categories, ${catalog.collections.length} collections, ${catalog.providers.length} providers, ${catalog.workflowBlueprints.length} workflows, ${catalog.offers.length} offers. Indexing disabled.`);
