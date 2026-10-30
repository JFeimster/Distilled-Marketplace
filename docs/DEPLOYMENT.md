# Deployment and prelaunch review

This checkout is a local staging artifact. No deployment, domain, DNS or Wix configuration is included. `NEXT_PUBLIC_SITE_URL` may identify a verified HTTPS preview origin; otherwise `VERCEL_URL` is used when available, then local HTTP. Canonicals follow that current origin. The future `marketplace.distilledfunding.com` host is recorded only as a proposed destination.

All routes emit noindex/nofollow metadata and `X-Robots-Tag: noindex, nofollow`. `/sitemap.xml` is empty. `/robots.txt` permits crawling so page-level directives are visible. Indexing is intentionally fixed off in this build; setting `ALLOW_INDEXING=true` fails validation. Removing the gate is a separate reviewed release task.

Before any preview or public release:

1. Review every source-backed provider and offer record against current primary sources and working destinations.
2. Verify category ownership, route content depth, canonical origin and cross-property deep links.
3. Check sponsorship labeling, paid-link `rel`, current terms, offer dates and legal/professional claims.
4. Run `npm run check`, production `npm run audit:routes`, desktop/mobile browser review and dependency audit.
5. Confirm actual authenticated integrations, if any, separately; this build has none.
6. Approve Wix handoff, domain and indexing as distinct changes. Do not turn on indexing merely because a preview works.
