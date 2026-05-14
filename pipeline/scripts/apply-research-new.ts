// Apply Stage 1 research results to topic frontmatter.
// Expects .git/iceberg-runs/research-result-<slug>.json shaped like:
//   { definition: "...", resources: { videos: {short, long}, articles, services, courses } }
// Resources schema is enforced by writeTopicFile -> validateTopicFrontmatter.
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

const ATTR = "ai-researcher" as const;

interface RawRes {
  definition?: string;
  resources?: {
    videos?: { short?: unknown; long?: unknown };
    articles?: unknown[];
    services?: unknown[];
    courses?: unknown[];
  };
}

function clean<T extends object>(obj: T, allowedKeys: string[]): T {
  const o = obj as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    if (!allowedKeys.includes(k)) { delete o[k]; continue; }
    // Drop empty-string optionals so schema doesn't reject "must be string with minLength"
    const v = o[k];
    if (typeof v === "string" && v === "") delete o[k];
    if (v === null || v === undefined) delete o[k];
  }
  return obj;
}

const files: string[] = [];
walkMd(contentDir, files);

let applied = 0;
let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resPath = join(runsDir, `research-result-${fm.slug}.json`);
  if (!existsSync(resPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resPath, "utf8")) as RawRes;

  if (!raw.definition || raw.definition.length < 40) {
    console.warn(`SKIP ${fm.slug}: definition missing or too short`);
    skipped++;
    continue;
  }
  const r = raw.resources;
  if (!r) {
    console.warn(`SKIP ${fm.slug}: no resources block`);
    skipped++;
    continue;
  }

  fm.definition = raw.definition;

  // videos
  const shortAllowed = ["url","title","author","durationMinutes","addedAt","reasoning","channelUrl","license","source"];
  const longAllowed = shortAllowed;
  fm.resources.videos.short = r.videos?.short
    ? { ...(clean({ ...(r.videos.short as object), source: ATTR }, shortAllowed) as object) } as typeof fm.resources.videos.short
    : null;
  fm.resources.videos.long = r.videos?.long
    ? { ...(clean({ ...(r.videos.long as object), source: ATTR }, longAllowed) as object) } as typeof fm.resources.videos.long
    : null;

  // arrays
  const artAllowed = ["url","title","kind","reasoning","publisher","author","license","source"];
  const svcAllowed = ["name","url","category","reasoning","vendor","license","source"];
  const crsAllowed = ["url","title","provider","paid","reasoning","instructor","license","source"];
  fm.resources.articles = ((r.articles ?? []) as object[])
    .map(a => clean({ ...a, source: ATTR }, artAllowed) as typeof fm.resources.articles[number])
    .slice(0, 5);
  fm.resources.services = ((r.services ?? []) as object[])
    .map(s => clean({ ...s, source: ATTR }, svcAllowed) as typeof fm.resources.services[number])
    .slice(0, 8);
  fm.resources.courses = ((r.courses ?? []) as object[])
    .map(c => clean({ ...c, source: ATTR }, crsAllowed) as typeof fm.resources.courses[number])
    .slice(0, 4);

  fm.provenance.researchedAt = new Date().toISOString();
  fm.lastUpdatedAt = new Date().toISOString();

  try {
    writeTopicFile(path, fm, body);
    applied++;
  } catch (e) {
    console.warn(`SKIP ${fm.slug}: validation failed - ${String(e).slice(0, 200)}`);
    skipped++;
  }
}

console.log(`Applied research to ${applied} topics. Skipped: ${skipped}.`);
