import type { Provider } from "@/schemas/catalog";

export function outboundRel(isAffiliate: boolean) {
  return isAffiliate ? "sponsored noopener noreferrer" : "noopener noreferrer";
}

export function getPrimaryLink(provider: Provider) {
  const link = provider.links.find(item => item.isPrimary);
  if (link) return link;
  return {
    id: "primary", url: provider.primaryUrl, purpose: provider.linkType === "saved_tracking_referral" ? "saved_tracking_referral" as const : "homepage" as const,
    linkType: provider.linkType, isPrimary: true, isAffiliate: provider.linkType === "saved_tracking_referral", verificationStatus: provider.linkHealthStatus === "working" ? "verified" as const : "not_tested" as const, sourceReferences: []
  };
}

export function affiliateLinkErrors(provider: Provider): string[] {
  const errors: string[] = [];
  const primary = provider.links.filter(link => link.isPrimary);
  if (primary.length !== 1) errors.push("Provider must have exactly one primary link");
  if (provider.linkType === "saved_tracking_referral") {
    if (!provider.affiliateUrl || provider.primaryUrl !== provider.affiliateUrl) errors.push("Saved referral URL must remain the exact primary URL");
    if (primary.length === 1 && (primary[0].url !== provider.affiliateUrl || !primary[0].isAffiliate || primary[0].linkType !== "saved_tracking_referral")) errors.push("Primary link does not match the saved referral URL");
  } else {
    if (provider.affiliateUrl !== null) errors.push("Non-affiliate provider must keep affiliateUrl null");
    if (primary.length === 1 && (primary[0].url !== provider.primaryUrl || primary[0].isAffiliate || primary[0].linkType !== "official_website")) errors.push("Official website primary link is inconsistent");
  }
  if (primary.length === 1 && primary[0].url !== provider.primaryUrl) errors.push("Primary URL does not match the primary link record");
  return errors;
}
