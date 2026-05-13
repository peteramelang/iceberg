import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");

interface UrlEntry {
  slug: string;
  slotPath: string;
  url: string;
  kind: "video" | "article" | "service" | "course";
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

const urls: UrlEntry[] = [];

for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const slug = fm.slug;

  if (fm.resources.videos.short) {
    urls.push({ slug, slotPath: "videos.short", url: fm.resources.videos.short.url, kind: "video" });
  }
  if (fm.resources.videos.long) {
    urls.push({ slug, slotPath: "videos.long", url: fm.resources.videos.long.url, kind: "video" });
  }
  fm.resources.articles.forEach((a, i) => {
    urls.push({ slug, slotPath: `articles.${i}`, url: a.url, kind: "article" });
  });
  fm.resources.services.forEach((s, i) => {
    urls.push({ slug, slotPath: `services.${i}`, url: s.url, kind: "service" });
  });
  fm.resources.courses.forEach((c, i) => {
    urls.push({ slug, slotPath: `courses.${i}`, url: c.url, kind: "course" });
  });
}

writeFileSync(join(repoRoot, ".git", "iceberg-runs", "_urls-to-check.json"), JSON.stringify(urls, null, 2) + "\n");
console.log(`Collected ${urls.length} URLs across ${files.length} topics.`);
