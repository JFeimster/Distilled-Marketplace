# Content model and generation

`data/marketplace/catalog.json` is the only editable editorial catalog. Zod definitions in `schemas/catalog.ts` validate these normalized entities:

| Entity | Purpose | Published now |
| --- | --- | ---: |
| Category | Operating need, decision question, cautions, facets and related areas | 16 |
| Collection | Ordered category sequence for a use case | 4 |
| Provider | Owner-approved identity, category, primary destination and available content; optional evidence and link-health metadata | 154 |
| Offer | Dated, source-backed terms and destination | 0 |
| Comparison | Same-category, sourced provider set | 0 |
| Cross-property link | Verified existing preview/public destination | 4 |

Categories and collections are editorial guidance, not verified vendor claims. `data/fixtures/demo-providers.json` is a separate nonproduction comparison fixture. It is never emitted as a provider route or linked to a vendor.

## Adding a provider

Use [the sample record](PROVIDER-RECORD-TEMPLATE.json) and [provider import contract](PROVIDER-IMPORT-CONTRACT.md). Required category IDs must exist in the canonical category list. Optional fields should be added only when available from the source records. A valid basic listing does not require a legal identity, complete profile, named reviewer or fresh verification date.

## Generated artifacts

`npm run generate` runs `scripts/generate.ts`, validates the catalog and writes `data/marketplace/generated/routes.json`, `relationships.json` and `CANONICAL-SITEMAP.txt`. `npm run validate` verifies those outputs remain synchronized, checks relations, duplicates, safe URL form and staging indexing gates. `npm run check` runs generation, validation, lint, typecheck, tests and build. `npm run audit:routes` requires a running production server and checks manifest routes, local links, noindex signals, empty sitemap and unknown-route 404.

Provider listings may publish with basic identity, category, destination and a neutral description. Optional product details, verification dates and relationship checks are stored only when supplied. Do not label a listing verified or imply current affiliate attribution unless the evidence supports that claim. The earlier source integration research is retained as reference only and is not a publication gate.
