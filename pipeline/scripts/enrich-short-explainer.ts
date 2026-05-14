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
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  // Only generate cards for topics without an explainer yet
  if (fm.shortExplainerVideo) continue;
  const card = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    narrative: fm.narrative,
    phase: fm.phase
  };
  writeFileSync(join(runsDir, `explainer-input-${fm.slug}.json`), JSON.stringify(card, null, 2) + "\n");
  written++;
}

console.log(`Wrote ${written} short-explainer input cards.`);
