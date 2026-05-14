import { Link } from "react-router-dom";
import type { LearningPath } from "../../content/types.js";

export function PathCard({ path, fixed = false }: { path: LearningPath; fixed?: boolean }) {
  return (
    <Link
      to={`/path/${path.slug}`}
      className={[
        "block bg-panel border border-border-soft rounded p-lg hover:bg-panel-2 hover:border-border",
        fixed ? "shrink-0 w-[280px]" : ""
      ].join(" ")}
    >
      <div className="text-[11px] uppercase tracking-[0.08em] text-accent mb-sm">
        {path.audience} · {path.estimatedHours}h
      </div>
      <div className="text-body-strong text-[15px] text-text mb-xs">{path.title}</div>
      <div className="text-body text-text-mute leading-[1.5] mb-md line-clamp-3 min-h-[39px]">{path.description}</div>
      <div className="text-caption text-text-dim tabular-nums">{path.topics.length} topics · ~{path.estimatedHours}h</div>
    </Link>
  );
}
