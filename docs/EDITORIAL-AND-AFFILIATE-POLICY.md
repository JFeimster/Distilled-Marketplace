# Editorial and affiliate policy

## Claim classes

1. **Editorial guidance:** category questions and stack sequencing based on operator workflow reasoning. It is labeled as guidance, not a provider fact.
2. **Provider fact:** a specific statement supported by a dated public source or documented owner-supplied record. State unknowns as unknown.
3. **Commercial relationship:** a documented affiliate or referral arrangement. Never infer one from a Wix menu label or a provider name.
4. **Unresolved research:** unpublished until identity, destination and claim sources are checked.

## Publication gate

A provider profile needs identity, source-backed capabilities and limitations, current coverage, pricing-model description, verified HTTPS destination, review date and relationship status. Pricing figures require an explicit current pricing source. Comparisons require at least two comparable sourced profiles; offer pages need terms, start and expiry dates and a checked destination. No fake ratings, reviews, awards, savings, discounts, rankings, underwriting claims or guarantees.

Paid links, when documented, use `rel="sponsored noopener noreferrer"` and a nearby disclosure. Paid status does not determine an undisclosed ranking. The current catalog contains no paid links.

## Review and privacy

Recheck source and destination before publication and when terms change. Expired offers fail validation. The stack finder is a deterministic local category router and collects no personal or financial records. `lib/events.ts` defines a proposed aggregate event shape only: `directory_search`, `filter_change`, `provider_view`, `compare_select`, `affiliate_outbound`, `collection_open`, `stack_finder_complete`. It is not sent to any analytics service. Future outbound tracking must never accept arbitrary URLs or leak query parameters.
