/** Proposed local event contract only. No analytics transport is connected. */
export type MarketplaceEvent =
  | { name: "directory_search"; queryLength: number; resultCount: number }
  | { name: "filter_change"; facet: string; value: string }
  | { name: "provider_view"; providerId: string }
  | { name: "compare_select"; providerIds: string[] }
  | { name: "affiliate_outbound"; providerId: string; offerId?: string }
  | { name: "collection_open"; collectionId: string }
  | { name: "stack_finder_complete"; goal: string; stage: string; categoryIds: string[] };
