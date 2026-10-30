import assert from "node:assert/strict";
import { test } from "node:test";
import { affiliateLinkErrors, getPrimaryLink, outboundRel } from "@/lib/affiliate-links";
import { candidateReviewIdentitySchema } from "@/schemas/candidate-review";
import type { Provider } from "@/schemas/catalog";

const referral = "https://tracking.example/redirect?campaign=owner-saved&id=123";
const primary = { id: "referral", url: referral, purpose: "saved_tracking_referral" as const, linkType: "saved_tracking_referral" as const, isPrimary: true, isAffiliate: true, verificationStatus: "not_tested" as const };
const provider = { id: "sample", affiliateUrl: referral, primaryUrl: referral, linkType: "saved_tracking_referral", linkHealthStatus: "not_tested", links: [primary] } as Provider;

test("saved referral remains the exact primary destination and gets sponsored rel", () => {
  assert.deepEqual(affiliateLinkErrors(provider), []);
  assert.equal(getPrimaryLink(provider)?.url, referral);
  assert.equal(outboundRel(true), "sponsored noopener noreferrer");
  assert.equal(outboundRel(false), "noopener noreferrer");
});

test("affiliate URL replacement fails, while an untested saved primary remains valid", () => {
  const homepageFallback = { ...provider, primaryUrl: "https://provider.example/" } as Provider;
  assert.ok(affiliateLinkErrors(homepageFallback).some(x => x.includes("must remain the exact primary URL")));
  const unverified = { ...provider, links: [{ ...primary, verificationStatus: "not_tested" as const }] } as Provider;
  assert.deepEqual(affiliateLinkErrors(unverified), []);
});

test("review lifecycle supports owner approval and maintenance states", () => {
  for (const state of ["owner_approved", "published", "needs_update", "inactive", "excluded"]) {
    assert.equal(candidateReviewIdentitySchema.safeParse({ id: "candidate-one", slug: "candidate-one", state }).success, true);
  }
  assert.equal(candidateReviewIdentitySchema.safeParse({ id: "candidate-one", slug: "candidate-one", state: "needs_source_and_destination_validation" }).success, false);
});
