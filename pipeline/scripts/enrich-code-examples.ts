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
  const needsCode =
    !Array.isArray(fm.codeExamples) ||
    fm.codeExamples.length < 1 ||
    fm.codeExamples.some(c => c.title.toLowerCase().includes("pending"));
  if (!needsCode) continue;

  const card = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    narrative: fm.narrative,
    tags: [] as string[]
  };
  writeFileSync(join(runsDir, `code-input-${fm.slug}.json`), JSON.stringify(card, null, 2) + "\n");
  written++;
}

console.log(`Wrote ${written} code-example input cards.`);
console.log("Dispatch sub-agents using pipeline/prompts/stage_6_code_examples_enricher.md.");
console.log("Each writes to .git/iceberg-runs/code-result-<slug>.json");
console.log("Then run: npx tsx pipeline/scripts/apply-code-examples.ts");
