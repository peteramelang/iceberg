import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAllTopics } from "../lib/content.js";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

const mode = process.env.ICEBERG_MODE === "smoke" ? "smoke" : "full";
const contentDir = mode === "smoke" ? join(repoRoot, "content-smoke") : join(repoRoot, "content");

if (!existsSync(contentDir)) {
  console.error(`Content dir ${contentDir} does not exist. Run the pipeline first.`);
  process.exit(1);
}

const taxonomyPath = join(contentDir, "_taxonomy.json");
const connectionsPath = join(contentDir, "_connections.json");
const pathsPath = join(contentDir, "_paths.json");

const taxonomy = existsSync(taxonomyPath) ? JSON.parse(readFileSync(taxonomyPath, "utf8")) : null;
const connections = existsSync(connectionsPath) ? JSON.parse(readFileSync(connectionsPath, "utf8")) : { version: 1, edges: [] };
const paths = existsSync(pathsPath) ? JSON.parse(readFileSync(pathsPath, "utf8")) : null;

const topics = parseAllTopics(contentDir);

const bundle = {
  generatedAt: new Date().toISOString(),
  mode,
  taxonomy,
  connections,
  topics: topics.map(t => ({ frontmatter: t.frontmatter, body: t.body })),
  paths
};

const out = join(repoRoot, "app", "src", "content", "topics.generated.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(bundle, null, 2) + "\n");

console.log(`Wrote ${topics.length} topics to ${out}`);
