import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

interface UrlEntry { slug: string; slotPath: string; url: string; kind: string; }

const urls: UrlEntry[] = JSON.parse(readFileSync(join(runsDir, "_urls-to-check.json"), "utf8"));

const BATCH_SIZE = 20;
const batches: UrlEntry[][] = [];
for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  batches.push(urls.slice(i, i + BATCH_SIZE));
}

batches.forEach((batch, i) => {
  const padded = String(i + 1).padStart(2, "0");
  writeFileSync(join(runsDir, `_liveness-batch-${padded}.json`), JSON.stringify(batch, null, 2) + "\n");
});

console.log(`Wrote ${batches.length} batches of up to ${BATCH_SIZE} URLs each.`);
