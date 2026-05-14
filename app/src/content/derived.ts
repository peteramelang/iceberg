import { taxonomy, topics } from "./index.js";
import type { TopicFrontmatter } from "./types.js";

// Static derived indexes computed once at module load.
// Used to replace `topics.find(x => x.frontmatter.slug === slug)` linear scans
// scattered across components (~24 callsites) with O(1) Map lookups, and to
// eliminate the eight near-identical `totalResourcesFor(slug)` helpers.

export const topicBySlug: Map<string, { frontmatter: TopicFrontmatter; body: string }> = (() => {
  const m = new Map<string, { frontmatter: TopicFrontmatter; body: string }>();
  for (const t of topics) m.set(t.frontmatter.slug, t);
  return m;
})();

export const phaseBySlug = (() => {
  const m = new Map<string, NonNullable<typeof taxonomy>["phases"][number]>();
  if (taxonomy) for (const p of taxonomy.phases) m.set(p.slug, p);
  return m;
})();

export function resourceTotalFor(slug: string): number {
  const t = topicBySlug.get(slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export const totalResourcesPerTopic: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const t of topics) out[t.frontmatter.slug] = resourceTotalFor(t.frontmatter.slug);
  return out;
})();
