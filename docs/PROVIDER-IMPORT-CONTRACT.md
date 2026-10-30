# Provider import contract

`_reference/provider-intake-v3/distilled_marketplace_candidate_intake_v3.json` is the source inventory. `data/marketplace/catalog.json` remains the only publication catalog. Run `npm run providers:import` to create sanitized, owner-approved published records in that catalog; run `npm run generate` to refresh the route manifests.

## Basic listing requirements

The importer requires a unique stable ID and slug, a name, a valid existing category, an HTTPS primary destination, an owner-approved candidate state and a consistent primary typed link. These fields are enough to publish a provider listing. Descriptions fall back to neutral category-based copy. Optional product, pricing, logo, source, feature, FAQ, and verification data remain optional.

One invalid record is isolated with an ID and reason; valid records continue to import. Malformed or unsafe primary URLs, ID/slug conflicts, category mismatches and conflicting primary link fields prevent only that record from publishing. Secondary links marked `review_only` are retained in the source inventory but omitted from public output.

## Approval and evidence states

The intake uses `review.status: "owner_approved"`, `review.publicationAuthorized: true`, `review.publiclyPublishable: true`, `review.approvalScope: "public_directory_listing_and_saved_destination"`, and root `publicationAuthorized: true`. The catalog stores `approvalStatus: "owner_approved"` and `status: "published"`.

Evidence and maintenance dates are copied only when present. A saved referral may publish with `linkHealthStatus: "not_tested"`; this does not claim the destination or attribution was freshly checked. Historical partner evidence remains historical. The importer never creates commissions, campaign IDs, tracking parameters or pricing claims.

## Destination rules

- For every saved referral, keep the exact candidate value in `affiliateUrl`, `primaryUrl`, and the primary `links[]` record. The classification is `saved_tracking_referral`.
- For other candidates, keep `affiliateUrl: null`, retain the recorded company website as `primaryUrl`, and classify it as `official_website`.
- Preserve provider pages and pricing/help destinations as secondary links when they are public candidate links. Never replace a saved primary with a homepage.
- Affiliate/referral CTAs use `rel="sponsored noopener noreferrer"`; ordinary company links use `rel="noopener noreferrer"`.

The input retains source records, review metadata, historical relationship and campaign context. The public projection includes only presentation fields, safe provider/source URLs, link classification, basic approval state, optional source-backed content and non-sensitive maintenance status. Private account details and payout observations are not copied.
