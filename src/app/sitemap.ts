import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.microaischooll.pp.ua";
  return ["", "/how", "/method", "/program", "/install", "/login", "/register", "/privacy", "/terms", "/school"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
