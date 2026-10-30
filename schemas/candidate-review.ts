import { z } from "zod";
import { providerLifecycleStates } from "@/schemas/catalog";

export const candidateReviewStateSchema = z.enum(providerLifecycleStates);
export const candidateReviewIdentitySchema = z.object({ id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), state: candidateReviewStateSchema });
