import routes from "../data/marketplace/generated/routes.json";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const failures: string[] = [];
const known = new Set(routes);
for (const route of routes) {
  const response = await fetch(new URL(route, base), { redirect: "manual" });
  const html = await response.text();
  if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
  if (!/noindex/i.test(response.headers.get("x-robots-tag") ?? "")) failures.push(`${route}: missing X-Robots-Tag`);
  if (!/<meta name="robots" content="noindex,\s*nofollow"/i.test(html)) failures.push(`${route}: missing noindex meta`);
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1]).filter(href => !href.startsWith("/_next/") && !href.startsWith("/icon.svg"));
  for (const href of links) {
    const path = href.split(/[?#]/, 1)[0] || "/";
    if (!known.has(path) && path !== "/opengraph-image") failures.push(`${route}: unknown local link ${href}`);
  }
}
const missing = await fetch(new URL("/__missing-marketplace-route", base), { redirect: "manual" });
if (missing.status !== 404) failures.push(`Unknown route expected 404, got ${missing.status}`);
const sitemap = await (await fetch(new URL("/sitemap.xml", base))).text();
if (/<loc>/i.test(sitemap)) failures.push("Staging sitemap contains URLs");
const robots = await (await fetch(new URL("/robots.txt", base))).text();
if (!/User-Agent: \*/i.test(robots)) failures.push("robots.txt missing user agent");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Audited ${routes.length} HTML routes, local links, noindex headers/meta, empty sitemap, robots and unknown-route 404.`);
