import raw from "@/data/marketplace/catalog.json";
import { catalogSchema } from "@/schemas/catalog";

const parsedCatalog = catalogSchema.parse(raw);
export const catalog = { ...parsedCatalog, providers: parsedCatalog.providers.filter(provider => provider.status === "published") };
export const categoryById = (id: string) => catalog.categories.find(item => item.id === id);
export const collectionById = (id: string) => catalog.collections.find(item => item.id === id);
export const providerBySlug = (slug: string) => catalog.providers.find(item => item.slug === slug && item.status === "published");
export const groups = ["Money", "Growth", "Systems", "People & risk"] as const;
