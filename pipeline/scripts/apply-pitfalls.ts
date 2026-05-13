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

interface Pitfall { title: string; explanation: string; }

const files: string[] = [];
walkMd(contentDir, files);

let applied = 0;
let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `pitfalls-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { pitfalls?: Pitfall[] };
  const pitfalls = (raw.pitfalls ?? []).filter(p =>
    typeof p?.title === "string" && p.title.length > 0 &&
    typeof p?.explanation === "string" && p.explanation.length >= 40
  );
  if (pitfalls.length < 3) {
    console.warn(`SKIP ${fm.slug}: only ${pitfalls.length} valid pitfalls`);
    skipped++;
    continue;
  }
  fm.pitfalls = pitfalls.slice(0, 8);
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied pitfalls to ${applied} topics. Skipped: ${skipped}.`);
