import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ReactFlow, Background, Controls, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Head } from "../components/layout/Head.js";
import { topics, connections, taxonomy } from "../content/index.js";
import { topicBySlug } from "../content/derived.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";
import { useResolvedTheme } from "../hooks/useResolvedTheme.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { connectionsForTopic, EDGE_LABEL, EDGE_ORDER, type EdgeType as ConnEdgeType } from "../utils/connectionHelpers.js";

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
  // Tick on progress events; nodes are computed unmemoed so completion
  // colors update immediately (C11 fix: previous useMemo deps didn't
  // include progress and went stale until selection/filter changed).
  useStoreTick(l => progressStore.subscribe(l));
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

  // I18: react to URL changes (focusSlug) when component stays mounted
  // (e.g. clicking a "?focus=" link while on /graph).
  useEffect(() => {
    setSelected(focusSlug);
  }, [focusSlug]);

  const EDGE_COLOR = theme === "dark" ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
  const positions = useMemo(layoutNodes, []);

  const nodes: Node[] = topics
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
    });

  const edges: Edge[] = connections
    .filter(e => enabled[e.type as EdgeType])
    .filter(e => !phaseFilter || (
      topicBySlug.get(e.from)?.frontmatter.phase === phaseFilter
      || topicBySlug.get(e.to)?.frontmatter.phase === phaseFilter
    ))
    .map(e => ({
      id: `${e.from}-${e.type}-${e.to}`,
      source: e.from,
      target: e.to,
      animated: false,
      style: { stroke: EDGE_COLOR[e.type as EdgeType], strokeDasharray: e.type === "pairs-with" ? "4 4" : undefined }
    }));

  const onNodeClick = useCallback((_: unknown, node: Node) => setSelected(node.id), []);
  const onPaneClick = useCallback(() => setSelected(null), []);
  const sel = selected ? topicBySlug.get(selected)?.frontmatter : null;
  const selConnections = useMemo(() => (sel ? connectionsForTopic(sel.slug) : []), [sel]);
  const selConnectionsByType = useMemo(() => {
    const grouped: Record<ConnEdgeType, typeof selConnections> = {
      "prerequisite": [], "pairs-with": [], "related": [], "often-confused-with": []
    };
    for (const c of selConnections) grouped[c.type].push(c);
    return grouped;
  }, [selConnections]);

  return (
    <div className="flex h-[calc(100dvh-52px)]">
      <Head title="Graph" description="Visualize prerequisite, pairs-with, related, and confusion edges across topics." />
      <h1 className="sr-only">Topic graph</h1>
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
          onPaneClick={onPaneClick}
          colorMode={theme}
          fitView
        >
          <Background gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {sel && (
        <aside className="w-[280px] shrink-0 border-l border-border bg-panel p-lg overflow-y-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close topic panel"
            className="text-text-mute hover:text-text text-caption mb-md"
          >
            × close
          </button>
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
          {selConnections.length > 0 && (
            <div className="mt-xl">
              <h3 className="text-label text-text-mute uppercase mb-sm">Connections</h3>
              <div className="flex flex-col gap-md">
                {EDGE_ORDER.map(type => {
                  const list = selConnectionsByType[type];
                  if (list.length === 0) return null;
                  return (
                    <div key={type}>
                      <div className="text-caption text-text-dim uppercase mb-xs">{EDGE_LABEL[type]}</div>
                      <ul className="flex flex-col gap-xs">
                        {list.slice(0, 4).map(c => (
                          <li key={`${type}-${c.otherSlug}`}>
                            <Link
                              to={`/topic/${c.otherSlug}`}
                              className="block text-body text-text hover:text-accent"
                            >
                              <div className="truncate">{c.otherTitle}</div>
                              <div className="text-caption text-text-mute truncate">{c.reasoning}</div>
                            </Link>
                          </li>
                        ))}
                        {list.length > 4 && (
                          <li className="text-caption text-text-dim">+{list.length - 4} more</li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
