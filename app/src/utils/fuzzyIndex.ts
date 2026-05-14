import Fuse from "fuse.js";
import { taxonomy, topics, connections, paths } from "../content/index.js";

export type SearchKind = "topic" | "phase" | "resource" | "connection" | "path";

export interface SearchItem {
  kind: SearchKind;
  id: string;          // unique key for React
  title: string;
  subtitle: string;    // parent topic / phase / "type"
  text: string;        // searchable haystack
  href: string;
  badge?: string;
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  if (taxonomy) {
    for (const phase of taxonomy.phases) {
      items.push({
        kind: "phase",
        id: `phase:${phase.slug}`,
        title: phase.title,
        subtitle: "Phase",
        text: `${phase.title} ${phase.description}`,
        href: `/phase/${phase.slug}`
      });
    }
  }

  for (const t of topics) {
    const fm = t.frontmatter;
    items.push({
      kind: "topic",
      id: `topic:${fm.slug}`,
      title: fm.title,
      subtitle: taxonomy?.phases.find(p => p.slug === fm.phase)?.title ?? fm.phase,
      text: `${fm.title} ${fm.summary} ${fm.definition} ${fm.slug}`,
      href: `/topic/${fm.slug}`,
      badge: fm.difficulty
    });

    const phaseTitle = taxonomy?.phases.find(p => p.slug === fm.phase)?.title ?? fm.phase;
    if (fm.resources.videos.short) {
      const v = fm.resources.videos.short;
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:videos.short`,
        title: v.title,
        subtitle: `Video · in ${fm.title}`,
        text: `${v.title} ${v.author} ${fm.title} ${phaseTitle}`,
        href: `/topic/${fm.slug}#videos`,
        badge: "Video"
      });
    }
    if (fm.resources.videos.long) {
      const v = fm.resources.videos.long;
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:videos.long`,
        title: v.title,
        subtitle: `Video · in ${fm.title}`,
        text: `${v.title} ${v.author} ${fm.title} ${phaseTitle}`,
        href: `/topic/${fm.slug}#videos`,
        badge: "Video"
      });
    }
    fm.resources.articles.forEach((a, i) => {
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:articles.${i}`,
        title: a.title,
        subtitle: `Article · in ${fm.title}`,
        text: `${a.title} ${a.publisher ?? ""} ${a.author ?? ""} ${fm.title}`,
        href: `/topic/${fm.slug}#articles`,
        badge: "Article"
      });
    });
    fm.resources.services.forEach((s, i) => {
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:services.${i}`,
        title: s.name,
        subtitle: `Service · in ${fm.title}`,
        text: `${s.name} ${s.vendor ?? ""} ${s.category} ${fm.title}`,
        href: `/topic/${fm.slug}#services`,
        badge: "Service"
      });
    });
    fm.resources.courses.forEach((c, i) => {
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:courses.${i}`,
        title: c.title,
        subtitle: `Course · in ${fm.title}`,
        text: `${c.title} ${c.provider} ${fm.title}`,
        href: `/topic/${fm.slug}#courses`,
        badge: "Course"
      });
    });
  }

  for (const p of paths) {
    items.push({
      kind: "path",
      id: `path:${p.slug}`,
      title: p.title,
      subtitle: `Path · ${p.audience}`,
      text: `${p.title} ${p.description} ${p.audience}`,
      href: `/path/${p.slug}`
    });
  }

  const titleBySlug = new Map<string, string>();
  for (const t of topics) titleBySlug.set(t.frontmatter.slug, t.frontmatter.title);
  for (const e of connections) {
    const fromTitle = titleBySlug.get(e.from) ?? e.from;
    const toTitle = titleBySlug.get(e.to) ?? e.to;
    items.push({
      kind: "connection",
      id: `conn:${e.from}-${e.type}-${e.to}`,
      title: `${fromTitle} → ${toTitle}`,
      subtitle: `${e.type.replace("-", " ")} connection`,
      text: `${fromTitle} ${toTitle} ${e.type} ${e.reasoning}`,
      href: `/topic/${e.from}#connections`,
      badge: e.type
    });
  }

  return items;
}

let _fuse: Fuse<SearchItem> | null = null;
let _items: SearchItem[] = [];

export function getFuse(): { fuse: Fuse<SearchItem>; items: SearchItem[] } {
  if (!_fuse) {
    _items = buildIndex();
    _fuse = new Fuse(_items, {
      keys: [
        { name: "title", weight: 0.6 },
        { name: "text", weight: 0.4 }
      ],
      threshold: 0.38,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2
    });
  }
  return { fuse: _fuse, items: _items };
}
