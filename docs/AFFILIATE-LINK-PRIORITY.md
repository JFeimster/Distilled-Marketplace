# Affiliate link priority

## Destination rules

- For each of the 52 owner-saved referrals, the exact original URL remains `affiliateUrl`, `primaryUrl` and the primary typed link. Its classification is `saved_tracking_referral`.
- Company, product, pricing and documentation pages remain secondary links when available.
- For the other 102 candidates, `affiliateUrl` is `null`, the recorded company website is primary and its classification is `official_website`.
- Do not alter tracking parameters, generate identifiers, or fall back from a saved referral URL to a homepage.
- Affiliate CTAs use `rel="sponsored noopener noreferrer"`; ordinary links use `rel="noopener noreferrer"`.

`lib/affiliate-links.ts` checks one primary link and consistency among the primary URL, affiliate URL, classification and typed-link metadata. `linkHealthStatus: "not_tested"` is allowed for a published listing; a malformed or unsafe URL remains a blocking error. Link health is maintenance evidence, not proof of attribution.

The public UI describes these as saved referral links and does not call the relationship verified. The projection omits private partner account details, payment observations and campaign metadata. No UTM parameters, commissions or customer prices are created.
