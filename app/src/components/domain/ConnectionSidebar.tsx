import { Link } from "react-router-dom";
import { connections, taxonomy } from "../../content/index.js";

export function ConnectionSidebar({ slug }: { slug: string }) {
  const edges = connections.filter(e => e.from === slug || e.to === slug);
  if (edges.length === 0 || !taxonomy) return null;
  const tax = taxonomy;
  const grouped: Record<string, { other: string; reasoning: string }[]> = {};
  for (const e of edges) {
    const other = e.from === slug ? e.to : e.from;
    grouped[e.type] = grouped[e.type] ?? [];
    grouped[e.type]!.push({ other, reasoning: e.reasoning });
  }
  const labels: Record<string, string> = {
    "prerequisite": "Before this",
    "related": "See also",
    "often-confused-with": "Often confused with",
    "pairs-with": "Pairs with"
  };
  return (
    <aside className="border-l border-hairline pl-lg mt-xl md:mt-0">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-lg">
          <div className="text-caption-md text-mute mb-xs">{labels[type] ?? type}</div>
          {items.map(({ other }) => {
            const t = tax.topics[other];
            if (!t) return null;
            return <div key={other}><Link to={`/topic/${other}`} className="underline">{t.title}</Link></div>;
          })}
        </div>
      ))}
    </aside>
  );
}
