import { Link } from "react-router-dom";
import { Head } from "../components/layout/Head.js";
import { MainColumn } from "../components/layout/MainColumn.js";
import { ResumeHero } from "../components/domain/ResumeHero.js";
import { PathCard } from "../components/domain/PathCard.js";
import { PhaseTile } from "../components/domain/PhaseTile.js";
import { ActivityRow } from "../components/domain/ActivityRow.js";
import { getPhase, getTopic, topics, connections, paths } from "../content/index.js";
import { phasesSorted, totalResourcesPerTopic } from "../content/derived.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";
import { useActivity } from "../hooks/useActivity.js";

// Topics whose slug is the target of no prerequisite edge — module-level
// because it's pure-function of static content.
const PREREQ_FREE_TOPICS = (() => {
  const targets = new Set<string>();
  for (const e of connections) if (e.type === "prerequisite") targets.add(e.to);
  return topics.filter(t => !targets.has(t.frontmatter.slug));
})();

// Prereq-by-target index: which topics must be done before each topic.
const PREREQS_BY_TARGET: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const e of connections) {
    if (e.type !== "prerequisite") continue;
    (out[e.to] ??= []).push(e.from);
  }
  return out;
})();

export function Home() {
  useStoreTick(l => progressStore.subscribe(l));
  const activity = useActivity(5);

  const overall = progressStore.getOverallProgress(totalResourcesPerTopic);
  const lastSlug = progressStore.getLastTouchedTopic();

  let done = 0, partial = 0, untouched = 0;
  for (const t of topics) {
    const p = progressStore.getTopicProgress(t.frontmatter.slug);
    if (p.completed) { done++; continue; }
    const checked = Object.values(p.resources).filter(Boolean).length;
    if (checked > 0) partial++; else untouched++;
  }

  // Resume target: last touched, else first prereq-free topic, else first topic.
  const resumeTopic = (() => {
    if (lastSlug) {
      const fm = getTopic(lastSlug)?.frontmatter;
      if (fm) return fm;
    }
    return PREREQ_FREE_TOPICS[0]?.frontmatter ?? topics[0]?.frontmatter ?? null;
  })();

  // Recommended: next 3 topics whose direct prereqs are all done.
  const completedSet = new Set<string>();
  for (const t of topics) if (progressStore.getTopicProgress(t.frontmatter.slug).completed) completedSet.add(t.frontmatter.slug);
  const recommended = topics
    .filter(t => !completedSet.has(t.frontmatter.slug))
    .filter(t => {
      const pres = PREREQS_BY_TARGET[t.frontmatter.slug] ?? [];
      return pres.every(p => completedSet.has(p));
    })
    .slice(0, 3);

  const phases = phasesSorted;

  return (
    <div className="p-xl">
      <Head title="iceberg — production-readiness curriculum" />
      <MainColumn maxWidth="max-w-[1040px]">
        <section className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm">iceberg</div>
          <h1 className="text-display-lg m-0 mb-sm">
            The depth between an MVP and a production system.
          </h1>
          <p className="text-body text-text-mute max-w-[640px]">
            What ships in a demo is the visible tip — UI, the happy path, a working auth flow.
            Everything that keeps it running in front of real users — payments, observability,
            rollbacks, compliance — is the depth below.{" "}
            <Link to="/about" className="text-accent hover:text-accent-hover">Read why iceberg exists →</Link>
          </p>
        </section>
        {resumeTopic && (
          <ResumeHero
            topic={resumeTopic}
            resourceCheckedCount={Object.values(progressStore.getTopicProgress(resumeTopic.slug).resources).filter(Boolean).length}
            resourceTotalCount={totalResourcesPerTopic[resumeTopic.slug] ?? 0}
            overallPct={overall.totalTopics === 0 ? 0 : Math.round((overall.completedTopics / overall.totalTopics) * 100)}
            overallCompleted={overall.completedTopics}
            overallTotal={overall.totalTopics}
            done={done}
            partial={partial}
            untouched={untouched}
          />
        )}

        {paths.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Learning paths</h2>
              <span className="text-caption text-text-dim">{paths.length} · curated sequences</span>
            </header>
            <div className="flex gap-md overflow-x-auto scrollbar-thin pb-sm">
              {paths.map(p => <PathCard key={p.slug} path={p} fixed />)}
            </div>
          </section>
        )}

        {recommended.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Recommended next</h2>
              <span className="text-caption text-text-dim">unblocked by what you've completed</span>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {recommended.map(t => (
                <Link
                  key={t.frontmatter.slug}
                  to={`/topic/${t.frontmatter.slug}`}
                  className="block bg-panel border border-border-soft rounded p-lg hover:bg-panel-2 hover:border-border"
                >
                  <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim mb-sm">{getPhase(t.frontmatter.phase)?.title}</div>
                  <div className="text-body-strong text-[15px] text-text mb-xs">{t.frontmatter.title}</div>
                  <div className="text-body text-text-mute leading-[1.5]">{t.frontmatter.summary}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {phases.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">All phases</h2>
              <span className="text-caption text-text-dim">{phases.length}</span>
            </header>
            {(() => {
              // Split point: the original curriculum had 7 production-readiness
              // phases; the extension added 4 modern-fullstack-and-AI phases at
              // the end. Edit this constant if the curriculum arcs ever shift.
              const FOUNDATION_PHASE_COUNT = 7;
              const foundations = phases.slice(0, FOUNDATION_PHASE_COUNT);
              const modern = phases.slice(FOUNDATION_PHASE_COUNT);
              return (
                <>
                  {foundations.length > 0 && (
                    <>
                      <h3 className="text-label text-text-dim uppercase mt-md mb-md">Production-Readiness Foundations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                        {foundations.map((p, i) => (
                          <PhaseTile key={p.slug} index={i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
                        ))}
                      </div>
                    </>
                  )}
                  {modern.length > 0 && (
                    <>
                      <h3 className="text-label text-text-dim uppercase mt-xl mb-md">Modern Full-Stack + AI</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                        {modern.map((p, i) => (
                          <PhaseTile key={p.slug} index={FOUNDATION_PHASE_COUNT + i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {activity.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Recent activity</h2>
            </header>
            <div>
              {activity.map((e, i) => <ActivityRow key={`${e.at}-${i}`} entry={e} />)}
            </div>
          </section>
        )}
      </MainColumn>
    </div>
  );
}
