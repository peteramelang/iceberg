import type { ConnectionEdge } from "../content/types.js";
import { connections, topics } from "../content/index.js";

export type EdgeType = ConnectionEdge["type"];

export const EDGE_ORDER: EdgeType[] = ["prerequisite", "pairs-with", "related", "often-confused-with"];

export const EDGE_LABEL: Record<EdgeType, string> = {
  "prerequisite": "Prerequisite",
  "pairs-with": "Pairs with",
  "related": "Related",
  "often-confused-with": "Often confused with"
};

export const EDGE_HINT: Record<EdgeType, string> = {
  "prerequisite": "things to understand first",
  "pairs-with": "studied alongside this topic",
  "related": "topics in adjacent areas",
  "often-confused-with": "distinct from this topic"
};

export const EDGE_GLYPH: Record<EdgeType, string> = {
  "prerequisite": "→",
  "pairs-with": "↔",
  "related": "•",
  "often-confused-with": "≠"
};

export const EDGE_TOKEN: Record<EdgeType, string> = {
  "prerequisite": "var(--edge-prereq)",
  "pairs-with": "var(--edge-pairs)",
  "related": "var(--edge-related)",
  "often-confused-with": "var(--edge-confused)"
};

export interface RelatedConnection {
  type: EdgeType;
  otherSlug: string;       // the topic that isn't the current one
  otherTitle: string;
  reasoning: string;
  weight: number;
  direction: "outgoing" | "incoming";
}

const TITLE_BY_SLUG: ReadonlyMap<string, string> = (() => {
  const m = new Map<string, string>();
  for (const t of topics) m.set(t.frontmatter.slug, t.frontmatter.title);
  return m;
})();

export function connectionsForTopic(slug: string): RelatedConnection[] {
  const out: RelatedConnection[] = [];
  for (const e of connections) {
    if (e.from === slug) {
      out.push({ type: e.type, otherSlug: e.to, otherTitle: TITLE_BY_SLUG.get(e.to) ?? e.to, reasoning: e.reasoning, weight: e.weight, direction: "outgoing" });
    } else if (e.to === slug) {
      out.push({ type: e.type, otherSlug: e.from, otherTitle: TITLE_BY_SLUG.get(e.from) ?? e.from, reasoning: e.reasoning, weight: e.weight, direction: "incoming" });
    }
  }
  return out;
}

export function groupConnections(items: RelatedConnection[]): Record<EdgeType, RelatedConnection[]> {
  const out: Record<EdgeType, RelatedConnection[]> = {
    "prerequisite": [], "pairs-with": [], "related": [], "often-confused-with": []
  };
  for (const c of items) out[c.type].push(c);
  for (const k of EDGE_ORDER) out[k].sort((a, b) => b.weight - a.weight);
  return out;
}

export function topByWeight(items: RelatedConnection[], n: number): RelatedConnection[] {
  return [...items].sort((a, b) => b.weight - a.weight).slice(0, n);
}
