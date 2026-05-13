import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type CodeExample } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const ALLOWED = new Set(["typescript","javascript","python","go","rust","sql","bash","yaml","json","ruby","java","csharp"]);

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
  const resultPath = join(runsDir, `code-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { codeExamples?: CodeExample[] };
  const examples = (raw.codeExamples ?? []).filter(c =>
    ALLOWED.has(c?.language as string) &&
    typeof c?.title === "string" && c.title.length > 0 &&
    typeof c?.code === "string" && c.code.length >= 20 &&
    typeof c?.reasoning === "string" && c.reasoning.length > 0
  );
  if (examples.length < 1) {
    console.warn(`SKIP ${fm.slug}: no valid code examples`);
    skipped++;
    continue;
  }
  fm.codeExamples = examples.slice(0, 3);
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied code examples to ${applied} topics. Skipped: ${skipped}.`);
