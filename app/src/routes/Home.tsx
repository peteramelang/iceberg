import { Link } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { ResumeHero } from "../components/domain/ResumeHero.js";
import { PathCard } from "../components/domain/PathCard.js";
import { PhaseTile } from "../components/domain/PhaseTile.js";
import { ActivityRow } from "../components/domain/ActivityRow.js";
import { taxonomy, topics, connections, paths } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";
import { useActivity } from "../hooks/useActivity.js";

function totalResourcesFor(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Home() {
  useStoreTick(l => progressStore.subscribe(l));
  const activity = useActivity(5);

  const totalRes: Record<string, number> = {};
  for (const t of topics) totalRes[t.frontmatter.slug] = totalResourcesFor(t.frontmatter.slug);
  const overall = progressStore.getOverallProgress(totalRes);
  const lastSlug = progressStore.getLastTouchedTopic();

  let done = 0, partial = 0, untouched = 0;
  for (const t of topics) {
    const p = progressStore.getTopicProgress(t.frontmatter.slug);
    if (p.completed) { done++; continue; }
    const checked = Object.values(p.resources).filter(Boolean).length;
    if (checked > 0) partial++; else untouched++;
  }

  // Resume target: last touched, else first topic with no prerequisites unblocked, else first topic overall.
  const resumeTopic = (() => {
    if (lastSlug) {
      const fm = topics.find(t => t.frontmatter.slug === lastSlug)?.frontmatter;
      if (fm) return fm;
    }
    const allPrereqs = new Set<string>();
    for (const e of connections) if (e.type === "prerequisite") allPrereqs.add(e.to);
    const first = topics.find(t => !allPrereqs.has(t.frontmatter.slug));
    return first?.frontmatter ?? topics[0]?.frontmatter ?? null;
  })();

  // Recommended: next 3 topics whose direct prereqs are all done.
  const completedSet = new Set<string>();
  for (const t of topics) if (progressStore.getTopicProgress(t.frontmatter.slug).completed) completedSet.add(t.frontmatter.slug);
  const prereqsBy: Record<string, string[]> = {};
  for (const e of connections) {
    if (e.type !== "prerequisite") continue;
    (prereqsBy[e.to] ??= []).push(e.from);
  }
  const recommended = topics
    .filter(t => !completedSet.has(t.frontmatter.slug))
    .filter(t => {
      const pres = prereqsBy[t.frontmatter.slug] ?? [];
      return pres.every(p => completedSet.has(p));
    })
    .slice(0, 3);

  const phases = taxonomy ? [...taxonomy.phases].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[1040px]">
        {resumeTopic && (
          <ResumeHero
            topic={resumeTopic}
            resourceCheckedCount={Object.values(progressStore.getTopicProgress(resumeTopic.slug).resources).filter(Boolean).length}
            resourceTotalCount={totalRes[resumeTopic.slug] ?? 0}
            overallPct={overall.totalTopics === 0 ? 0 : Math.round((overall.completedTopics / overall.totalTopics) * 100)}
            overallCompleted={overall.completedTopics}
            overallTotal={overall.totalTopics}
            done={done}
            partial={partial}
            untouched={untouched}
          />
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
                  <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim mb-sm">{taxonomy?.phases.find(p => p.slug === t.frontmatter.phase)?.title}</div>
                  <div className="text-body-strong text-[15px] text-text mb-xs">{t.frontmatter.title}</div>
                  <div className="text-body text-text-mute leading-[1.5]">{t.frontmatter.summary}</div>
                </Link>
              ))}
            </div>
          </section>
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

        {phases.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">All phases</h2>
              <span className="text-caption text-text-dim">{phases.length}</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
              {phases.map((p, i) => (
                <PhaseTile key={p.slug} index={i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
              ))}
            </div>
          </section>
        )}
      </MainColumn>
    </div>
  );
}
