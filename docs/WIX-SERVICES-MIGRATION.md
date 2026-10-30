# Wix `/services` migration plan

The existing public `https://www.distilledfunding.com/services` page currently shows high-level categories, navigation and a form. The snapshot in `_reference/LEGACY-WIX-SERVICES.md` is a baseline of page structure, not a provider inventory or proof of affiliate relationships. Wix continues to own its blog, community and established URLs.

## Proposed handoff

1. Inventory the actual Wix `/services` routes, inbound links, forms and analytics before any change. Capture exact URLs and current behavior.
2. Approve a preview of this Marketplace with source-backed provider records and working links. Confirm category language with stakeholders; the supplied 16-category taxonomy is proposed, not an approved commercial inventory.
3. Add a clear editorial link from the Wix page to the approved Marketplace destination when a live destination exists. Preserve the Wix page and form through a measured transition.
4. Only after destination validation and an explicit migration decision, consider redirects for exact legacy URLs. Map each source URL to a relevant destination, preserve query behavior where appropriate, and test for loops and 404s.
5. Monitor real traffic and form continuity before changing or retiring legacy content.

No redirect, Wix edit, domain connection or DNS work was performed in this local build.
