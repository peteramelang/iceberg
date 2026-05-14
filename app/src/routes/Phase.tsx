import { Link, useParams } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { getPhase, getTopic, taxonomy, connections } from "../content/index.js";
import { phasesSorted, resourceTotalFor } from "../content/derived.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";

export function Phase() {
  useStoreTick(l => progressStore.subscribe(l));
  const { phaseSlug } = useParams();
  const phase = phaseSlug ? getPhase(phaseSlug) : undefined;
  if (!phase || !taxonomy) {
    return <div className="p-xl text-text-mute">Phase not found.</div>;
  }
  const phaseIndex = phasesSorted.findIndex(p => p.slug === phase.slug) + 1;

  let totalRes = 0, checkedRes = 0, completed = 0;
  for (const ts of phase.topics) {
    totalRes += resourceTotalFor(ts);
    const prog = progressStore.getTopicProgress(ts);
    checkedRes += Object.values(prog.resources).filter(Boolean).length;
    if (prog.completed) completed++;
  }
  const pct = totalRes === 0 ? 0 : Math.round((checkedRes / totalRes) * 100);

  const nextSlug = phase.topics.find(ts => !progressStore.getTopicProgress(ts).completed) ?? null;
  const nextTitle = nextSlug ? getTopic(nextSlug)?.frontmatter.title : null;

  // Prereq phases: phases containing topics that any topic in this phase depends on.
  const inThisPhase = new Set(phase.topics);
  const prereqPhases = new Set<string>();
  const leadsInto = new Set<string>();
  for (const e of connections) {
    if (e.type !== "prerequisite") continue;
    if (inThisPhase.has(e.to) && !inThisPhase.has(e.from)) {
      const ph = getTopic(e.from)?.frontmatter.phase;
      if (ph) prereqPhases.add(ph);
    }
    if (inThisPhase.has(e.from) && !inThisPhase.has(e.to)) {
      const ph = getTopic(e.to)?.frontmatter.phase;
      if (ph) leadsInto.add(ph);
    }
  }

  const density = { prerequisite: 0, "pairs-with": 0, related: 0, "often-confused-with": 0 } as Record<string, number>;
  for (const e of connections) {
    if (inThisPhase.has(e.from) || inThisPhase.has(e.to)) density[e.type] = (density[e.type] ?? 0) + 1;
  }

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <MainColumn maxWidth="max-w-[720px]">
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
            Phase {phaseIndex} of {taxonomy.phases.length}
          </div>
          <h1 className="text-display-xl m-0 mb-xs">{phase.title}</h1>
          <p className="text-body text-text-mute max-w-[640px]">{phase.description}</p>
        </header>

        <section>
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Topics</h2>
            <span className="text-caption text-text-dim">{phase.topics.length} · {completed} complete</span>
          </header>
          <div>
            {phase.topics.map((slug, i) => {
              const fm = getTopic(slug)?.frontmatter;
              if (!fm) return null;
              return <TopicCard key={slug} fm={fm} index={i + 1} totalResources={resourceTotalFor(slug)} />;
            })}
          </div>
        </section>
      </MainColumn>

      <RightRail>
        <RailCard title="Phase progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={pct / 100} done={completed === phase.topics.length}>
              <span className="text-body-strong">{pct}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checkedRes} / {totalRes} resources</div>
              <div className="text-caption text-text-mute">{completed} / {phase.topics.length} topics complete</div>
            </div>
          </div>
          {nextSlug && (
            <Link to={`/topic/${nextSlug}`} className="mt-md inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
              Continue {nextTitle}
            </Link>
          )}
        </RailCard>

        <RailCard title="Prerequisite phases">
          {prereqPhases.size === 0 ? (
            <div className="text-text-mute italic text-body">None — this is the foundation.</div>
          ) : (
            <div>
              {[...prereqPhases].map(slug => {
                const p = getPhase(slug);
                if (!p) return null;
                return <Link key={slug} to={`/phase/${slug}`} className="block py-xs border-t border-border-soft first:border-t-0 text-text-mute hover:text-text">← {p.title}</Link>;
              })}
            </div>
          )}
        </RailCard>

        <RailCard title="Leads into">
          {leadsInto.size === 0 ? (
            <div className="text-text-mute italic text-body">Nothing else depends on this phase yet.</div>
          ) : (
            <div>
              {[...leadsInto].map(slug => {
                const p = getPhase(slug);
                if (!p) return null;
                return <Link key={slug} to={`/phase/${slug}`} className="block py-xs border-t border-border-soft first:border-t-0 text-text-mute hover:text-text">→ {p.title}</Link>;
              })}
            </div>
          )}
        </RailCard>

        <RailCard title="Connection density">
          {(["prerequisite","pairs-with","related","often-confused-with"] as const).map(k => (
            <div key={k} className="flex justify-between py-xs text-body text-text-mute">
              <span className="capitalize">{k.replace(/-/g," ")}</span>
              <span className="text-text tabular-nums">{density[k] ?? 0}</span>
            </div>
          ))}
          <Link to={`/graph?phase=${phase.slug}`} className="text-accent text-body mt-sm inline-block hover:text-accent-hover">Open graph view →</Link>
        </RailCard>
      </RightRail>
    </div>
  );
}
