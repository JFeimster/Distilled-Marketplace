# Provider publication workflow

## One catalog

`data/marketplace/catalog.json` is the only publication catalog. `_reference/provider-intake-v3/` is the preserved source inventory. Run `npm run providers:import` to project owner-approved candidates, then `npm run generate` to refresh route manifests. The importer is deterministic and idempotent by provider ID; it does not create a database or external workflow.

## Listing and maintenance states

The owner approved all 154 source candidates for ordinary directory listing. The source marks that approval with `review.status: "owner_approved"`, `review.publicationAuthorized: true`, `review.publiclyPublishable: true`, `review.approvalScope: "public_directory_listing_and_saved_destination"`, and root-level `publicationAuthorized: true`. Published catalog records carry `approvalStatus: "owner_approved"` and `status: "published"`.

Basic identity, category, valid HTTPS destination and consistent primary-link metadata are required. Optional pricing, features, sources, logo, FAQ, reviewer and fresh link checks do not gate a listing. Duplicate IDs/slugs, malformed or unsafe primary URLs, invalid categories and inconsistent primary destinations are isolated per record. A valid record can publish while `linkHealthStatus` is `not_tested`.

Keep historical relationship evidence, unknowns and verification dates as supplied. Do not represent owner approval as independent certification or as proof that an affiliate account currently attributes. If input changes, run `npm run providers:import -- --dry-run` and inspect its summary before importing and regenerating routes.

## Public output safeguards

The importer retains the original source file and writes a sanitized projection to the existing catalog. It does not expose private account details, payout data or campaign metadata. Affiliate primary URLs remain byte-for-byte identical, including existing query parameters. No tracking parameters or prices are invented. Global noindex headers, metadata and sitemap protections remain unchanged.
