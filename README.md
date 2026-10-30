# Distilled Marketplace

A local, noindex Next.js Marketplace and Directory for business service discovery. The directory at `/directory` is a view of the same catalog. It publishes 16 service areas, four collections and 154 owner-approved provider listings. Listings are not independent certification or endorsement. Fifty-two records retain saved referral URLs as their exact primary destination; the other 102 use company websites. Offers remain empty, and fictional comparison fixtures remain separate from provider records.

## Run locally

Requires Node 22 or newer.

```bash
npm install
npm run generate
npm run check
npm run dev
```

Open `http://127.0.0.1:3000`. For production server checks after `npm run build`, run `npm start` in one terminal and `npm run audit:routes` in another. The audit expects `http://127.0.0.1:3000` unless `BASE_URL` is set.

## Content and routes

- Edit [`data/marketplace/catalog.json`](data/marketplace/catalog.json) for editorial categories, collections, provider records, offers, comparisons and cross-property links. The editorial taxonomy originates in `_reference/MARKETPLACE-CATEGORIES.json`.
- Run `npm run generate` after an edit. Generated routes, relationships and `CANONICAL-SITEMAP.txt` are derived; do not edit them by hand.
- Run `npm run validate` to check schema, references, dates, provenance rules and noindex guard.
- Demo comparison data lives in [`data/fixtures/demo-providers.json`](data/fixtures/demo-providers.json). It is fictional and has no external destinations or profile routes.

Architecture and operational details: [Architecture](docs/ARCHITECTURE.md), [Content model](docs/CONTENT-MODEL.md), [Route map](docs/ROUTE-MAP.md), [Editorial and affiliate policy](docs/EDITORIAL-AND-AFFILIATE-POLICY.md), [Provider import contract](docs/PROVIDER-IMPORT-CONTRACT.md), [Provider integration plan](docs/PROVIDER-INTEGRATION-PLAN.md), [Deployment](docs/DEPLOYMENT.md), [Wix migration](docs/WIX-SERVICES-MIGRATION.md), [Build report](BUILD-REPORT.md).

The v3 importer projects the owner-approved `_reference/provider-intake-v3/` inventory into the single canonical catalog. Run `npm run providers:import` after changing the source, then `npm run generate`. Optional link and evidence checks do not gate basic listings. See [Provider intake v3](docs/PROVIDER-INTAKE-V3.md), [Publication workflow](docs/PROVIDER-PUBLICATION-WORKFLOW.md), and [Affiliate link priority](docs/AFFILIATE-LINK-PRIORITY.md).

## Boundaries

Marketplace owns discovery, category guidance, provider profiles, comparisons, collections and relationship disclosure. Funding owns capital product education; Solutions owns outcome journeys; Industries owns sector guides; Tools and Acquire retain their own workflows; Wix retains the existing blog, community and `/services` page until an approved migration. See the architecture and migration notes for verified destinations and unresolved data gaps.
