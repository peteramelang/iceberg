import { useParams, Link } from "react-router-dom";
import { Head } from "../components/layout/Head.js";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { getPathBySlug } from "../utils/pathHelpers.js";
import { getTopic } from "../content/index.js";
import { resourceTotalFor } from "../content/derived.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

export function Path() {
  useStoreTick(l => progressStore.subscribe(l));
  const { pathSlug } = useParams();
  const p = pathSlug ? getPathBySlug(pathSlug) : undefined;
  if (!p) return <div className="p-xl text-text-mute">Path not found.</div>;

  let total = 0, checked = 0, completedTopics = 0;
  for (const ts of p.topics) {
    total += resourceTotalFor(ts);
    const prog = progressStore.getTopicProgress(ts);
    checked += Object.values(prog.resources).filter(Boolean).length;
    if (prog.completed) completedTopics++;
  }
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  const nextSlug = p.topics.find(ts => !progressStore.getTopicProgress(ts).completed) ?? null;
  const nextTitle = nextSlug ? getTopic(nextSlug)?.frontmatter.title : null;

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <Head title={p.title} description={p.description} />
      <MainColumn>
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm">{p.audience} · ~{p.estimatedHours}h · {p.topics.length} topics · Updated {formatUpdated(p.lastUpdatedAt)}</div>
          <h1 className="text-display-xl m-0 mb-md">{p.title}</h1>
          <div className="bg-panel-2 border border-border-soft rounded p-lg mb-md">
            <p className="text-[15px] leading-[1.6] text-text m-0">{p.tldr}</p>
          </div>
          <p className="text-body text-text-mute max-w-[720px]">{p.description}</p>
        </header>
        <section>
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Sequence</h2>
            <span className="text-caption text-text-dim tabular-nums">{p.topics.length} topics</span>
          </header>
          <div>
            {p.topics.map((slug, i) => {
              const fm = getTopic(slug)?.frontmatter;
              if (!fm) return null;
              return <TopicCard key={slug} fm={fm} index={i + 1} totalResources={resourceTotalFor(slug)} />;
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
        {nextSlug ? (
          <RailCard title="Up next in this path">
            <div className="text-body-strong text-text mb-md">{nextTitle}</div>
            <Link to={`/topic/${nextSlug}?from-path=${p.slug}`} className="inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
              Start →
            </Link>
          </RailCard>
        ) : (
          <RailCard title="Path complete">
            <div className="text-body text-text">Nice — you've finished every topic in this path.</div>
            <Link to="/paths" className="mt-md inline-block text-accent hover:text-accent-hover">
              Browse other paths →
            </Link>
          </RailCard>
        )}
      </RightRail>
    </div>
  );
}
