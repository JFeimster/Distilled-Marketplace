# Provider inventory integration plan

**Research checked:** 2026-10-30. This is a source and ownership plan, not a provider approval list. The public Marketplace catalog remains at zero providers, offers and comparisons.

## Existing sources and what they establish

| Priority | Existing source | Useful for | Does not establish |
| --- | --- | --- | --- |
| 0 | Moonshine's executed partner agreements and approved affiliate-platform records (authoritative internal source; inventory location/access still needs confirmation) | Active relationship, allowed service/product, exact approved link, territory, restrictions, compensation terms and end date | Public product capabilities or customer outcomes unless separately sourced |
| 1 | [Wix Services page](https://www.distilledfunding.com/services) and its Services navigation | Current public category labels; a page-level statement that Moonshine partners with business products and seeks discounts | Named providers, active agreements, current discounts, actual price/terms, capabilities or availability. The live page's broad statement is not a provider row |
| 1 | [Moonshine partner page](https://www.distilledfunding.com/partners) | Moonshine's public affiliate/referral recruitment offer and descriptions of its own partner program | Third-party provider affiliation. This is Moonshine recruiting affiliates; it is not an inventory of outside providers |
| 2 | Wix editorial pages carrying affiliate disclosures, including [7 Figures Funding review](https://www.distilledfunding.com/post/7-figures-funding-review) and [Ramp Card review](https://www.distilledfunding.com/post/ramp-card-review) | Candidate provider/service names, page-specific disclosure and outbound links to reconcile | An active agreement today, current exact link approval, current product terms, or Marketplace ownership |
| 2 | [Funding partner-program article](https://www.distilledfunding.com/post/financing-provider-partner-programs) and [earlier affiliate-program article](https://www.distilledfunding.com/post/ready-to-rake-in-cash-uncover-the-secrets-of-business-loan-affiliate-programs) | Research leads for financing partner programs and the existing editorial disclosure approach | The company's active relationship with every named program, current commissions, or Marketplace-owned service profiles. Financing content belongs to Funding |
| 3 | `_reference/funding-distilled/lib/funding/registries.ts` | Existing adapter seam and a potential future read-only handoff | A live provider inventory: the checked-in adapter is explicitly unavailable and returns an empty product list |
| 3 | Distilled Solutions and Industries references | Taxonomy/context and canonical property handoffs | Affiliate status, vendor relationships or Marketplace provider inventory |

The public service page and affiliate articles are leads. Reconcile each candidate with current internal approval and official provider sources before publication. Public programs and article claims can change; keep their date and source attached to each fact.

## Priority work

### P0 — locate the authoritative relationship source

Ask the business owner to identify the existing affiliate platform/export, executed agreements and any approved link roster. Read only provider/service metadata needed for review; do not copy borrower/client records or credentials. Preserve its existing data ownership and access controls. If no authoritative record exists for a candidate, keep the relationship unresolved and do not publish a commissioned destination.

### P1 — reconcile services already presented on Wix

Review the public Services page and its exact menu targets for Banking & Budgeting, BankLink Concierge, Business Capital, Credit Monitoring, Credit Repair, Investing, Payment Processing, Productivity and Real Estate. Capture each current destination and service owner, then map only the actual need to the proposed Marketplace taxonomy. The public labels alone do not create provider profiles.

For each named service lead, identify the responsible product owner, official provider, current service description, terms, coverage, any current agreement and the correct canonical property. Treat BankLink Concierge as an internally named service until its provider, data flow and scope are confirmed. Treat Investing as out of Marketplace v1 until its product, suitability and compliance owner are clear. Route Business Capital and financing products to Funding; route acquisition-related tools to Acquire.

### P2 — reconcile disclosed Wix editorial links

Inventory only the existing Wix articles with a visible affiliate disclosure or a provider-specific outbound link. Match each URL to the approved internal affiliate record, note the article's disclosure text/date, and compare the current provider homepage, product terms and permitted claims. A disclosure in an old article is not proof of an active agreement. Begin with existing service/product content because it has a known editorial owner and current audience; publish a Marketplace provider profile only if it adds category-level discovery without duplicating the canonical Funding or Wix article.

### P3 — qualify external partner-program research

Use public partner-program articles as a backlog of candidates, not as a vetted inventory. Confirm the official program page, whether the program currently accepts partners, required approval, payout trigger and restrictions directly with the provider. Financing programs remain Funding-owned. Add non-financing providers only where a real service category, business-owner need and approved relationship exist.

### P4 — expand beyond existing relationships

For categories without a current service or affiliate source, use the provider's official documentation and public terms for factual profile details. A public provider profile may be non-affiliate, but it still needs the same identity, evidence, fit, limitation and destination review. Do not add every vendor in a category to fill the taxonomy.

## Field and review requirements

For every candidate, verify legal/brand identity, exact service, primary and secondary category, audience/use case, capabilities, limitations, coverage, pricing model and public price source (if claimed), integration evidence, official homepage, exact outbound destination, affiliate status, terms, review date, disclosure and canonical route owner. Map sources to each claim. Record the private agreement reference and approval metadata in the existing access-controlled system, not the public catalog. A second human reviewer should approve financing claims, pricing, promotions, material commercial relationships and regulated/professional services.

An affiliate link must come from the approved account/agreement; validate HTTPS and its exact resolved domain/path, verify attribution behavior without exposing personal data, and use `rel="sponsored noopener noreferrer"`. No open redirect or arbitrary URL parameter forwarding. Offer terms require a current primary source, start/end dates and a recheck within 30 days. Provider facts recheck within 180 days. The exact current policy is in [Editorial and affiliate policy](EDITORIAL-AND-AFFILIATE-POLICY.md); the publication shape and gaps are in [Provider import contract](PROVIDER-IMPORT-CONTRACT.md).

## Canonical ownership boundaries

| Property | Owns | Marketplace handoff |
| --- | --- | --- |
| Marketplace | Multi-category service discovery, reviewed provider profiles, comparisons, collections and commercial disclosure | Own the category/service profile and only the approved outbound referral |
| Funding | Lending/capital product education, financing terms and eligibility preparation | Link to Funding for product and qualification detail; do not duplicate lending product pages |
| Solutions | Business problems and desired operating outcomes | Link to an appropriate outcome path when useful; do not turn it into a provider catalog |
| Industries | Sector guides and operator context | Link to vertical context, not duplicated industry pages |
| Tools | Calculators and diagnostics | Link to existing utilities; do not embed a duplicate calculator |
| Acquire | Buying/selling business and transaction workflows | Route acquisition services and workflows to Acquire |
| Wix | Existing blog, community, groups, courses, bookings, membership and forms | Preserve `/services` and existing content until an approved migration; no redirects are part of this plan |

## Current inventory gap

The source material checked into this repository contains no authoritative provider/affiliate catalog. The live Wix Services page has categories and broad partnership/discount copy but no named vendor inventory. The public partner page is Moonshine's own affiliate opportunity. Existing financing partner articles are editorial research and belong to Funding. The checked-in Funding registry adapter is unavailable and empty. Therefore the source integration begins with a controlled internal agreement/link audit; it cannot be completed from the current public pages alone.
