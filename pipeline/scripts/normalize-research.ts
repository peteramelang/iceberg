import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

interface VideoResource {
  url: string;
  title: string;
  author: string;
  durationMinutes: number;
  addedAt: string;
  reasoning: string;
}

interface ArticleResource {
  url: string;
  title: string;
  kind: "canonical-doc" | "engineering-blog" | "tutorial";
  reasoning: string;
}

interface ServiceResource {
  name: string;
  url: string;
  category: string;
  reasoning: string;
}

interface CourseResource {
  url: string;
  title: string;
  provider: string;
  paid: boolean;
  reasoning: string;
}

interface Normalized {
  agentId: string;
  definition: string;
  resources: {
    videos: { short: VideoResource | null; long: VideoResource | null };
    articles: ArticleResource[];
    services: ServiceResource[];
    courses: CourseResource[];
  };
}

function isValidUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch {
    return false;
  }
}

function isYouTubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
}

function classifyAsService(url: string): boolean {
  const u = url.toLowerCase();
  // Service home pages: short paths, root domains, or product/platform-style URLs
  if (u.match(/\/docs?\/|\/blog\/|\/article|\/guide/)) return false;
  if (u.match(/\/(spec|specification|rfc|whitepaper)/)) return false;
  // count path segments
  const path = u.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
  const segments = path.split("/").filter(Boolean);
  return segments.length <= 2;
}

function isCourse(item: { url?: string; title?: string; provider?: string }): boolean {
  if (item.provider) return true;
  const haystack = ((item.title ?? "") + " " + (item.url ?? "")).toLowerCase();
  return /course|udemy|coursera|pluralsight|linkedin\/learning|reforge|educative|bytebytego|frontendmasters|egghead/.test(haystack);
}

function asArticleKind(value: unknown): ArticleResource["kind"] {
  if (value === "canonical-doc" || value === "engineering-blog" || value === "tutorial") return value;
  const s = String(value ?? "").toLowerCase();
  if (s.includes("doc") || s.includes("spec") || s.includes("reference") || s.includes("canonical")) return "canonical-doc";
  if (s.includes("blog") || s.includes("eng")) return "engineering-blog";
  return "tutorial";
}

interface RawItem {
  url?: unknown;
  title?: unknown;
  name?: unknown;
  source?: unknown;
  kind?: unknown;
  category?: unknown;
  provider?: unknown;
  paid?: unknown;
  durationMinutes?: unknown;
  reasoning?: unknown;
  description?: unknown;
  author?: unknown;
}

function pushItem(out: Normalized, item: RawItem): void {
  const url = item.url ?? item.source;
  if (!isValidUrl(url)) return;

  const title = String(item.title ?? item.name ?? url);
  const reasoning = String(item.reasoning ?? item.description ?? "");

  if (isYouTubeUrl(url)) {
    const dm = typeof item.durationMinutes === "number" && item.durationMinutes >= 1
      ? Math.floor(item.durationMinutes)
      : 10;
    const video: VideoResource = {
      url,
      title,
      author: String(item.author ?? "Unknown"),
      durationMinutes: dm,
      addedAt: "2026-05-14T00:00:00Z",
      reasoning: reasoning || "(no reasoning captured)"
    };
    if (dm <= 18 && !out.resources.videos.short) {
      out.resources.videos.short = video;
    } else if (!out.resources.videos.long) {
      out.resources.videos.long = video;
    } else if (!out.resources.videos.short) {
      out.resources.videos.short = video;
    }
    return;
  }

  if (isCourse(item as { url?: string; title?: string; provider?: string })) {
    out.resources.courses.push({
      url,
      title,
      provider: String(item.provider ?? "(unspecified)"),
      paid: typeof item.paid === "boolean" ? item.paid : false,
      reasoning: reasoning || "(no reasoning captured)"
    });
    return;
  }

  if (classifyAsService(url)) {
    out.resources.services.push({
      name: String(item.name ?? title),
      url,
      category: String(item.category ?? "platform"),
      reasoning: reasoning || "(no reasoning captured)"
    });
    return;
  }

  out.resources.articles.push({
    url,
    title,
    kind: asArticleKind(item.kind),
    reasoning: reasoning || "(no reasoning captured)"
  });
}

function looksLikeRawItem(value: unknown): value is RawItem {
  return typeof value === "object" && value !== null
    && (("url" in value) || ("source" in value));
}

function normalize(raw: unknown, slug: string): Normalized | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  // If already conforming, fix up any missing sub-arrays and return.
  if (typeof r.agentId === "string" && typeof r.definition === "string"
      && typeof r.resources === "object" && r.resources !== null) {
    const existing = r as unknown as Normalized;
    existing.resources.videos ??= { short: null, long: null };
    existing.resources.videos.short ??= null;
    existing.resources.videos.long ??= null;
    existing.resources.articles ??= [];
    existing.resources.services ??= [];
    existing.resources.courses ??= [];
    return existing;
  }

  // Drifted shape: build from scratch.
  const out: Normalized = {
    agentId: `agent-${slug}`,
    definition: typeof r.definition === "string" ? r.definition
      : typeof r.summary === "string" ? r.summary
      : `Curated resources for ${slug}.`,
    resources: {
      videos: { short: null, long: null },
      articles: [],
      services: [],
      courses: []
    }
  };

  // Look for any array of items at root and common keys.
  const arrayKeys = ["sources", "resources", "items", "findings", "entries"];
  for (const key of arrayKeys) {
    const v = r[key];
    if (Array.isArray(v)) {
      for (const item of v) if (looksLikeRawItem(item)) pushItem(out, item);
    }
  }

  // Also: r.resources may be an object with arrays like services/articles
  if (typeof r.resources === "object" && r.resources !== null && !Array.isArray(r.resources)) {
    const subRes = r.resources as Record<string, unknown>;
    for (const key of ["services", "articles", "courses", "videos", "items"]) {
      const v = subRes[key];
      if (Array.isArray(v)) {
        for (const item of v) if (looksLikeRawItem(item)) pushItem(out, item);
      } else if (typeof v === "object" && v !== null && key === "videos") {
        const vids = v as Record<string, unknown>;
        for (const slot of ["short", "long"]) {
          const candidate = vids[slot];
          if (looksLikeRawItem(candidate)) pushItem(out, candidate);
        }
      }
    }
  }

  // Other root keys some drifted agents used.
  for (const key of ["services", "articles", "courses", "videos", "tools", "platforms"]) {
    const v = r[key];
    if (Array.isArray(v)) {
      for (const item of v) if (looksLikeRawItem(item)) pushItem(out, item);
    }
  }

  return out;
}

function deepFreeze<T>(v: T): T { return v; }

function patchFile(path: string, slug: string): { ok: boolean; reason?: string } {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const normalized = normalize(raw, slug);
  if (!normalized) return { ok: false, reason: "could not extract anything" };

  // Trim definition to a reasonable size; keep at least one paragraph.
  if (!normalized.definition || normalized.definition.length < 40) {
    normalized.definition = `Curated learning resources for ${slug}. Definition pending manual edit.`;
  }

  // Cap counts to schema limits (articles ≤5, services ≤8, courses ≤4).
  normalized.resources.articles = normalized.resources.articles.slice(0, 5);
  normalized.resources.services = normalized.resources.services.slice(0, 8);
  normalized.resources.courses = normalized.resources.courses.slice(0, 4);

  writeFileSync(path, JSON.stringify(deepFreeze(normalized), null, 2) + "\n");
  return { ok: true };
}

const files = readdirSync(runsDir).filter(f => f.startsWith("research-") && f.endsWith(".json"));
let normalized = 0;
let unchanged = 0;
let failed = 0;

for (const file of files) {
  const slug = file.replace(/^research-/, "").replace(/-a$/, "").replace(/\.json$/, "").replace(/-a$/, "");
  const path = join(runsDir, file);
  const before = readFileSync(path, "utf8");
  const result = patchFile(path, slug);
  const after = readFileSync(path, "utf8");
  if (!result.ok) {
    failed++;
    console.log(`FAILED: ${file} (${result.reason})`);
  } else if (before === after) {
    unchanged++;
  } else {
    normalized++;
    console.log(`NORMALIZED: ${file}`);
  }
}

console.log(`\nTotal: ${files.length} files. Normalized: ${normalized}. Unchanged: ${unchanged}. Failed: ${failed}.`);
