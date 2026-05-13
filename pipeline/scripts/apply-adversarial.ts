import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

interface Decision { slug: string; slotPath: string; action: "keep" | "swap"; replacement?: unknown; reasoning?: string; }
interface BatchFile { batchId: string; results: Decision[]; }

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const resultFiles = readdirSync(runsDir).filter(f => f.startsWith("adversarial-result-") && f.endsWith(".json")).map(f => join(runsDir, f));

const byTopic = new Map<string, Map<string, Decision>>();
for (const path of resultFiles) {
  const batch = JSON.parse(readFileSync(path, "utf8")) as BatchFile;
  for (const d of batch.results) {
    let m = byTopic.get(d.slug);
    if (!m) { m = new Map(); byTopic.set(d.slug, m); }
    m.set(d.slotPath, d);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let swaps = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const m = byTopic.get(fm.slug);
  if (!m) continue;
  let changed = false;

  for (const [slotPath, decision] of m) {
    if (decision.action !== "swap" || !decision.replacement) continue;

    if (slotPath === "videos.short") { fm.resources.videos.short = decision.replacement as typeof fm.resources.videos.short; changed = true; swaps++; continue; }
    if (slotPath === "videos.long")  { fm.resources.videos.long  = decision.replacement as typeof fm.resources.videos.long;  changed = true; swaps++; continue; }

    const m2 = slotPath.match(/^(articles|services|courses)\.(\d+)$/);
    if (!m2) continue;
    const [, kind, idxStr] = m2;
    const idx = Number(idxStr);
    const arr = (fm.resources as Record<string, unknown>)[kind!] as unknown[];
    if (idx < 0 || idx >= arr.length) continue;
    arr[idx] = decision.replacement;
    changed = true;
    swaps++;
  }

  if (changed) {
    fm.provenance.rounds = (fm.provenance.rounds ?? 1) + 1;
    writeTopicFile(path, fm, body);
  }
}

console.log(`Adversarial round complete. Swaps: ${swaps}.`);
