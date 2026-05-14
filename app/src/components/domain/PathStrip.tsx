import { Link } from "react-router-dom";
import { paths } from "../../content/index.js";

export function PathStrip() {
  if (paths.length === 0) return null;
  return (
    <div className="flex gap-md overflow-x-auto -mx-md px-md py-md">
      {paths.map(p => (
        <Link
          key={p.slug}
          to={`/path/${p.slug}`}
          className="no-underline min-w-[260px] max-w-[260px] border border-hairline rounded-sm p-md hover:border-ink-deep"
        >
          <div className="text-body-strong">{p.title}</div>
          <div className="text-caption-md text-mute mt-xs">{p.audience}</div>
          <div className="text-body text-mute mt-sm line-clamp-3">{p.description}</div>
          <div className="text-caption-md text-mute mt-md">{p.topics.length} topics · ~{p.estimatedHours}h</div>
        </Link>
      ))}
    </div>
  );
}
