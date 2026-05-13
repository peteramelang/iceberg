import { createInitialLedger, writeLedger, setStageStatus, setTopicStageStatus } from "../lib/ledger.js";
import { scaffoldTopicStub } from "../lib/content.js";
import { validateTaxonomy } from "../lib/validate.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const ledgerPath = join(repoRoot, "content", "_ledger.json");
const contentDir = join(repoRoot, "content");
const taxonomyPath = join(contentDir, "_taxonomy.json");

const taxonomy = JSON.parse(readFileSync(taxonomyPath, "utf8"));
validateTaxonomy(taxonomy);
console.log(`Taxonomy validated: ${Object.keys(taxonomy.topics).length} topics across ${taxonomy.phases.length} phases.`);

const phaseSlugs = new Set(taxonomy.phases.map((p: { slug: string }) => p.slug));
const topicSlugs = new Set(Object.keys(taxonomy.topics));
for (const [slug, t] of Object.entries(taxonomy.topics) as Array<[string, { phase: string; prerequisites: string[] }]>) {
  if (!phaseSlugs.has(t.phase)) throw new Error(`Topic ${slug} references unknown phase ${t.phase}`);
  for (const pre of t.prerequisites) {
    if (!topicSlugs.has(pre)) throw new Error(`Topic ${slug} references unknown prerequisite ${pre}`);
  }
}
for (const phase of taxonomy.phases) {
  for (const slug of phase.topics) {
    if (!topicSlugs.has(slug)) throw new Error(`Phase ${phase.slug} lists unknown topic ${slug}`);
    if (taxonomy.topics[slug].phase !== phase.slug) {
      throw new Error(`Topic ${slug} declared phase ${taxonomy.topics[slug].phase} but listed under ${phase.slug}`);
    }
  }
}
console.log("Cross-references valid.");

// Initialize ledger
const led = createInitialLedger("full");
writeLedger(ledgerPath, led);

// Mark Stage 0 user-approved
const now = new Date().toISOString();
setStageStatus(ledgerPath, "stage_0_taxonomy", "completed", {
  userApprovedAt: now,
  artifactPath: "content/_taxonomy.json"
});

// Stage 0e: scaffold every topic
let count = 0;
for (const [, topic] of Object.entries(taxonomy.topics) as Array<[string, { slug: string; title: string; phase: string; order: number; summary: string }]>) {
  const stubPath = join(contentDir, topic.phase, `${topic.slug}.md`);
  scaffoldTopicStub(stubPath, {
    slug: topic.slug,
    title: topic.title,
    phase: topic.phase,
    order: topic.order,
    summary: topic.summary
  });
  setTopicStageStatus(ledgerPath, topic.slug, topic.phase, "research", "pending", {});
  count++;
}

console.log(`Scaffolded ${count} topic stubs.`);
console.log(`Ledger: ${ledgerPath}`);
