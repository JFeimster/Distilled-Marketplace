# Distilled Marketplace

A local, noindex Next.js Marketplace and Directory for business service discovery. The directory at `/directory` is a view of the same catalog. It currently publishes 16 editorial service areas and four practical collections. There are **zero verified provider profiles, affiliate links, offers or production comparisons**. An optional, visibly fictional comparison fixture demonstrates the interface without being presented as production data.

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

Architecture and operational details: [Architecture](docs/ARCHITECTURE.md), [Content model](docs/CONTENT-MODEL.md), [Route map](docs/ROUTE-MAP.md), [Editorial and affiliate policy](docs/EDITORIAL-AND-AFFILIATE-POLICY.md), [Deployment](docs/DEPLOYMENT.md), [Wix migration](docs/WIX-SERVICES-MIGRATION.md), [Build report](BUILD-REPORT.md).

## Boundaries

Marketplace owns discovery, category guidance, provider profiles, comparisons, collections and relationship disclosure. Funding owns capital product education; Solutions owns outcome journeys; Industries owns sector guides; Tools and Acquire retain their own workflows; Wix retains the existing blog, community and `/services` page until an approved migration. See the architecture and migration notes for verified destinations and unresolved data gaps.
