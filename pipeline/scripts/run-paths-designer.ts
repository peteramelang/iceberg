import { writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

interface TopicMeta { slug: string; title: string; phase: string; summary: string; difficulty: string; estimatedHours: number; prerequisites: string[]; }

const files: string[] = [];
walkMd(contentDir, files);

const topicMeta: TopicMeta[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const tax = taxonomy.topics[fm.slug];
  topicMeta.push({
    slug: fm.slug,
    title: fm.title,
    phase: fm.phase,
    summary: fm.summary,
    difficulty: fm.difficulty,
    estimatedHours: fm.estimatedHours,
    prerequisites: tax?.prerequisites ?? []
  });
}

writeFileSync(join(runsDir, "paths-input.json"), JSON.stringify({ taxonomy: { phases: taxonomy.phases }, topics: topicMeta }, null, 2) + "\n");
console.log(`Wrote paths-input.json with ${topicMeta.length} topics.`);
