import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

type AnyObj = Record<string, unknown>;

const VIDEO_KEYS = new Set(["url", "title", "author", "durationMinutes", "addedAt", "reasoning"]);
const ARTICLE_KEYS = new Set(["url", "title", "kind", "reasoning"]);
const SERVICE_KEYS = new Set(["name", "url", "category", "reasoning"]);
const COURSE_KEYS = new Set(["url", "title", "provider", "paid", "reasoning"]);

function trimToKeys(obj: AnyObj, allowed: Set<string>): AnyObj {
  const out: AnyObj = {};
  for (const k of Object.keys(obj)) if (allowed.has(k)) out[k] = obj[k];
  return out;
}

function ensureArticle(a: AnyObj): AnyObj {
  const trimmed = trimToKeys(a, ARTICLE_KEYS);
  if (typeof trimmed.url !== "string") return null as unknown as AnyObj;
  trimmed.title ??= trimmed.url;
  trimmed.kind ??= "canonical-doc";
  trimmed.reasoning ??= "";
  return trimmed;
}

function ensureService(s: AnyObj): AnyObj {
  const trimmed = trimToKeys(s, SERVICE_KEYS);
  if (typeof trimmed.url !== "string") return null as unknown as AnyObj;
  trimmed.name ??= trimmed.url;
  trimmed.category ??= "platform";
  trimmed.reasoning ??= "";
  return trimmed;
}

function ensureCourse(c: AnyObj): AnyObj {
  const trimmed = trimToKeys(c, COURSE_KEYS);
  if (typeof trimmed.url !== "string") return null as unknown as AnyObj;
  trimmed.title ??= trimmed.url;
  trimmed.provider ??= "(unspecified)";
  if (typeof trimmed.paid !== "boolean") trimmed.paid = false;
  trimmed.reasoning ??= "";
  return trimmed;
}

function ensureVideo(v: AnyObj | null): AnyObj | null {
  if (v === null || v === undefined) return null;
  const trimmed = trimToKeys(v, VIDEO_KEYS);
  if (typeof trimmed.url !== "string") return null;
  if (!/^https?:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)/.test(trimmed.url as string)) return null;
  trimmed.title ??= trimmed.url;
  trimmed.author ??= "Unknown";
  if (typeof trimmed.durationMinutes !== "number" || (trimmed.durationMinutes as number) < 1) trimmed.durationMinutes = 10;
  trimmed.durationMinutes = Math.floor(trimmed.durationMinutes as number);
  trimmed.addedAt ??= "2026-05-14T00:00:00Z";
  trimmed.reasoning ??= "";
  return trimmed;
}

const files = readdirSync(runsDir).filter(f => f.startsWith("research-") && f.endsWith(".json"));
let fixed = 0;

for (const file of files) {
  const path = join(runsDir, file);
  const raw = JSON.parse(readFileSync(path, "utf8")) as AnyObj;
  if (typeof raw !== "object" || raw === null) continue;

  // Top-level: only agentId, definition, resources allowed.
  const out: AnyObj = {
    agentId: typeof raw.agentId === "string" ? raw.agentId : `agent-${file.replace(/^research-/, "").replace(/\.json$/, "")}`,
    definition: typeof raw.definition === "string" && raw.definition.length > 0
      ? raw.definition
      : `Curated learning resources. Definition pending.`,
    resources: {
      videos: { short: null as unknown, long: null as unknown },
      articles: [] as AnyObj[],
      services: [] as AnyObj[],
      courses: [] as AnyObj[]
    }
  };

  const resources = raw.resources as AnyObj | undefined;
  if (resources && typeof resources === "object") {
    const videos = (resources.videos as AnyObj | undefined);
    if (videos && typeof videos === "object") {
      (out.resources as AnyObj).videos = {
        short: ensureVideo(videos.short as AnyObj | null),
        long: ensureVideo(videos.long as AnyObj | null)
      };
    }

    const articles = resources.articles;
    if (Array.isArray(articles)) {
      const arr: AnyObj[] = [];
      for (const a of articles) {
        if (a && typeof a === "object") {
          const v = ensureArticle(a as AnyObj);
          if (v) arr.push(v);
        }
      }
      (out.resources as AnyObj).articles = arr.slice(0, 5);
    }

    const services = resources.services;
    if (Array.isArray(services)) {
      const arr: AnyObj[] = [];
      for (const s of services) {
        if (s && typeof s === "object") {
          const v = ensureService(s as AnyObj);
          if (v) arr.push(v);
        }
      }
      (out.resources as AnyObj).services = arr.slice(0, 8);
    }

    const courses = resources.courses;
    if (Array.isArray(courses)) {
      const arr: AnyObj[] = [];
      for (const c of courses) {
        if (c && typeof c === "object") {
          const v = ensureCourse(c as AnyObj);
          if (v) arr.push(v);
        }
      }
      (out.resources as AnyObj).courses = arr.slice(0, 4);
    }
  }

  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  fixed++;
}

console.log(`Stripped extras in ${fixed} files.`);
