import { Link } from "react-router-dom";
import type { TopicFrontmatter } from "../../content/types.js";
import { getPhase } from "../../content/index.js";
import { ProgressRing } from "./ProgressRing.js";

export function ResumeHero({
  topic,
  resourceCheckedCount,
  resourceTotalCount,
  overallPct,
  overallCompleted,
  overallTotal,
  done,
  partial,
  untouched
}: {
  topic: TopicFrontmatter;
  resourceCheckedCount: number;
  resourceTotalCount: number;
  overallPct: number;
  overallCompleted: number;
  overallTotal: number;
  done: number;
  partial: number;
  untouched: number;
}) {
  const phaseTitle = getPhase(topic.phase)?.title ?? topic.phase;
  const resumeWidth = resourceTotalCount === 0 ? 0 : Math.round((resourceCheckedCount / resourceTotalCount) * 100);

  // Spec §4: first-visit fallback shifts the eyebrow + button to "Start with…"
  // instead of "Welcome back / Resume →". Detect via "no progress anywhere"
  // signal (overallCompleted is the topic count from getOverallProgress,
  // and resourceCheckedCount is on the currently-shown topic).
  const firstVisit = overallCompleted === 0 && resourceCheckedCount === 0;

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-xl p-xl border border-border rounded mb-xl"
      style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--blue) 10%, transparent))" }}
    >
      <div>
        <div className="text-label text-text-mute uppercase mb-sm">
          {firstVisit ? `Start your journey · ${phaseTitle}` : "Welcome back · pick up where you left off"}
        </div>
        <h1 className="text-display-lg m-0 mb-xs">{topic.title}</h1>
        <p className="text-body text-text-mute max-w-[520px] mb-md">{topic.summary}</p>
        <div className="h-[6px] bg-border-soft/30 rounded-pill overflow-hidden mb-sm max-w-[360px]">
          <div className="h-full bg-accent rounded-pill" style={{ width: `${resumeWidth}%` }} />
        </div>
        <div className="text-caption text-text-mute tabular-nums mb-md">{resourceCheckedCount} / {resourceTotalCount} resources · {phaseTitle}</div>
        <Link to={`/topic/${topic.slug}`} className="inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
          {firstVisit ? `Start with ${topic.title} →` : "Resume →"}
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center gap-sm">
        <ProgressRing value={overallPct / 100} size={130} thickness={9}>
          <span className="text-[22px] font-semibold tabular-nums">{overallPct}%</span>
        </ProgressRing>
        <div className="text-caption text-text-mute tabular-nums">{overallCompleted} / {overallTotal} topics</div>
        <div className="text-caption text-text-dim">{done} done · {partial} partial · {untouched} untouched</div>
      </div>
    </section>
  );
}
