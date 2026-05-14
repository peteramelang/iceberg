import { Link } from "react-router-dom";
import { connectionsForTopic, topByWeight, EDGE_TOKEN, EDGE_LABEL, type EdgeType, type RelatedConnection } from "../../utils/connectionHelpers.js";

const W = 300;
const H = 260;
const CX = 150;
const CY = 140;
const CENTER_R = 28;
const NODE_R = 22;

type Slot = { x: number; y: number };

const TYPE_BUCKET: Record<EdgeType, { angleStart: number; angleEnd: number }> = {
  "prerequisite": { angleStart: 200, angleEnd: 250 },
  "pairs-with":   { angleStart: 290, angleEnd: 340 },
  "related":      { angleStart: 100, angleEnd: 160 },
  "often-confused-with": { angleStart: 60, angleEnd: 90 }
};

function layout(items: RelatedConnection[]): Map<RelatedConnection, Slot> {
  const out = new Map<RelatedConnection, Slot>();
  const byType: Record<EdgeType, RelatedConnection[]> = {
    "prerequisite": [], "pairs-with": [], "related": [], "often-confused-with": []
  };
  for (const it of items) byType[it.type].push(it);
  for (const type of Object.keys(byType) as EdgeType[]) {
    const list = byType[type];
    const { angleStart, angleEnd } = TYPE_BUCKET[type];
    list.forEach((it, idx) => {
      const t = list.length === 1 ? 0.5 : idx / (list.length - 1);
      const deg = angleStart + t * (angleEnd - angleStart);
      const rad = (deg * Math.PI) / 180;
      const radius = 95;
      out.set(it, { x: CX + Math.cos(rad) * radius, y: CY + Math.sin(rad) * radius });
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
