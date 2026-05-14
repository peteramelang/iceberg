import { useParams, Link } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { getPathBySlug } from "../utils/pathHelpers.js";
import { topics } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";

function totalRes(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Path() {
  useStoreTick(l => progressStore.subscribe(l));
  const { pathSlug } = useParams();
  const p = pathSlug ? getPathBySlug(pathSlug) : undefined;
  if (!p) return <div className="p-xl text-text-mute">Path not found.</div>;

  let total = 0, checked = 0, completedTopics = 0;
  for (const ts of p.topics) {
    total += totalRes(ts);
    const prog = progressStore.getTopicProgress(ts);
    checked += Object.values(prog.resources).filter(Boolean).length;
    if (prog.completed) completedTopics++;
  }
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  const nextSlug = p.topics.find(ts => !progressStore.getTopicProgress(ts).completed) ?? null;
  const nextTitle = nextSlug ? topics.find(t => t.frontmatter.slug === nextSlug)?.frontmatter.title : null;

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <MainColumn>
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm">{p.audience} · ~{p.estimatedHours}h · {p.topics.length} topics</div>
          <h1 className="text-display-xl m-0 mb-xs">{p.title}</h1>
          <p className="text-body text-text-mute max-w-[720px]">{p.description}</p>
        </header>
        <section>
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Sequence</h2>
            <span className="text-caption text-text-dim tabular-nums">{p.topics.length} topics</span>
          </header>
          <div>
            {p.topics.map((slug, i) => {
              const fm = topics.find(t => t.frontmatter.slug === slug)?.frontmatter;
              if (!fm) return null;
              return <TopicCard key={slug} fm={fm} index={i + 1} totalResources={totalRes(slug)} />;
            })}
          </div>
        </section>
      </MainColumn>

      <RightRail>
        <RailCard title="Path progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={pct / 100} done={completedTopics === p.topics.length}>
              <span className="text-body-strong">{pct}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checked} / {total} resources</div>
              <div className="text-caption text-text-mute">{completedTopics} / {p.topics.length} topics complete</div>
            </div>
          </div>
        </RailCard>
        {nextSlug && (
          <RailCard title="Up next in this path">
            <div className="text-body-strong text-text mb-md">{nextTitle}</div>
            <Link to={`/topic/${nextSlug}?from-path=${p.slug}`} className="inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
              Start →
            </Link>
          </RailCard>
        )}
      </RightRail>
    </div>
  );
}
