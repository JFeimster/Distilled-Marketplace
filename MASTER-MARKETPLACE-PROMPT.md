# DISTILLED MARKETPLACE + DIRECTORY — MASTER AUTONOMOUS CODEX BUILD PROMPT

## Mission and execution boundary
Build a complete, production-buildable, **noindex** Next.js marketplace and business-service directory in the current `distilled-marketplace` workspace. This is the fourth sibling site in the Distilled Funding network. It should visibly belong to the same design system as Funding, Solutions, and Industries, but have its own distinctive **service-discovery / comparison / operator-stack** UX. Do not stop at a homepage, scaffold, or plan. Implement, validate, audit and report.

**Do not create GitHub repositories, push, commit, deploy, connect domains, modify Wix, install external integrations, create or alter external records, or spend paid credits.** Work only inside the local project. It is fine to install dependencies locally and run builds/tests.

## Source material and precedence (read first)
Inspect all available local sources under `_reference/`:
- `_reference/funding-distilled/` — visual shell and Funding ownership patterns.
- `_reference/distilled-solutions/` — interactive router, editorial/manifest model.
- `_reference/distilled-industries/` — finder/filter mechanics, category-driven navigation, validation, repo docs.
- `_reference/LEGACY-WIX-SERVICES.md` — public Wix services baseline, **not** a trusted provider dataset.
- `_reference/MARKETPLACE-CATEGORIES.json` — proposed taxonomy; revise only with documented rationale.
- `_reference/SOURCE-AND-OWNERSHIP.md` — verified vs proposed data and links.
Existing sources are precedents, not packages to import wholesale. Read the actual source, not just the deployment screenshots. Favor a cohesive, independent app that inherits proven visual conventions. Reference subtree is ignored by Git and excluded from production bundling.

## Locked product distinction
- **Marketplace** owns discovery, provider/service profiles, curated collections, clearly disclosed affiliate offers, comparisons, and recommendation navigation.
- **Directory** is a core view at `/directory` inside Marketplace. Do not build a second directory app or data store.
- **Funding** owns lending-product education, eligibility and capital-product routes; Marketplace may reference product categories and providers without duplicating full product education or promising approval.
- **Solutions** owns business problems and desired outcomes.
- **Industries** owns sector-specific user journeys.
- **Tools** owns standalone calculators and utilities.
- **Acquire** owns acquisition workflows.
- **Wix** currently owns its blog and community features. Preserve its established URLs. No CMS replacement.

**Future proposed host:** `https://marketplace.distilledfunding.com` (not connected or authorized). Site should work locally and later at a `*.vercel.app` preview. Keep all pages noindex by default and site-level indexing disabled. Production-host canonical handling must be centralized and preview-safe; do not emit a live canonical URL that implies an attached domain without making deployment-aware preview metadata explicit. Do not hardcode redirects to nonexistent subdomains. No hostname/DNS change.

## Target user and value
Serve SMB owners, independent founders, freelancers, brokers and operators evaluating services that help run, fund, automate, grow and protect businesses. User intent patterns: 'find a service', 'compare options', 'see alternatives', 'build a stack for my business', 'understand costs and tradeoffs', 'click through to verified external provider'. Be transparent about affiliate relationships and verification status. Provide functional discovery and decision utility rather than a static logo wall.

## Core site structure
Build these coherent route families, adapting when UX/data requirements demand it:
```
/                              discovery homepage and operator stack finder
/directory                     faceted searchable directory
/categories                    categories index
/categories/[slug]             category hubs, actual verified content only
/providers/[slug]              verified provider profiles; avoid a thin page per unverified brand
/compare                       interactive side-by-side comparison workspace
/compare/[slug]                curated comparison page only when supported by real source data
/collections                   curated collections index
/collections/[slug]            practical bundles/stacks for use cases
/alternatives/[slug]           alternatives pages only when quality/evidence thresholds met
/deals                         dated offers, only if documented; otherwise no fabricated discounts
/about                         marketplace editorial and affiliate methodology
/disclosures                   affiliate disclosures and independence statement
```
Optional `/reviews/[slug]` ONLY when genuinely supported by reviewed product-specific evaluation; never fabricate first-hand testing or customer reviews. `/submit` should be informational and not pretend to accept submissions without a real backend. Do not generate dozens of empty routes. Plan provider/profile and route count from actual sourced catalog data, not arbitrary numerical targets.

## Taxonomy and filtering
Proposed major categories (source JSON provided): Accounting & Bookkeeping; AI & Automation; Banking & Neobanking; Budgeting & FinanceOps; Business Credit; CRM & Sales; E-commerce; Financing; HR & Payroll; Insurance & Benefits; Legal & Compliance; Marketing & SEO; Payments & POS; Productivity; Real Estate Services; Social Media & Content. Normalize names and nonoverlapping slugs; permit multiple taxonomy tags per provider, with one primary category and clear cross-links. Structured facet keys: audience, company stage, pricing model (not invented exact price), capability, industry suitability, integration types, evidence status, offer type and verification date. No fake ratings/scores.

## Data architecture / source of truth
**Use a structured catalog as sole editorial source of truth**, not multiple overlapping JSON registries. Prefer `data/marketplace/catalog.json` or clearly segmented files when it reduces maintenance. Generated route, navigation, relationship, index and sitemap artifacts are derived outputs. Validate via Zod/JSON schema. Provide categories, providers/services, affiliate links/offers, curated collections, verified comparisons and cross-property references as distinct normalized entities.

Provider/service fields where genuinely applicable:
- stable id, name, slug, legal/brand identity, short summary, homepage URL, primary category, tags, audience, use cases, key features, limitations, available integrations, pricing model, public pricing source (if claimed), last verified, country/service coverage, editorial status, source citations, affiliate relationship, link destination, disclaimer, CTA, review status, index status, updated/reviewed timestamps, optional assets/license provenance.
- A link must be source-backed and valid; affiliate/referral URLs may only be surfaced when supplied and verified. Do not invent referral codes, offer prices, discount percentages, commissions, availability, provider partnerships, badges, star ratings, review counts, APY/APR, FDIC claims, insurance status, eligibility or approval time.
- Distinguish verified facts, documented user-supplied business relationships, informed editorial opinions, and unresolved research.
- Do not silently equate current Wix menu categories to approved commercial partner relationships.
- If real provider records or source data are missing, create a **small explicit demo/fixture dataset** in a clearly marked nonproduction fixture file, only use it to demonstrate UX, and prevent it from rendering as verified public profiles/offers. The published catalog can start sparse. Do not fabricate vendor reviews or features.
- Never use placeholder links that make fake calls to action. Disable or label unavailable actions. Avoid duplicating existing product/CRM databases.

## Design / UX
Match established Distilled Funding siblings: cream/paper backgrounds, black ink, heavyweight condensed headings, DM Sans-like readable body, monospace micro-labels, sharp borders, orange signal color, lime and electric-blue functional accents, rigid grids, deliberate hard shadows, tight but usable layouts, purposeful hover/focus motion; high contrast and reduced-motion support. Reuse corresponding patterns and fonts observed in sibling code; not just similar colors. Distinct visual concept: **Operator Service Exchange / Business Stack Workstation**.

Homepage should include (1) striking marketplace headline and contextual global search, (2) main category grid, (3) interactive 'Find my stack' inputs based on business goal/size and needs with explainable suggested categories, (4) curated collections/featured verified services, (5) transparent how-we-evaluate methodology, (6) cross-site routes and featured tools, (7) appropriate disclosures and CTAs. Never claim personalization uses AI/underwriting if it is a deterministic router.

Directory: functional query, filters, sorting, zero-results, reset, query/shareable state when appropriate, keyboard accessibility, clear verification and affiliate labels. Profiles: what it is, intended audience, what it does, tradeoffs, suitability, integrations, pricing model with source, alternatives, related guides, transparent disclosure, external destination. Comparison: selected real provider records, apples-to-apples feature matrix, source dates, clear unknowns, responsive table and no invented rankings. Collections: outcome-centric stack recommendations with honest evidence rather than disguised paid ranking.

## SEO/AEO, editorial and indexing
Indexable-quality informational architecture but **noindex during staging**. Implement server-rendered, useful, directly answerable HTML with semantic headings, breadcrumbs, canonical policy, JSON-LD types only when factually supported (`WebSite`, `WebPage`, `BreadcrumbList`, `Organization`, optionally `ItemList` or `SoftwareApplication` if valid); no fake `Review`, `AggregateRating`, `Offer`, `FAQPage`, `FinancialProduct` claims. Implement sitemap and robots with gating; keep preview sitemap empty while noindex, based on verified pattern from sibling repos. Unique titles/meta descriptions and canonical content ownership; author/editorial policies and source timestamps. A directory entry is not a substitute for a substantial review. Preserve existing Wix blog; potential editorial `/guides` requires clear topic differentiation/ownership and is not mandatory in v1. Supply safe prelaunch indexing checklist.

## Cross-site links and attribution
Centralize all hostnames, route statuses and link targets. For sibling Vercel previews, prefer known verified URLs where relevant; future domains remain configurable/planned, never silently 404. Cross-property links to actual verified deep routes only. Give a high-quality redirect/handoff plan for the current Wix `/services` page but DO NOT implement redirects or alter Wix. Affiliate links should use proper `rel="sponsored noopener noreferrer"` for external commissioned destinations, with disclosure visible on relevant pages. Design a non-invasive client event schema for `directory_search`, `filter_change`, `provider_view`, `compare_select`, `affiliate_outbound`, `collection_open`, and `stack_finder_complete`, but don't wire unknown analytics vendors or collect sensitive profile data. External URL tracking must not create an open redirect or leak sensitive parameters.

## Concrete implementation requirements
- Next.js App Router + TypeScript; Zod and structured data, compatible with sibling architecture.
- Reusable components for header, mega menu, mobile nav, breadcrumbs, search, filters, card, disclosure, provider details, comparison table, stack finder, category/collection layouts, footer and metadata.
- Never force all routes through an undifferentiated generic page renderer; design surface families must vary appropriately.
- Mobile-friendly at 320px, 390px, tablet, desktop. No horizontal overflow. Keyboard-accessible menus and forms. Responsive comparisons.
- No broken internal links. 404 for unknown routes. Controlled empty states and errors.
- No OAuth, CMS, database, new external service, fake API or affiliate redirect server required in v1.
- Lightweight performance; no giant client-side catalog bundle if server rendering suffices.

## QA and validation
Provide `npm run validate`, `npm run check`, `npm run audit:routes` equivalent established sibling conventions. Test duplicate IDs/slugs/canonical URLs, categories, relations, missing provenance, invalid/outdated offers, malformed external URLs, disabled unknown links, indexing gates, structure and accessible behaviors. Run install, generation if applicable, validate, lint, typecheck, unit tests, production build, HTTP smoke/route audit and browser visual/touch checks if browser tooling available. Explicitly report what could not be tested. Report dependency audit without assuming zero vulnerabilities. Do not mark tests passed unless executed.

## Documentation and outputs
Required: `README.md`, `AGENTS.md`, `BUILD-REPORT.md`, `CANONICAL-SITEMAP.txt`, `docs/ARCHITECTURE.md`, `docs/CONTENT-MODEL.md`, `docs/ROUTE-MAP.md`, `docs/EDITORIAL-AND-AFFILIATE-POLICY.md`, `docs/DEPLOYMENT.md`, `docs/WIX-SERVICES-MIGRATION.md`, sample editorial record template, generator and validator documentation. Link docs rather than duplicate information.

## Execution sequence
1. Reconnaissance: inspect all references and record actual reusable patterns, current Wix limitations, and verified provider/source coverage.
2. Architecture decision: preserve effective practices, resolve routes/data/ownership; write compact rationale.
3. Catalog design: taxonomy, source-backed provider records if available, relationships, schemas, generation.
4. Implement all meaningful route families and functional directory/stack finder/comparison interactions. Use truthful empty states for unsupported offerings.
5. Design and responsive/polish; ensure visual family resemblance with Funding, Solutions, Industries.
6. SEO/indexing/disclosures/affiliate link handling and cross-property config.
7. Validation, tests, local build and HTTP/browser audit.
8. Final report: route counts, content source counts vs fixtures, areas missing real provider data, exact commands/results, warnings and preview readiness.

**Do not launch, deploy, commit, push, modify Wix, create GitHub/Vercel resources, or change DNS.** Finish the local artifact and report the next approved release steps.
