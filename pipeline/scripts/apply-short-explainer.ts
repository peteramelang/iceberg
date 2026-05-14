import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type ShortExplainerVideo } from "../lib/content.js";

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
let nulled = 0;
let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `explainer-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { shortExplainerVideo?: ShortExplainerVideo | null };
  const v = raw.shortExplainerVideo;
  if (v === null || v === undefined) {
    fm.shortExplainerVideo = null;
    nulled++;
  } else {
    if (typeof v.url !== "string" || typeof v.title !== "string" || typeof v.author !== "string" ||
        typeof v.durationSeconds !== "number" || typeof v.reasoning !== "string") {
      console.warn(`SKIP ${fm.slug}: invalid explainer shape`);
      skipped++;
      continue;
    }
    if (v.durationSeconds < 15 || v.durationSeconds > 600) {
      console.warn(`SKIP ${fm.slug}: durationSeconds out of range (${v.durationSeconds})`);
      skipped++;
      continue;
    }
    fm.shortExplainerVideo = {
      url: v.url, title: v.title, author: v.author,
      durationSeconds: v.durationSeconds, reasoning: v.reasoning,
      source: "ai-researcher"
    };
    applied++;
  }
  fm.lastUpdatedAt = new Date().toISOString();
  writeTopicFile(path, fm, body);
}

console.log(`Applied explainer to ${applied} topics, nulled ${nulled}, skipped ${skipped}.`);
