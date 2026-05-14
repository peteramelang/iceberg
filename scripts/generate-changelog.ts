import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

interface ChangelogEntry { sha: string; date: string; message: string; touchedTopics: string[]; }

const log = execSync(
  `git log --pretty=format:%H%x00%ad%x00%s --date=iso-strict --name-only -- content/`,
  { cwd: repoRoot }
).toString();

const entries: ChangelogEntry[] = [];
const blocks = log.split(/\n\n+/);
for (const block of blocks) {
  const lines = block.split("\n").filter(Boolean);
  if (lines.length === 0) continue;
  const header = lines[0]!;
  const parts = header.split("\0");
  if (parts.length < 3) continue;
  const [sha, date, message] = parts as [string, string, string];
  const files = lines.slice(1);
  const touchedTopics = Array.from(new Set(
    files
      .filter(f => f.startsWith("content/") && f.endsWith(".md"))
      .map(f => f.split("/").pop()!.replace(/\.md$/, ""))
      .filter(slug => !slug.startsWith("_"))
  ));
  if (touchedTopics.length === 0) continue;
  entries.push({ sha: sha.slice(0, 7), date, message, touchedTopics });
}

mkdirSync(join(repoRoot, "app", "public"), { recursive: true });
writeFileSync(join(repoRoot, "app", "public", "changelog.json"), JSON.stringify(entries, null, 2) + "\n");
console.log(`Wrote ${entries.length} changelog entries to app/public/changelog.json`);
