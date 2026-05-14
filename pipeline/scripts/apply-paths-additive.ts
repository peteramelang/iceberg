// Additive variant of apply-paths.ts: merge new paths into existing _paths.json,
// preserving existing paths. Skips new paths whose slug already exists.
// Also stamps tldr + lastUpdatedAt on new paths (required fields).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePaths } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");
const contentDir = join(repoRoot, "content");

interface Path {
  slug: string;
  title: string;
  tldr?: string;
  description: string;
  audience: string;
  estimatedHours: number;
  topics: string[];
  lastUpdatedAt?: string;
}

const newRaw = JSON.parse(readFileSync(join(runsDir, "paths-result.json"), "utf8")) as { version: 1; paths: Path[] };

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));
const known = new Set(Object.keys(taxonomy.topics));

const existing = JSON.parse(readFileSync(join(contentDir, "_paths.json"), "utf8")) as { version: 1; paths: Path[] };
const existingSlugs = new Set(existing.paths.map(p => p.slug));

const NOW = new Date().toISOString();
let added = 0;
for (const p of newRaw.paths) {
  if (existingSlugs.has(p.slug)) {
    console.log(`SKIP path ${p.slug}: already exists`);
    continue;
  }
  // Validate topics exist
  let ok = true;
  for (const t of p.topics) {
    if (!known.has(t)) {
      console.warn(`SKIP path ${p.slug}: references unknown topic ${t}`);
      ok = false;
      break;
    }
  }
  if (!ok) continue;
  // Fill required fields if missing
  if (!p.tldr) p.tldr = "Pending tldr — short plain-language summary. Replace before publishing.";
  p.lastUpdatedAt = NOW;
  // Reorder
  const ordered: Path = {
    slug: p.slug,
    title: p.title,
    tldr: p.tldr,
    description: p.description,
    audience: p.audience,
    estimatedHours: p.estimatedHours,
    topics: p.topics,
    lastUpdatedAt: p.lastUpdatedAt
  };
  existing.paths.push(ordered);
  added++;
}

validatePaths(existing);
writeFileSync(join(contentDir, "_paths.json"), JSON.stringify(existing, null, 2) + "\n");
console.log(`Added ${added} new paths. Total: ${existing.paths.length}.`);
