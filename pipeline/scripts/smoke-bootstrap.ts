import { createInitialLedger, writeLedger, setStageStatus, setTopicStageStatus } from "../lib/ledger.js";
import { scaffoldTopicStub } from "../lib/content.js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const ledgerPath = join(repoRoot, "content", "_ledger.smoke.json");
const contentDir = join(repoRoot, "content-smoke");
const taxonomyDest = join(contentDir, "_taxonomy.json");

mkdirSync(contentDir, { recursive: true });
mkdirSync(join(repoRoot, "content"), { recursive: true });

const led = createInitialLedger("smoke");
writeLedger(ledgerPath, led);

const taxonomy = JSON.parse(readFileSync(join(repoRoot, "pipeline", "smoke-taxonomy.json"), "utf8"));
writeFileSync(taxonomyDest, JSON.stringify(taxonomy, null, 2) + "\n");

const now = new Date().toISOString();
setStageStatus(ledgerPath, "stage_0_taxonomy", "completed", {
  userApprovedAt: now,
  artifactPath: "content-smoke/_taxonomy.json"
});

interface TaxTopic { slug: string; title: string; phase: string; order: number; summary: string; }

for (const [, topic] of Object.entries(taxonomy.topics as Record<string, TaxTopic>)) {
  const stubPath = join(contentDir, topic.phase, `${topic.slug}.md`);
  scaffoldTopicStub(stubPath, {
    slug: topic.slug,
    title: topic.title,
    phase: topic.phase,
    order: topic.order,
    summary: topic.summary
  });
  setTopicStageStatus(ledgerPath, topic.slug, topic.phase, "research", "pending", {});
  console.log(`Scaffolded ${stubPath}`);
}

console.log("Bootstrap complete. Ledger:", ledgerPath);
