import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type TopicFrontmatter } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

type Status = "alive" | "dead" | "changed";

interface ResultRow {
  slug: string;
  slotPath: string;
  url: string;
  status: Status | string;
  evidence?: string;
}

interface BatchFile {
  batchId: string;
  results: ResultRow[];
}

const resultFiles = readdirSync(runsDir)
  .filter(f => f.startsWith("_liveness-results-") && f.endsWith(".json"))
  .map(f => join(runsDir, f));

function reclassify(row: ResultRow): Status {
  const evidence = (row.evidence ?? "").toLowerCase();
  // Conservative: agents often report "dead" for URLs they couldn't fetch due to
  // network/security/enterprise policies, 403s, or unreachable-from-this-environment
  // reasons. Those URLs are very likely alive. Downgrade them to "alive".
  if (row.status === "dead") {
    if (
      evidence.includes("blocked") ||
      evidence.includes("security policy") ||
      evidence.includes("enterprise") ||
      evidence.includes("forbidden") ||
      evidence.includes("403") ||
      evidence.includes("network restriction") ||
      evidence.includes("certificate") ||
      evidence.includes("cannot connect") ||
      evidence.includes("unable to fetch") ||
      evidence.includes("ssl") ||
      evidence.includes("tls")
    ) {
      return "alive";
    }
  }
  if (row.status === "alive" || row.status === "dead" || row.status === "changed") {
    return row.status as Status;
  }
  return "alive"; // unknown / blocked → conservative
}

const byTopic = new Map<string, Map<string, Status>>();
for (const path of resultFiles) {
  const batch = JSON.parse(readFileSync(path, "utf8")) as BatchFile;
  for (const row of batch.results) {
    let slotMap = byTopic.get(row.slug);
    if (!slotMap) {
      slotMap = new Map();
      byTopic.set(row.slug, slotMap);
    }
    slotMap.set(row.slotPath, reclassify(row));
  }
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

let droppedVideos = 0;
let droppedArticles = 0;
let droppedServices = 0;
let droppedCourses = 0;
let topicsTouched = 0;
let topicsManualPick = 0;

for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const slotMap = byTopic.get(fm.slug);
  if (!slotMap) continue;

  let changed = false;

  // Videos
  if (fm.resources.videos.short && slotMap.get("videos.short") === "dead") {
    fm.resources.videos.short = null;
    droppedVideos++;
    changed = true;
  }
  if (fm.resources.videos.long && slotMap.get("videos.long") === "dead") {
    fm.resources.videos.long = null;
    droppedVideos++;
    changed = true;
  }

  // Articles
  const keptArticles = [];
  for (let i = 0; i < fm.resources.articles.length; i++) {
    if (slotMap.get(`articles.${i}`) === "dead") {
      droppedArticles++;
      changed = true;
    } else {
      keptArticles.push(fm.resources.articles[i]!);
    }
  }
  fm.resources.articles = keptArticles;

  // Services
  const keptServices = [];
  for (let i = 0; i < fm.resources.services.length; i++) {
    if (slotMap.get(`services.${i}`) === "dead") {
      droppedServices++;
      changed = true;
    } else {
      keptServices.push(fm.resources.services[i]!);
    }
  }
  fm.resources.services = keptServices;

  // Courses
  const keptCourses = [];
  for (let i = 0; i < fm.resources.courses.length; i++) {
    if (slotMap.get(`courses.${i}`) === "dead") {
      droppedCourses++;
      changed = true;
    } else {
      keptCourses.push(fm.resources.courses[i]!);
    }
  }
  fm.resources.courses = keptCourses;

  if (changed) {
    topicsTouched++;
    // If nothing remains (no videos, no articles, no services, no courses), flag for manual pick
    const empty =
      fm.resources.videos.short === null &&
      fm.resources.videos.long === null &&
      fm.resources.articles.length === 0 &&
      fm.resources.services.length === 0 &&
      fm.resources.courses.length === 0;
    if (empty) {
      fm.needsManualPick = true;
      topicsManualPick++;
    }
    writeTopicFile(path, fm as TopicFrontmatter, body);
  }
}

console.log(`Topics touched: ${topicsTouched}`);
console.log(`Dropped — videos: ${droppedVideos}, articles: ${droppedArticles}, services: ${droppedServices}, courses: ${droppedCourses}`);
if (topicsManualPick > 0) console.log(`Topics flagged needsManualPick: ${topicsManualPick}`);
