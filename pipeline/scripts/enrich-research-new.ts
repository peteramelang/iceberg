// Generate per-topic research input cards for new (un-researched) topics.
// A topic is "new" if its definition is the placeholder "(pending research)".
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let written = 0;
const slugs: string[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  if (fm.definition !== "(pending research)") continue;
  const card = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    phase: fm.phase,
    tags: [] as string[]
  };
  writeFileSync(join(runsDir, `research-input-${fm.slug}.json`), JSON.stringify(card, null, 2) + "\n");
  slugs.push(fm.slug);
  written++;
}

console.log(`Wrote ${written} research input cards for new topics.`);
console.log("Slugs:", slugs.join(", "));
