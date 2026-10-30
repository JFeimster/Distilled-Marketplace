# Marketplace V4 implementation

## What changed

- The directory has a compact discovery hero, provider search, category chips, a sticky desktop filter panel, a mobile filter drawer, two or three column cards, a compact list view, comparison selection, and 12 at a time loading. Filters, view, and selection remain in the URL.
- Provider cards and profiles use customer-facing CTAs. A provider's primary action always resolves through its existing primary link, including the exact saved affiliate URL for tracked records. Affiliate actions use `rel="sponsored noopener noreferrer"`.
- Profiles now render authored features, steps, workflow and prompt templates, input and output details, audience fit, pricing, FAQs, related providers, resources, and media only when those fields have content. The fallback visual is a branded initial, not invented product imagery.
- The catalog schema accepts optional discovery, content, CTA, media, resource, and tracked secondary-link fields. The import adapter passes these fields through Zod validation. Related resources must reference an existing Marketplace route or a cataloged, verified cross-property URL.
- The 62 generic website summaries were replaced with neutral category-specific evaluation prompts. No provider capability, price, trial, integration, or offer was inferred from them.
- Public disclosure language describes possible affiliate compensation without showing campaign or link-maintenance states.

## Editorial contract

`data/marketplace/catalog.json` remains the only publication source. `serviceGroup` is derived from the primary category. `roles` and `businessStages` use authored provider values when present and otherwise inherit the category's editorial audience and stage classifications. Existing `audiences` and `stages` remain valid. `categoryIds` beyond the primary category require approved membership in the intake review record. Optional fields may stay empty.

`ctas` entries reference `primary` or an existing link ID. A primary CTA must reference the primary link. With an affiliate primary, secondary conversion CTAs require an approved tracked secondary URL. Documentation, help, blogs, and resources can appear separately as informational links. `deepLinkSupported` requires an explicit tracked URL and partner documentation in `sourceReferences`; the application never constructs tracking deep links by adding a destination parameter.

## Remaining content gaps

The 154 published records contain 52 affiliate primaries and 102 website primaries. At this pass, only 36 have logos, 73 have feature entries, two have pricing models, and none have authored step cards, workflow templates, prompt templates, product screenshots, or explicit related-provider IDs. Service-type and pricing filters appear only after those properties are populated. Richer profile content needs dated provider or program sources and editorial review before publication. The existing noindex metadata, HTTP header, empty staging sitemap, and CI release gate remain in place.
