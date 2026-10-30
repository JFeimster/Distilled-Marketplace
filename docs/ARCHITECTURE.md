# Architecture

## Visual and interaction thesis

**Visual:** a paper-and-ink operator exchange with a single schematic service map, orange action signals and lime functional surfaces. It shares the sibling palette and Barlow Condensed / DM Sans typography while using an exchange-map motif specific to service discovery.

**Content sequence:** search or browse a need → see the service-area decision question → build a category stack → compare sourced providers when available → follow a clearly disclosed destination.

**Interaction:** the hero search lands in shareable directory state; category rows and collection sequences reveal practical handoffs; the stack finder computes transparent category suggestions locally. The optional comparison demo is deliberately separate from production records.

## System

Next.js App Router and TypeScript render category, collection and policy content on the server. Zod parses the JSON catalog; generation writes a route contract and relationship manifest. Small client components handle navigation, directory filtering, stack selection and comparison fixture selection. No database, CMS, third-party analytics transport or redirect service is required.

`lib/config.ts` centralizes the current origin. It resolves to a supplied `NEXT_PUBLIC_SITE_URL`, a Vercel preview host, or local HTTP. `marketplace.distilledfunding.com` is a future host only. All pages have noindex metadata and an `X-Robots-Tag`; the sitemap is empty. The staging gate is fixed in code and must be reviewed as a release change.

The `_reference/` subtree is Git ignored and excluded from TypeScript, ESLint and the production app. It supplied conventions, not runtime dependencies.

## Ownership

Marketplace owns service discovery and comparisons. Funding owns financing products and eligibility education. Solutions owns business problems. Industries owns vertical journeys. Tools owns standalone utilities; Acquire owns acquisition workflows; Wix retains blog, community and existing services URLs. Cross-property links use preview URLs observed in local sibling source references, with status recorded in the catalog; the future production host is not used as a destination.

## Boundaries and gaps

The provided Wix baseline proves menu and category labels only. It does not establish commercial relationships, provider features, live terms or offers. The live catalog therefore has zero provider records. The production profile renderer exists but has no generated profile routes. `/deals` and `/compare` are substantive empty and method states; the comparison demo is synthetic and cannot be mistaken for a provider page.
