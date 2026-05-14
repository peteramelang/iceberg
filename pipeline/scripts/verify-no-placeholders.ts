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
const PLACEHOLDER_TERMS = /\b(pending|placeholder|tbd|todo)\b|\(unspecified\)/i;

for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const where = `${fm.slug}`;

  if (!fm.narrative || fm.narrative.length < 400) errors.push(`${where}: narrative too short (${fm.narrative?.length ?? 0} chars; need >=400)`);
  if (PLACEHOLDER_TERMS.test(fm.narrative ?? "")) errors.push(`${where}: narrative contains placeholder phrase`);

  if (!Array.isArray(fm.pitfalls) || fm.pitfalls.length < 3) errors.push(`${where}: needs >=3 pitfalls (has ${fm.pitfalls?.length ?? 0})`);
  for (const p of fm.pitfalls ?? []) {
    if (PLACEHOLDER_TERMS.test(p.title)) errors.push(`${where}: pitfall title is placeholder ("${p.title}")`);
    if (p.explanation.length < 40) errors.push(`${where}: pitfall "${p.title}" explanation too short`);
  }

  if (!Array.isArray(fm.codeExamples) || fm.codeExamples.length < 1) errors.push(`${where}: needs >=1 code example`);
  for (const c of fm.codeExamples ?? []) {
    if (PLACEHOLDER_TERMS.test(c.title)) errors.push(`${where}: code example title is placeholder ("${c.title}")`);
    if (c.code.length < 20) errors.push(`${where}: code example "${c.title}" too short`);
    if (PLACEHOLDER_TERMS.test(c.reasoning)) errors.push(`${where}: code example reasoning is placeholder`);
  }

  if (!fm.difficulty) errors.push(`${where}: difficulty missing`);

  if (fm.needsManualPick) errors.push(`${where}: needsManualPick is still true`);
}

const pathsPath = join(contentDir, "_paths.json");
let pathsData: unknown = null;
try { pathsData = JSON.parse(readFileSync(pathsPath, "utf8")); } catch {}
if (!pathsData) errors.push("paths: content/_paths.json missing");
else {
  const obj = pathsData as { paths?: unknown[] };
  if (!Array.isArray(obj.paths) || obj.paths.length < 5) errors.push(`paths: need >=5 paths (has ${obj.paths?.length ?? 0})`);
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} placeholder/missing-content issues:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`PASS: no placeholders detected. ${files.length} topics validated.`);
