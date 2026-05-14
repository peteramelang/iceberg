import { Link } from "react-router-dom";
import type { TopicFrontmatter } from "../../content/types.js";
import { progressStore } from "../../stores/index.js";
import { DifficultyBadge } from "./DifficultyBadge.js";

export function TopicCard({
  fm,
  index,
  totalResources
}: { fm: TopicFrontmatter; index?: number; totalResources: number }) {
  const prog = progressStore.getTopicProgress(fm.slug);
  const checked = Object.values(prog.resources).filter(Boolean).length;
  const pct = totalResources === 0 ? 0 : Math.round((checked / totalResources) * 100);
  const done = prog.completed;

  return (
    <Link
      to={`/topic/${fm.slug}`}
      className="grid grid-cols-[36px_1fr_auto] gap-lg items-center px-lg py-md bg-panel border border-border-soft rounded mb-sm hover:bg-panel-2 hover:border-border"
    >
      <div className="font-mono text-caption text-text-dim text-center tabular-nums">
        {typeof index === "number" ? String(index).padStart(2, "0") : ""}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-sm flex-wrap">
          <span className="text-body-strong text-[15px] text-text">{fm.title}</span>
          <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} size="sm" />
        </div>
        <div className="text-body text-text-mute leading-[1.5] mt-xs">{fm.summary}</div>
      </div>
      <div className="text-right">
        <div className="text-caption text-text-mute mb-xs tabular-nums">{checked} / {totalResources} resources</div>
        <div className="w-[100px] h-[4px] bg-border-soft rounded-pill overflow-hidden ml-auto">
          <div className={done ? "h-full bg-green" : "h-full bg-accent"} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
