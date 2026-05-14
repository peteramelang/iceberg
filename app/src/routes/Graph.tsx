import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Page } from "../components/layout/Page.js";
import { Head } from "../components/layout/Head.js";
import { taxonomy, connections } from "../content/index.js";

export function Graph() {
  const navigate = useNavigate();

  const { nodes, edges } = useMemo(() => {
    if (!taxonomy) return { nodes: [] as Node[], edges: [] as Edge[] };
    const phaseColors = Object.fromEntries(taxonomy.phases.map((p, i) => [p.slug, i]));

    const nodes: Node[] = Object.values(taxonomy.topics).map((t, i) => {
      const phaseIdx = phaseColors[t.phase] ?? 0;
      const x = (i % 8) * 180;
      const y = phaseIdx * 160 + Math.floor(i / 8) * 80;
      return {
        id: t.slug,
        position: { x, y },
        data: { label: `[ ${t.title} ]` },
        style: {
          border: "1px solid #201d1d",
          background: "#fdfcfc",
          padding: "4px 8px",
          borderRadius: 0,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13
        }
      };
    });

    const edges: Edge[] = connections.map((c, i) => ({
      id: `e${i}`,
      source: c.from,
      target: c.to,
      label: c.type === "prerequisite" ? "▸" : undefined,
      style: { stroke: "rgba(15,0,0,0.5)", strokeWidth: Math.max(1, c.weight * 2) },
      type: c.type === "prerequisite" ? "smoothstep" : "default"
    }));

    return { nodes, edges };
  }, []);

  if (!taxonomy) return <Page>No content.</Page>;

  return (
    <Page>
      <Head title="Knowledge Graph" />
      <div className="h-[70vh] border border-hairline">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(_, n) => navigate(`/topic/${n.id}`)}
          fitView
        >
          <Background gap={24} color="rgba(15,0,0,0.06)" />
          <Controls />
        </ReactFlow>
      </div>
    </Page>
  );
}
