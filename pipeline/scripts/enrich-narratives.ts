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

const candidates: { path: string; slug: string }[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const needsNarrative = !fm.narrative || fm.narrative.startsWith("Pending narrative") || fm.narrative.length < 400;
  if (needsNarrative) candidates.push({ path, slug: fm.slug });
}

console.log(`Found ${candidates.length} topics needing narrative enrichment.`);

for (const { path, slug } of candidates) {
  const { frontmatter: fm } = readTopicFile(path);
  const card = {
    slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    phase: fm.phase,
    tags: [] as string[]
  };
  writeFileSync(join(runsDir, `narrative-input-${slug}.json`), JSON.stringify(card, null, 2) + "\n");
}

console.log("Wrote per-topic input cards to .git/iceberg-runs/narrative-input-*.json");
console.log("Next: dispatch one sub-agent per card using stage_6_narrative_writer.md");
console.log("Each sub-agent writes its result to .git/iceberg-runs/narrative-result-<slug>.json");
console.log("Then run: npx tsx pipeline/scripts/apply-narratives.ts");
