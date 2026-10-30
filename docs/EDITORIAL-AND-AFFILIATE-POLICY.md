# Editorial and affiliate policy

## Claim classes

1. **Editorial guidance:** category questions and stack sequencing based on operator workflow reasoning. It is labeled as guidance, not a provider fact.
2. **Provider fact:** a specific statement supported by a dated public source or documented owner-supplied record. State unknowns as unknown.
3. **Commercial relationship:** a documented affiliate or referral arrangement. Never infer one from a Wix menu label or a provider name.
4. **Unresolved research:** unpublished until identity, destination and claim sources are checked.

## Publication gate

A provider profile needs identity, source-backed capabilities and limitations, current coverage, pricing model, verified HTTPS destination, review date and relationship status. Pricing figures require a specific current pricing source; set the model to `unknown` when no published model can be confirmed. Comparisons require at least two comparable sourced profiles. Offer pages need current source-backed terms, start and expiry dates, a checked destination and a directly supported provider relationship where applicable. Expired or stale records must be removed from the public catalog until rechecked. The catalog validator's current freshness limits are 180 days for a provider record and 30 days for an offer.

The `sources[].supports` labels must identify which fields or claims each source supports. A source must not be described as proving more than it says. A schema pass is not an editorial approval: a human reviewer must check the source, claim, date, destination and category fit together before setting `editorialStatus` to `verified`.

Paid links use `rel="sponsored noopener noreferrer"` and a nearby, plain-language disclosure. Affiliate status requires documentary evidence from the current partner agreement or approved affiliate platform, including an exact approved destination and any applicable term, product, territory or claim restrictions. A public article, provider name, menu category or vendor's general affiliate-program page is not proof that Moonshine Capital has an active relationship. Do not store contract documents, payout details, partner credentials or private contact data in the public catalog. Keep those in their existing access-controlled system and reference the authorized source of truth during human review. Paid status does not determine an undisclosed ranking. The current catalog contains no paid links.

## Import suitability

The Zod provider schema is a **publication-record validator**, not a complete provider-import workflow. The sample JSON file is a blank shape and intentionally fails validation until all fields are populated and reviewed. Before automating imports, add a candidate/review state outside the public `providers` array, explicit field-to-source mapping, an internal relationship evidence reference, named reviewer and approval timestamp, approved destination/territory restrictions, and a deactivation/expiry path. Preserve private agreement evidence outside the public catalog. See [Provider import contract](PROVIDER-IMPORT-CONTRACT.md) and [inventory integration plan](PROVIDER-INTEGRATION-PLAN.md).

## Review and privacy

Recheck source and destination before publication and when terms change. Revalidate affiliate links against the approved source, not by guessing or editing a tracking URL. Expired offers fail validation. The stack finder is a deterministic local category router and collects no personal or financial records. `lib/events.ts` defines a proposed aggregate event shape only: `directory_search`, `filter_change`, `provider_view`, `compare_select`, `affiliate_outbound`, `collection_open`, `stack_finder_complete`. It is not sent to any analytics service. Future outbound tracking must never accept arbitrary URLs or leak query parameters.
