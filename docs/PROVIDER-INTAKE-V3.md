# Provider intake v3

The private candidate JSON is the intake source; `data/marketplace/catalog.json` remains the single publication catalog. The owner approved all 154 v3 candidates for ordinary directory listing and saved destination use. Approval does not assert that optional product facts or current affiliate attribution have been independently verified.

## Import

```powershell
npm run providers:import -- --dry-run
npm run providers:import
npm run generate
```

The importer validates candidates independently and reports the projected count, preserved referral count, company-site count and record exceptions. `--dry-run` emits this report without changing the catalog. Without that flag it projects valid owner-approved records into the catalog. It is idempotent by provider ID. A malformed or conflicting candidate is reported individually; it does not block other candidates. The normal build does not require the private `_reference/` source files.

The intake retains original candidates, source references, historical relationships, unknowns and maintenance metadata. The public projection contains the minimum listing fields and optional safe content. It excludes private relationship/payment details and never creates commission or pricing claims.

## Current source inventory

- 154 candidates are owner-approved for directory publication.
- 52 have saved referral URLs; the exact URL is retained as `affiliateUrl`, `primaryUrl` and the primary typed link.
- 102 use company websites and keep `affiliateUrl: null`.
- Link health and verification dates remain optional and are not publication gates.
- Saved tracking links retain their original parameters. The importer adds no parameters and does not substitute a homepage.

The local input can be checked with the supplied Python validator. Publication output is validated by the existing Zod catalog and `npm run validate`.
