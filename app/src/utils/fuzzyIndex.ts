import Fuse from "fuse.js";
import { topics, taxonomy } from "../content/index.js";

interface IndexEntry {
  slug: string;
  title: string;
  summary: string;
  definition: string;
  resources: string;
}

const entries: IndexEntry[] = topics.map(t => {
  const fm = t.frontmatter;
  const r = fm.resources;
  const resourceTitles: string[] = [];
  if (r.videos.short) resourceTitles.push(r.videos.short.title);
  if (r.videos.long) resourceTitles.push(r.videos.long.title);
  for (const a of r.articles) resourceTitles.push(a.title);
  for (const s of r.services) resourceTitles.push(s.name);
  for (const c of r.courses) resourceTitles.push(c.title);
  return {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    resources: resourceTitles.join(" · ")
  };
});

export const fuse = new Fuse(entries, {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "summary", weight: 0.25 },
    { name: "definition", weight: 0.15 },
    { name: "resources", weight: 0.1 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 2
});

export function search(query: string, limit = 8) {
  if (!query) return [];
  return fuse.search(query, { limit }).map(r => {
    const t = taxonomy?.topics[r.item.slug];
    return { slug: r.item.slug, title: t?.title ?? r.item.title, summary: t?.summary ?? r.item.summary };
  });
}
