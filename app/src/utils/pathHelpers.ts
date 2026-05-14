import type { LearningPath } from "../content/types.js";
import { paths, topics } from "../content/index.js";

export function getPathBySlug(slug: string): LearningPath | undefined {
  return paths.find(p => p.slug === slug);
}

export function topicTitleMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of topics) m.set(t.frontmatter.slug, t.frontmatter.title);
  return m;
}
