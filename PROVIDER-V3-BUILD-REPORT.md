# Provider v3 catalog activation report

**Date:** 2026-10-30
**Scope:** Local Marketplace checkout. No commit, push, deployment, indexing change, or external-system write was made.

## Publication result

- Owner-approved source candidates: **154**.
- Published in `data/marketplace/catalog.json`: **154**; individually excluded for identity, URL, or category conflict: **0**.
- Saved referral primary URLs preserved exactly: **52 of 52** in `primaryUrl`, `affiliateUrl`, and each primary `links[]` record.
- Company website primary URLs preserved: **102 of 102**; `affiliateUrl` remains `null` on these records.
- Generated provider profile routes: **154**. Generated canonical routes: **183 total** (154 provider, 16 category, four collection, plus existing routes).
- Import dry-run reported no provider exceptions. No referral parameters were added or rewritten.
- All 154 destination-health fields remain `not_tested`; this records the absence of live redirect testing and is not a publication gate or claim of verified attribution.

The intake approval fields now reflect owner authorization for directory listing and saved destination use. Provenance, unknowns, historical relationship states and supplied verification dates remain intact. Owner approval is not presented as independent certification or proof of a current affiliate account.

## Public experience and safeguards

The existing directory now renders provider listings with category, short description, capabilities when supplied, primary-destination disclosure, profile link and outbound CTA. Users can search provider name, service and capability; filter by category, service group, capability, audience, stage and saved-referral versus company-website primary; and sort by name or category group. Category pages show their provider listings. Profiles conditionally render available features, audiences, how-it-works steps, pricing model, secondary resources, FAQs and related providers. Comparison and stack-finder integrations use the same catalog.

The primary CTA uses the saved URL and `rel="sponsored noopener noreferrer"` for saved referral links. The disclosure states that current attribution is not confirmed. Non-affiliate links use `rel="noopener noreferrer"`. Public output does not include internal account/network identifiers or payout observations. Numeric commission-rate language is omitted from the public provider summary; no commission or customer price was created.

Global `noindex, nofollow`, `X-Robots-Tag`, robots restrictions and the empty sitemap are preserved. Directory publication did not enable indexing.

## Optional content and remaining enrichment

The public profiles use source inventory content where available and category-based neutral fallback text when a short description is absent. In the resulting catalog: **62** listings use that fallback; **118** have no logo; **81** have no feature entries; **148** have no how-it-works section, FAQ, or public source citation; **152** have no pricing source. Optional amounts and incomplete fields are omitted. Missing content does not prevent a basic listing.

Remaining improvements are optional: check saved destinations and current attribution, add current official-source citations, improve descriptions/features, and add logos, pricing links or FAQs where evidence supports them. Historical relationship evidence has not been converted to a current membership claim.

## Validation results

- `npm run providers:import`: passed; **154** imported, **52** referrals preserved, **102** company sites, **0** provider exceptions.
- `npm run check`: passed: generate, catalog validation, ESLint with zero warnings allowed, TypeScript, **7/7 tests**, and production build.
- Build generated all **154** provider routes. The public XML sitemap remains empty; the separate generated canonical route manifest contains all 183 local routes.
- Production HTTP smoke checks: `/directory`, `/categories/ai-automation`, `/providers/browseai` and `/` returned **200** with `X-Robots-Tag: noindex, nofollow`. The referral profile rendered the sponsored rel attribute. `/sitemap.xml` returned an empty `<urlset>` with noindex header.
- Source-to-catalog integrity check: **52/52** exact referral matches and **102/102** exact company website matches; owner approval fields present on all 154 source records.
- `git diff --check`: passed; Git emitted Windows LF-to-CRLF working-copy notices only.

No individual provider records were excluded. Live destination redirects, affiliate attribution and current product facts remain untested or unconfirmed where corresponding evidence was not present.
