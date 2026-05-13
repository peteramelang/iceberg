import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { validateTopicFrontmatter } from "./validate.js";

export interface TopicFrontmatter {
  slug: string;
  title: string;
  phase: string;
  order: number;
  summary: string;
  definition: string;
  needsManualPick: boolean;
  resources: {
    videos: { short: VideoResource | null; long: VideoResource | null };
    articles: ArticleResource[];
    services: ServiceResource[];
    courses: CourseResource[];
  };
  provenance: {
    researchedAt: string;
    pipelineVersion: number;
    rounds: number;
    stabilized: boolean;
  };
}

export interface VideoResource {
  url: string; title: string; author: string;
  durationMinutes: number; addedAt: string; reasoning: string;
}
export interface ArticleResource {
  url: string; title: string;
  kind: "canonical-doc" | "engineering-blog" | "tutorial";
  reasoning: string;
}
export interface ServiceResource {
  name: string; url: string; category: string; reasoning: string;
}
export interface CourseResource {
  url: string; title: string; provider: string; paid: boolean; reasoning: string;
}

export interface TopicFile {
  frontmatter: TopicFrontmatter;
  body: string;
  path: string;
}

export function readTopicFile(path: string): TopicFile {
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  validateTopicFrontmatter(parsed.data);
  return { frontmatter: parsed.data as TopicFrontmatter, body: parsed.content, path };
}

export function writeTopicFile(path: string, frontmatter: TopicFrontmatter, body: string): void {
  validateTopicFrontmatter(frontmatter);
  mkdirSync(dirname(path), { recursive: true });
  const serialized = matter.stringify(body, frontmatter);
  writeFileSync(path, serialized);
}

export interface ScaffoldInput {
  slug: string; title: string; phase: string; order: number; summary: string;
}

export function scaffoldTopicStub(path: string, input: ScaffoldInput): void {
  const fm: TopicFrontmatter = {
    slug: input.slug,
    title: input.title,
    phase: input.phase,
    order: input.order,
    summary: input.summary,
    definition: "(pending research)",
    needsManualPick: false,
    resources: { videos: { short: null, long: null }, articles: [], services: [], courses: [] },
    provenance: {
      researchedAt: new Date().toISOString(),
      pipelineVersion: 1,
      rounds: 1,
      stabilized: false
    }
  };
  writeTopicFile(path, fm, "<!-- user notes -->\n");
}

export function parseAllTopics(contentDir: string): TopicFile[] {
  const out: TopicFile[] = [];
  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      if (entry.startsWith("_") || entry.startsWith(".")) continue;
      const full = join(d, entry);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (entry.endsWith(".md")) out.push(readTopicFile(full));
    }
  }
  walk(contentDir);
  return out;
}
