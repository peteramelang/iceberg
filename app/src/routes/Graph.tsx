import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ReactFlow, Background, Controls, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { topics, connections, taxonomy } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { useResolvedTheme } from "../hooks/useResolvedTheme.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";

const EDGE_TYPES = ["prerequisite", "pairs-with", "related", "often-confused-with"] as const;
type EdgeType = typeof EDGE_TYPES[number];

const EDGE_COLOR_DARK: Record<EdgeType, string> = {
  "prerequisite": "#ff9f0a",
  "pairs-with": "#7c5cff",
  "related": "#5ac8fa",
  "often-confused-with": "#ff6b9d"
};
const EDGE_COLOR_LIGHT: Record<EdgeType, string> = {
  "prerequisite": "#b76b06",
  "pairs-with": "#5b3df5",
  "related": "#0a6db8",
  "often-confused-with": "#c01e6a"
};

function layoutNodes(): Map<string, { x: number; y: number }> {
  if (!taxonomy) return new Map();
  const out = new Map<string, { x: number; y: number }>();
  const phases = [...taxonomy.phases].sort((a, b) => a.order - b.order);
  phases.forEach((phase, pi) => {
    const angle = (pi / phases.length) * Math.PI * 2;
    const ringR = 360;
    const cx = Math.cos(angle) * ringR;
    const cy = Math.sin(angle) * ringR;
    phase.topics.forEach((slug, ti) => {
      const t = (ti / Math.max(phase.topics.length - 1, 1)) * Math.PI * 2;
      out.set(slug, {
        x: cx + Math.cos(t) * 80,
        y: cy + Math.sin(t) * 80
      });
    });
  });
  return out;
}

export function Graph() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const theme = useResolvedTheme();
  const [params] = useSearchParams();
  const focusSlug = params.get("focus");
  const phaseFilter = params.get("phase");

  const [enabled, setEnabled] = useState<Record<EdgeType, boolean>>({
    "prerequisite": true,
    "pairs-with": false,
    "related": false,
    "often-confused-with": false
  });
  const [selected, setSelected] = useState<string | null>(focusSlug);

  const EDGE_COLOR = theme === "dark" ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
  const positions = useMemo(layoutNodes, []);

  const nodes: Node[] = useMemo(() => topics
    .filter(t => !phaseFilter || t.frontmatter.phase === phaseFilter)
    .map(t => {
      const fm = t.frontmatter;
      const pos = positions.get(fm.slug) ?? { x: 0, y: 0 };
      const prog = progressStore.getTopicProgress(fm.slug);
      const done = prog.completed;
      const isSelected = selected === fm.slug;
      return {
        id: fm.slug,
        position: pos,
        data: { label: fm.title },
        style: {
          background: isSelected ? "var(--accent)" : done ? "var(--green)" : "var(--panel)",
          color: isSelected || done ? "var(--bg)" : "var(--text)",
          border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 8,
          padding: 6,
          fontSize: 11
        }
      };
    }), [phaseFilter, positions, selected]);

  const edges: Edge[] = useMemo(() => connections
    .filter(e => enabled[e.type as EdgeType])
    .filter(e => !phaseFilter || (
      topics.find(t => t.frontmatter.slug === e.from)?.frontmatter.phase === phaseFilter
      || topics.find(t => t.frontmatter.slug === e.to)?.frontmatter.phase === phaseFilter
    ))
    .map(e => ({
      id: `${e.from}-${e.type}-${e.to}`,
      source: e.from,
      target: e.to,
      animated: false,
      style: { stroke: EDGE_COLOR[e.type as EdgeType], strokeDasharray: e.type === "pairs-with" ? "4 4" : undefined }
    })), [enabled, phaseFilter, EDGE_COLOR]);

  const onNodeClick = useCallback((_: unknown, node: Node) => setSelected(node.id), []);
  const sel = selected ? topics.find(t => t.frontmatter.slug === selected)?.frontmatter : null;

  return (
    <div className="flex h-[calc(100dvh-52px)]">
      <div className="flex-1 relative">
        <div className="absolute top-md left-md z-10 flex gap-sm bg-panel border border-border-soft rounded-sm p-sm">
          {EDGE_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setEnabled(prev => ({ ...prev, [t]: !prev[t] }))}
              aria-pressed={enabled[t]}
              className={[
                "text-caption px-md py-xs rounded-sm border capitalize",
                enabled[t]
                  ? "border-current text-white"
                  : "border-border text-text-mute hover:text-text"
              ].join(" ")}
              style={enabled[t] ? { background: EDGE_COLOR[t], borderColor: EDGE_COLOR[t] } : undefined}
            >
              {t.replace(/-/g, " ")}
            </button>
          ))}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          colorMode={theme}
          fitView
        >
          <Background gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {sel && (
        <aside className="w-[280px] shrink-0 border-l border-border bg-panel p-lg overflow-y-auto scrollbar-thin">
          <button type="button" onClick={() => setSelected(null)} className="text-text-mute hover:text-text text-caption mb-md">× close</button>
          <h2 className="text-display-lg m-0 mb-xs">{sel.title}</h2>
          <DifficultyBadge difficulty={sel.difficulty} hours={sel.estimatedHours} size="sm" />
          <p className="text-body text-text-mute mt-md leading-[1.5]">{sel.summary}</p>
          <div className="mt-md">
            <ProgressRing value={
              (Object.values(progressStore.getTopicProgress(sel.slug).resources).filter(Boolean).length)
              / Math.max(1,
                (sel.resources.videos.short ? 1 : 0)
                + (sel.resources.videos.long ? 1 : 0)
                + sel.resources.articles.length
                + sel.resources.services.length
                + sel.resources.courses.length
              )
            } size={48} thickness={4}><span className="text-caption">%</span></ProgressRing>
          </div>
          <Link to={`/topic/${sel.slug}`} className="mt-md inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
            Go to topic →
          </Link>
        </aside>
      )}
    </div>
  );
}
