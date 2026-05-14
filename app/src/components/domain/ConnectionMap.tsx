import { Link } from "react-router-dom";
import { connectionsForTopic, topByWeight, EDGE_TOKEN, EDGE_LABEL, type EdgeType, type RelatedConnection } from "../../utils/connectionHelpers.js";

const W = 300;
const H = 260;
const CX = 150;
const CY = 140;
const CENTER_R = 28;
const NODE_R = 22;

type Slot = { x: number; y: number };

// Preferred center of each type's arc (degrees, SVG convention: 0 = right, 90 = down).
// Order around the circle: related top-left, often-confused top-right, pairs-with
// bottom-right, prerequisite bottom-left. Types are placed in EDGE_ORDER, walking
// clockwise from "related" to keep prereqs in the lower-left ("foundation") quadrant.
const TYPE_PREFERRED_CENTER: Record<EdgeType, number> = {
  "related": 135,
  "often-confused-with": 45,
  "pairs-with": 315,
  "prerequisite": 225
};

const TYPE_ARC_ORDER: EdgeType[] = ["related", "often-confused-with", "pairs-with", "prerequisite"];
const RADIUS = 95;
// 2 * asin(NODE_R / RADIUS) is the minimum angular gap to avoid node overlap.
// With NODE_R=22 and RADIUS=95, that's ~26.7°; round up for breathing room.
const MIN_ARC_PER_NODE_DEG = 28;

function layout(items: RelatedConnection[]): Map<RelatedConnection, Slot> {
  const out = new Map<RelatedConnection, Slot>();
  const byType: Record<EdgeType, RelatedConnection[]> = {
    "prerequisite": [], "pairs-with": [], "related": [], "often-confused-with": []
  };
  for (const it of items) byType[it.type].push(it);

  // Each type claims an arc proportional to its node count (min one slot) centered
  // on its preferred quadrant. When one type dominates (e.g. api-versioning has 7
  // related, 0 others) its arc spills past 90° into adjacent quadrants — which is
  // safe because those quadrants are empty. Cross-type collisions only become
  // possible when both adjacent types are heavily populated AND the central type
  // has >3 nodes; with a 8-node cap and 4 types that's not reachable.
  for (const type of TYPE_ARC_ORDER) {
    const list = byType[type];
    if (list.length === 0) continue;
    const arcWidth = list.length === 1 ? 0 : (list.length - 1) * MIN_ARC_PER_NODE_DEG;
    const center = TYPE_PREFERRED_CENTER[type];
    const start = center - arcWidth / 2;
    list.forEach((it, idx) => {
      const deg = list.length === 1 ? center : start + idx * MIN_ARC_PER_NODE_DEG;
      const rad = (deg * Math.PI) / 180;
      out.set(it, { x: CX + Math.cos(rad) * RADIUS, y: CY + Math.sin(rad) * RADIUS });
    });
  }
  return out;
}

export function ConnectionMap({ topicSlug, topicTitle }: { topicSlug: string; topicTitle: string }) {
  const all = connectionsForTopic(topicSlug);
  const visible = topByWeight(all, 8);
  const slots = layout(visible);
  const extra = all.length - visible.length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Topic connection map">
        <defs>
          <marker id="cm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--edge-prereq)" />
          </marker>
        </defs>
        {visible.map(c => {
          const s = slots.get(c);
          if (!s) return null;
          const color = EDGE_TOKEN[c.type];
          const dashed = c.type === "pairs-with";
          const arrow = c.type === "prerequisite";
          return (
            <line
              key={`edge-${c.type}-${c.otherSlug}`}
              x1={s.x} y1={s.y} x2={CX} y2={CY}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={dashed ? "3 3" : undefined}
              markerEnd={arrow ? "url(#cm-arrow)" : undefined}
              opacity={0.9}
            />
          );
        })}
        <g>
          <circle cx={CX} cy={CY} r={CENTER_R} fill="var(--accent)" />
          <text x={CX} y={CY + 4} textAnchor="middle" fill="var(--bg)" fontSize="10" fontWeight={600}>
            {truncate(topicTitle, 14)}
          </text>
        </g>
        {visible.map(c => {
          const s = slots.get(c);
          if (!s) return null;
          const color = EDGE_TOKEN[c.type];
          return (
            <g key={`node-${c.type}-${c.otherSlug}`}>
              <a href={`/topic/${c.otherSlug}`} aria-label={`${c.otherTitle} — ${EDGE_LABEL[c.type]}`}>
                <circle cx={s.x} cy={s.y} r={NODE_R} fill="var(--panel-2)" stroke={color} />
                <text x={s.x} y={s.y - 2} textAnchor="middle" fill={color} fontSize="8.5">{EDGE_LABEL[c.type].split(" ")[0]?.toLowerCase()}</text>
                <text x={s.x} y={s.y + 9} textAnchor="middle" fill="var(--text)" fontSize="9.5">{truncate(c.otherTitle, 11)}</text>
              </a>
            </g>
          );
        })}
      </svg>
      <div className="mt-xs flex flex-wrap gap-md text-caption text-text-dim">
        <Legend color={EDGE_TOKEN.prerequisite} label="prerequisite" />
        <Legend color={EDGE_TOKEN["pairs-with"]} label="pairs-with" dashed />
        <Legend color={EDGE_TOKEN.related} label="related" />
        <Legend color={EDGE_TOKEN["often-confused-with"]} label="often confused" />
      </div>
      <div className="mt-sm">
        <Link to={`/graph?focus=${topicSlug}`} className="text-accent text-body hover:text-accent-hover">
          Open in graph view →
        </Link>
        {extra > 0 && <span className="ml-md text-text-dim text-caption">+{extra} more</span>}
      </div>
    </div>
  );
}

function Legend({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-xs">
      <span style={{ width: 10, height: 0, borderTop: `${dashed ? "1.5px dashed" : "1.5px solid"} ${color}` }} />
      <span>{label}</span>
    </span>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
