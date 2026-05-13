import { writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");

interface CreditEntry {
  publisher: string;
  resourceCount: number;
  topics: Set<string>;
}

const credits = new Map<string, CreditEntry>();

function record(publisher: string | undefined | null, topicSlug: string): void {
  if (!publisher) return;
  let entry = credits.get(publisher);
  if (!entry) {
    entry = { publisher, resourceCount: 0, topics: new Set() };
    credits.set(publisher, entry);
  }
  entry.resourceCount++;
  entry.topics.add(topicSlug);
}

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

for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const slug = fm.slug;

  for (const v of [fm.resources.videos.short, fm.resources.videos.long]) {
    if (v) record(v.author, slug);
  }
  for (const a of fm.resources.articles) {
    if (a.publisher) record(a.publisher, slug);
    if (a.author) record(a.author, slug);
  }
  for (const s of fm.resources.services) {
    record(s.vendor ?? s.name, slug);
  }
  for (const c of fm.resources.courses) {
    record(c.provider, slug);
    if (c.instructor) record(c.instructor, slug);
  }
}

const sorted = Array.from(credits.values()).sort((a, b) =>
  a.publisher.localeCompare(b.publisher, "en", { sensitivity: "base" })
);

const lines: string[] = [];
lines.push("# Credits");
lines.push("");
lines.push("Iceberg curates learning resources created by the people and organizations below. This list is auto-generated from `content/**/*.md` by `pipeline/scripts/generate-credits.ts`. **The original creators retain all rights to their content; iceberg links to their work but does not redistribute it.**");
lines.push("");
lines.push(`Total contributors: **${sorted.length}** across **${files.length}** topics.`);
lines.push("");
lines.push("If you are listed here and would like attribution changed, removed, or a link replaced, please open an issue.");
lines.push("");
lines.push("---");
lines.push("");

for (const entry of sorted) {
  lines.push(`- **${entry.publisher}** — ${entry.resourceCount} resource${entry.resourceCount === 1 ? "" : "s"} across ${entry.topics.size} topic${entry.topics.size === 1 ? "" : "s"}`);
}

lines.push("");
lines.push("---");
lines.push("");
lines.push("## Foundational frameworks and references");
lines.push("");
lines.push("Beyond the per-resource credits above, the iceberg taxonomy and curriculum design draws on broader bodies of work:");
lines.push("");
lines.push("- **Google SRE Book and Workbook** — Site Reliability Engineering as a discipline; SLO/SLI vocabulary; incident response.");
lines.push("- **OWASP** — security cheat sheets, threat models, and authorization patterns.");
lines.push("- **Martin Fowler** — patterns for continuous delivery, feature toggles, evolutionary database design.");
lines.push("- **Cloud Native Computing Foundation (CNCF)** — vendor-neutral specifications and projects (OpenTelemetry, Prometheus, Kubernetes, Jaeger, OPA, Argo).");
lines.push("- **The Twelve-Factor App** — environment and configuration discipline.");
lines.push("- **AWS Builders' Library** — production-engineering practice notes.");
lines.push("- **Brendan Gregg, Aphyr (Kyle Kingsbury / Jepsen), Charity Majors and the observability community** — performance and reliability methodologies.");
lines.push("");
lines.push("---");
lines.push("");
lines.push("Generated " + new Date().toISOString().slice(0, 10) + ".");

writeFileSync(join(repoRoot, "CREDITS.md"), lines.join("\n") + "\n");
console.log(`Wrote CREDITS.md with ${sorted.length} contributors.`);
