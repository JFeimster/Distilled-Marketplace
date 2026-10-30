import raw from "@/data/marketplace/catalog.json";
import { catalogSchema } from "@/schemas/catalog";

export const catalog = catalogSchema.parse(raw);
export const categoryById = (id: string) => catalog.categories.find(item => item.id === id);
export const collectionById = (id: string) => catalog.collections.find(item => item.id === id);
export const providerBySlug = (slug: string) => catalog.providers.find(item => item.slug === slug);
export const groups = ["Money", "Growth", "Systems", "People & risk"] as const;
