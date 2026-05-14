import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

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

let applied = 0;
let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `narrative-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) {
    skipped++;
    continue;
  }
  let raw: { narrative?: string };
  try {
    raw = JSON.parse(readFileSync(resultPath, "utf8"));
  } catch (e) {
    console.warn(`SKIP ${fm.slug}: invalid JSON in result - ${String(e).slice(0, 120)}`);
    skipped++;
    continue;
  }
  if (typeof raw?.narrative !== "string" || raw.narrative.length < 400) {
    console.warn(`SKIP ${fm.slug}: narrative missing or too short (${raw?.narrative?.length ?? 0} chars)`);
    skipped++;
    continue;
  }
  fm.narrative = raw.narrative;
  fm.lastUpdatedAt = new Date().toISOString();
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied narrative to ${applied} topics. Skipped: ${skipped}.`);
