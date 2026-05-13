import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePaths } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");
const contentDir = join(repoRoot, "content");

const raw = JSON.parse(readFileSync(join(runsDir, "paths-result.json"), "utf8"));
validatePaths(raw);

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));
const known = new Set(Object.keys(taxonomy.topics));
for (const p of raw.paths) {
  for (const t of p.topics) {
    if (!known.has(t)) throw new Error(`Path ${p.slug} references unknown topic ${t}`);
  }
}

writeFileSync(join(contentDir, "_paths.json"), JSON.stringify(raw, null, 2) + "\n");
console.log(`Wrote ${raw.paths.length} paths to content/_paths.json.`);
