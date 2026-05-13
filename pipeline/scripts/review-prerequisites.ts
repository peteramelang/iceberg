import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateTaxonomy } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));

interface PreqInput { slug: string; title: string; summary: string; phase: string; currentPrerequisites: string[]; }
const input: PreqInput[] = Object.values(taxonomy.topics).map(t => {
  const topic = t as { slug: string; title: string; summary: string; phase: string; prerequisites: string[] };
  return { slug: topic.slug, title: topic.title, summary: topic.summary, phase: topic.phase, currentPrerequisites: topic.prerequisites };
});

writeFileSync(join(runsDir, "preq-input.json"), JSON.stringify(input, null, 2) + "\n");

console.log(`Wrote preq-input.json with ${input.length} topics.`);
console.log("Next: dispatch a single sub-agent with the prompt:");
console.log("  'Review every topic's prerequisites. The DAG should be tight: a prerequisite means");
console.log("   the learner truly cannot understand B without already understanding A. Remove weak");
console.log("   links. Add missing strong ones. Output JSON: { changes: [{ slug, prerequisites: [...] }] }");
console.log("   to .git/iceberg-runs/preq-result.json. Do not introduce cycles.'");

if (process.argv.includes("--apply")) {
  const result = JSON.parse(readFileSync(join(runsDir, "preq-result.json"), "utf8")) as { changes: { slug: string; prerequisites: string[] }[] };
  const topicSlugs = new Set(Object.keys(taxonomy.topics));
  for (const c of result.changes) {
    if (!taxonomy.topics[c.slug]) { console.warn(`Skip: unknown slug ${c.slug}`); continue; }
    let validPrereqs = true;
    for (const p of c.prerequisites) {
      if (!topicSlugs.has(p)) { console.warn(`Skip prereq: unknown ${p} for ${c.slug}`); validPrereqs = false; }
    }
    if (!validPrereqs) continue;
    taxonomy.topics[c.slug].prerequisites = c.prerequisites;
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(slug: string, stack: string[]): void {
    if (visited.has(slug)) return;
    if (visiting.has(slug)) throw new Error(`Cycle detected: ${[...stack, slug].join(" -> ")}`);
    visiting.add(slug);
    for (const p of taxonomy.topics[slug].prerequisites) visit(p, [...stack, slug]);
    visiting.delete(slug);
    visited.add(slug);
  }
  for (const slug of Object.keys(taxonomy.topics)) visit(slug, []);

  validateTaxonomy(taxonomy);
  writeFileSync(join(contentDir, "_taxonomy.json"), JSON.stringify(taxonomy, null, 2) + "\n");
  console.log(`Applied ${result.changes.length} prerequisite changes.`);
}
