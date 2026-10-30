import Link from "next/link";
import type { Category } from "@/schemas/catalog";
export function CategoryLink({ category, index }: { category: Category; index?: number }) { return <Link className="category-row" href={`/categories/${category.id}`}><span className="eyebrow">{String((index ?? 0) + 1).padStart(2, "0")} / {category.group}</span><strong>{category.name}</strong><span className="category-summary">{category.summary}</span><b aria-hidden="true">↗</b></Link>; }
