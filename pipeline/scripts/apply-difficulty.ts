import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type Difficulty } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const VALID: Difficulty[] = ["beginner", "intermediate", "advanced"];

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

let applied = 0; let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `difficulty-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { difficulty?: string; estimatedHours?: number };
  if (!VALID.includes(raw.difficulty as Difficulty)) {
    console.warn(`SKIP ${fm.slug}: invalid difficulty ${raw.difficulty}`);
    skipped++;
    continue;
  }
  const h = raw.estimatedHours;
  if (typeof h !== "number" || h < 0.5 || h > 40) {
    console.warn(`SKIP ${fm.slug}: invalid estimatedHours ${h}`);
    skipped++;
    continue;
  }
  fm.difficulty = raw.difficulty as Difficulty;
  fm.estimatedHours = h;
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied difficulty + hours to ${applied} topics. Skipped: ${skipped}.`);
