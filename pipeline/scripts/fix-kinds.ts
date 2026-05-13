import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

type Kind = "canonical-doc" | "engineering-blog" | "tutorial";

function mapKind(input: unknown, url: string): Kind {
  const v = String(input ?? "").toLowerCase();
  const u = url.toLowerCase();

  // Direct hits
  if (v === "canonical-doc" || v === "engineering-blog" || v === "tutorial") return v;

  // URL-based heuristics first (more reliable than kind tags)
  if (u.includes("/blog/") || u.includes("/posts/") || u.includes("medium.com/")) return "engineering-blog";
  if (u.includes("/docs/") || u.includes("/spec") || u.includes("/reference") || u.includes("rfc")) return "canonical-doc";
  if (u.includes("/tutorial") || u.includes("/learn/") || u.includes("/getting-started")) return "tutorial";

  // Map common drifted strings
  if (v.includes("blog") || v.includes("essay") || v.includes("analysis")) return "engineering-blog";
  if (v.includes("doc") || v.includes("spec") || v.includes("reference") || v.includes("rfc") || v.includes("standard") || v.includes("whitepaper") || v.includes("handbook") || v.includes("official") || v.includes("vendor") || v.includes("foundation") || v.includes("research") || v.includes("pattern")) return "canonical-doc";
  if (v.includes("tutorial") || v.includes("guide") || v.includes("comparison") || v.includes("best-practice")) return "tutorial";

  // Default
  return "canonical-doc";
}

const files = readdirSync(runsDir).filter(f => f.startsWith("research-") && f.endsWith(".json"));
let fixed = 0;
let unchanged = 0;

interface Article { url: string; title: string; kind: unknown; reasoning: string; }

for (const file of files) {
  const path = join(runsDir, file);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (typeof raw !== "object" || raw === null) continue;

  const articles = raw?.resources?.articles;
  if (!Array.isArray(articles)) continue;

  let changed = false;
  for (const a of articles as Article[]) {
    if (typeof a !== "object" || a === null) continue;
    const url = typeof a.url === "string" ? a.url : "";
    const mapped = mapKind(a.kind, url);
    if (a.kind !== mapped) {
      a.kind = mapped;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(raw, null, 2) + "\n");
    fixed++;
    console.log(`FIXED: ${file}`);
  } else {
    unchanged++;
  }
}

console.log(`\nTotal: ${files.length}. Fixed: ${fixed}. Unchanged: ${unchanged}.`);
