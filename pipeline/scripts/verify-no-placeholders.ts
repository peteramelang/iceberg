import { readdirSync, statSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");

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

const errors: string[] = [];
// We look for placeholder PATTERNS rather than the bare word "pending" — that word
// has legitimate uses (e.g. "pending uploads", "pending acknowledgements"). The
// scaffold bootstrap uses phrases like "Pending narrative", "Pending tldr",
// "(pending)", "(pitfall N pending)" which we want to catch.
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /\bpending\s+(narrative|tldr|definition|pitfall|code|reasoning)\b/i,
  /\(pitfall\s+\d+\s+pending\)/i,
  /\(pending\)/i,
  /\bplaceholder\b/i,
  /\btbd\b/i,
  /\btodo\b/i,
  /\(unspecified\)/i,
  /replace\s+before\s+publishing/i
];
function hasPlaceholder(s: string | null | undefined): boolean {
  if (!s) return false;
  for (const re of PLACEHOLDER_PATTERNS) if (re.test(s)) return true;
  return false;
}

for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const where = `${fm.slug}`;

  if (!fm.narrative || fm.narrative.length < 400) errors.push(`${where}: narrative too short (${fm.narrative?.length ?? 0} chars; need >=400)`);
  if (hasPlaceholder(fm.narrative ?? "")) errors.push(`${where}: narrative contains placeholder phrase`);

  if (!Array.isArray(fm.pitfalls) || fm.pitfalls.length < 3) errors.push(`${where}: needs >=3 pitfalls (has ${fm.pitfalls?.length ?? 0})`);
  for (const p of fm.pitfalls ?? []) {
    if (hasPlaceholder(p.title)) errors.push(`${where}: pitfall title is placeholder ("${p.title}")`);
    if (p.explanation.length < 40) errors.push(`${where}: pitfall "${p.title}" explanation too short`);
  }

  if (!Array.isArray(fm.codeExamples) || fm.codeExamples.length < 1) errors.push(`${where}: needs >=1 code example`);
  for (const c of fm.codeExamples ?? []) {
    if (hasPlaceholder(c.title)) errors.push(`${where}: code example title is placeholder ("${c.title}")`);
    if (c.code.length < 20) errors.push(`${where}: code example "${c.title}" too short`);
    if (hasPlaceholder(c.reasoning)) errors.push(`${where}: code example reasoning is placeholder`);
  }

  if (!fm.difficulty) errors.push(`${where}: difficulty missing`);

  if (fm.needsManualPick) errors.push(`${where}: needsManualPick is still true`);

  // v2 fields
  if (typeof fm.tldr !== "string" || fm.tldr.length < 40 || fm.tldr.length > 320) {
    errors.push(`${where}: tldr length out of range (${fm.tldr?.length ?? 0}; need 40-320)`);
  }
  if (hasPlaceholder(fm.tldr ?? "")) {
    errors.push(`${where}: tldr contains placeholder phrase`);
  }
  if (typeof fm.lastUpdatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(fm.lastUpdatedAt)) {
    errors.push(`${where}: lastUpdatedAt missing or malformed`);
  }
  // shortExplainerVideo is optional (null permitted); when present, validate shape.
  if (fm.shortExplainerVideo) {
    const v = fm.shortExplainerVideo;
    if (typeof v.url !== "string" || !v.url.startsWith("http")) errors.push(`${where}: shortExplainerVideo.url invalid`);
    if (typeof v.title !== "string" || v.title.length < 1) errors.push(`${where}: shortExplainerVideo.title missing`);
    if (typeof v.durationSeconds !== "number" || v.durationSeconds < 15 || v.durationSeconds > 600) {
      errors.push(`${where}: shortExplainerVideo.durationSeconds out of range`);
    }
  }
}

const pathsPath = join(contentDir, "_paths.json");
let pathsData: unknown = null;
try { pathsData = JSON.parse(readFileSync(pathsPath, "utf8")); } catch {}
if (!pathsData) errors.push("paths: content/_paths.json missing");
else {
  interface PathEntry { slug: string; tldr?: string; lastUpdatedAt?: string; topics?: string[]; description?: string; }
  const obj = pathsData as { paths?: PathEntry[] };
  if (!Array.isArray(obj.paths) || obj.paths.length < 5) errors.push(`paths: need >=5 paths (has ${obj.paths?.length ?? 0})`);
  else {
    for (const p of obj.paths) {
      const where = `path:${p.slug}`;
      if (typeof p.tldr !== "string" || p.tldr.length < 40 || p.tldr.length > 320) {
        errors.push(`${where}: tldr length out of range (${p.tldr?.length ?? 0}; need 40-320)`);
      }
      if (hasPlaceholder(p.tldr ?? "")) {
        errors.push(`${where}: tldr contains placeholder phrase`);
      }
      if (typeof p.lastUpdatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(p.lastUpdatedAt)) {
        errors.push(`${where}: lastUpdatedAt missing or malformed`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} placeholder/missing-content issues:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`PASS: no placeholders detected. ${files.length} topics validated.`);
