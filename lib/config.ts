function validateSiteUrl(value: string) {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || (url.protocol === "http:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1")) throw new Error("Site URL must be HTTPS or local HTTP");
  return url.origin;
}
export const site = {
  name: "Distilled Marketplace",
  description: "Find the right business service category, compare the questions that matter, and build a practical operating stack.",
  url: validateSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  futureHost: "https://marketplace.distilledfunding.com",
  indexingEnabled: false
};
export const canonical = (route: string) => `${site.url}${route === "/" ? "" : route}`;
