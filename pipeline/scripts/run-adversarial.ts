import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

interface Card {
  slug: string;
  slotPath: string;
  slotKind: "video" | "article" | "service" | "course";
  current: unknown;
  topicContext: { summary: string; definition: string; narrative: string };
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

const cards: Card[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const ctx = { summary: fm.summary, definition: fm.definition, narrative: fm.narrative };
  if (fm.resources.videos.short) cards.push({ slug: fm.slug, slotPath: "videos.short", slotKind: "video", current: fm.resources.videos.short, topicContext: ctx });
  if (fm.resources.videos.long)  cards.push({ slug: fm.slug, slotPath: "videos.long",  slotKind: "video", current: fm.resources.videos.long,  topicContext: ctx });
  fm.resources.articles.forEach((a, i) => cards.push({ slug: fm.slug, slotPath: `articles.${i}`, slotKind: "article", current: a, topicContext: ctx }));
  fm.resources.services.forEach((s, i) => cards.push({ slug: fm.slug, slotPath: `services.${i}`, slotKind: "service", current: s, topicContext: ctx }));
  fm.resources.courses.forEach((c, i) => cards.push({ slug: fm.slug, slotPath: `courses.${i}`, slotKind: "course", current: c, topicContext: ctx }));
}

const BATCH = 50;
let batchN = 0;
for (let i = 0; i < cards.length; i += BATCH) {
  batchN++;
  const padded = String(batchN).padStart(2, "0");
  writeFileSync(join(runsDir, `adversarial-batch-${padded}.json`), JSON.stringify(cards.slice(i, i + BATCH), null, 2) + "\n");
}

console.log(`Wrote ${batchN} adversarial batches covering ${cards.length} slots.`);
