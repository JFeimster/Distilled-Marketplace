# Content model and generation

`data/marketplace/catalog.json` is the only editable editorial catalog. Zod definitions in `schemas/catalog.ts` validate these normalized entities:

| Entity | Purpose | Published now |
| --- | --- | ---: |
| Category | Operating need, decision question, cautions, facets and related areas | 16 |
| Collection | Ordered category sequence for a use case | 4 |
| Provider | Dated, sourced identity, capabilities, limitations, terms and destination | 0 |
| Offer | Dated, source-backed terms and destination | 0 |
| Comparison | Same-category, sourced provider set | 0 |
| Cross-property link | Verified existing preview/public destination | 4 |

Categories and collections are editorial guidance, not verified vendor claims. `data/fixtures/demo-providers.json` is a separate nonproduction comparison fixture. It is never emitted as a provider route or linked to a vendor.

## Adding a provider

Use [the blank sample record](PROVIDER-RECORD-TEMPLATE.json) as a shape checklist, and follow the [provider import contract](PROVIDER-IMPORT-CONTRACT.md). Confirm legal identity, homepage, exact public sources, supported facts, capabilities, limitations, coverage, pricing model, destination, relationship status and review date. The catalog validator rejects missing required fields, unknown category relations and unsupported documented-affiliate status. The editorial reviewer must still check source accuracy: a schema cannot establish truth. The plan for reconciling existing sources is in [Provider integration plan](PROVIDER-INTEGRATION-PLAN.md).

## Generated artifacts

`npm run generate` runs `scripts/generate.ts`, validates the catalog and writes `data/marketplace/generated/routes.json`, `relationships.json` and `CANONICAL-SITEMAP.txt`. `npm run validate` verifies those outputs remain synchronized, checks relations, duplicates, pricing provenance, provider verification within 180 days, offer verification within 30 days, offer dates, URL form and the staging indexing gate. `npm run check` runs generation, validation, lint, typecheck, tests and build. `npm run audit:routes` requires a running production server and checks every manifest route, local links, noindex signals, empty sitemap and unknown-route 404.

When adding a verified provider, also review the page itself for substantive, sourced detail and confirm any new category relationship. Do not create a thin page simply to increase route count.
