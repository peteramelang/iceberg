import { Link } from "react-router-dom";
import { resourceTotalFor } from "../../content/derived.js";
import { progressStore } from "../../stores/index.js";

export function PhaseTile({
  index, slug, title, topicSlugs
}: { index: number; slug: string; title: string; topicSlugs: string[] }) {
  let totalRes = 0;
  let checkedRes = 0;
  for (const ts of topicSlugs) {
    totalRes += resourceTotalFor(ts);
    const prog = progressStore.getTopicProgress(ts);
    checkedRes += Object.values(prog.resources).filter(Boolean).length;
  }
  const pct = totalRes === 0 ? 0 : Math.round((checkedRes / totalRes) * 100);
  return (
    <Link
      to={`/phase/${slug}`}
      className="block bg-panel border border-border-soft rounded p-lg hover:bg-panel-2 hover:border-border"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim mb-xs">Phase {String(index).padStart(2, "0")}</div>
      <div className="text-body-strong text-[14.5px] text-text">{title}</div>
      <div className="text-caption text-text-dim mt-xs">{topicSlugs.length} topics</div>
      <div className="mt-md h-[3px] bg-border-soft rounded-pill overflow-hidden">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
