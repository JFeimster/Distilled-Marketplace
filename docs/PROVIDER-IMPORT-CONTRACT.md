# Provider import contract

## Current assessment

The fields in `schemas/catalog.ts` are a useful **public publication shape**: they require a stable identity, taxonomy, source citations, current dates, limitations, a destination and relationship status. The validator also checks category references, pricing provenance, documented-affiliate evidence labels, expired offers and freshness.

The current shape is not sufficient as an automated intake or approval record. It only permits `editorialStatus: "verified"`; `sources[].supports` is free text rather than a field-level citation map; it has no reviewer identity, approval timestamp, source snapshot/hash, partner agreement ID/status/expiry, approved campaign scope, or an explicit withdrawal status. The public `sources` array renders links, so private contract evidence must not be placed there. In addition, `lib/validate.ts` currently accepts a documented affiliate relationship only when one public source has `supports: ["affiliate relationship"]`. A private signed agreement cannot safely satisfy that rule. The schema accepts `affiliateRelationship: "none" | "documented"`, which cannot express “still being checked.”

## Required import sequence

1. **Collect a candidate from an existing authoritative source.** Use the public Wix Services page only to find service labels. Use the existing, access-controlled affiliate platform or executed agreement to establish Moonshine's relationship and exact outbound URL. The editorial source links on Wix are research leads. Do not import from a public partner-program article alone.
2. **Resolve property ownership.** Confirm the primary user need and route owner before assigning a category. Send financing-product education and eligibility to Funding; keep Marketplace responsible for cross-category service discovery and verified service profiles.
3. **Build a private evidence packet in the current source system.** Record public source URL, captured/reviewed date, claim supported, official provider identity, terms/version and destination. For a commercial relationship, reference the agreement or approved affiliate account using its internal record ID. Keep borrower, customer and partner personal data out of the packet unless an authorized process requires it.
4. **Review the record.** A human editor checks identity, category, each claim and source, current terms, relationship status, destination, disclosure text, risk restrictions and ownership. A second reviewer approves offers, financing claims, pricing, compensation claims and any regulated or professional-service claim.
5. **Publish only the reviewed record.** Copy the approved public fields into `data/marketplace/catalog.json`, set the verified status/date, run generation and validation, review the rendered page, and check the destination. Do not copy private agreement data into the public catalog.
6. **Monitor and withdraw.** Expired offers fail validation; provider records older than 180 days and offers older than 30 days also fail. Remove or refresh records when a relationship ends, a URL changes, a source is withdrawn or a claim changes. Never leave an unverified link active while waiting for review.

## Publication record fields

The blank template mirrors `providerSchema`. `sources` should include primary public pages for identity, features, limitations, coverage and public pricing as applicable; each `supports` entry names the precise claim/field. A current approved affiliate destination is entered only after it is copied from the authoritative partner source and tested. Set `pricingModel` to `unknown` when no current, source-backed pricing model exists; a claimed pricing model needs a `pricingSource`.

Keep these approval details in the existing access-controlled source of truth, not a new Marketplace database: internal relationship reference, reviewer/approver, approval date, agreement or campaign term, permitted products/territories/claims, approved URL fingerprint, and renewal/termination state. The public catalog should contain only the resulting publishable facts and public citations.

## Promotion to an import workflow

Before writing an importer, extend the data contract to represent draft/review/approved/withdrawn states, field-to-source mappings, an internal evidence reference that is never rendered, review metadata, and per-source/category ownership. Update affiliate validation so private agreement status is checked through the existing access-controlled system without requiring a public agreement URL. Enforce validation against those fields and require a successful production build and page review before public inclusion. Keep one catalog as the published content source; do not create a parallel provider database.
