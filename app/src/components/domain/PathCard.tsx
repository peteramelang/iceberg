import { Link } from "react-router-dom";
import type { LearningPath } from "../../content/types.js";
import { getTopic } from "../../content/index.js";

export function PathCard({ path, fixed = false }: { path: LearningPath; fixed?: boolean }) {
  // Spec §4 + §7: card shows a preview of the first 3 topics in the sequence.
  const preview = path.topics.slice(0, 3)
    .map(slug => getTopic(slug)?.frontmatter.title)
    .filter((t): t is string => Boolean(t));

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
      {preview.length > 0 && (
        <ol className="mb-md flex flex-col gap-xs text-caption text-text-mute">
          {preview.map((title, i) => (
            <li key={i} className="flex items-baseline gap-sm">
              <span aria-hidden className="font-mono text-text-dim tabular-nums text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate">{title}</span>
            </li>
          ))}
          {path.topics.length > 3 && (
            <li className="text-text-dim">+{path.topics.length - 3} more</li>
          )}
        </ol>
      )}
      <div className="text-caption text-text-dim tabular-nums">{path.topics.length} topics · ~{path.estimatedHours}h</div>
    </Link>
  );
}
