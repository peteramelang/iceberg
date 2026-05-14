import { useState } from "react";
import { MainColumn } from "../components/layout/MainColumn.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { bookmarkStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";
import { taxonomy, topics } from "../content/index.js";

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

export function Bookmarks() {
  useStoreTick(l => bookmarkStore.subscribe(l));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const list = bookmarkStore.list().filter(b => !b.resource);
  const bookmarkedSlugs = new Set(list.map(b => b.topic));

  if (!taxonomy) return null;
  const groups = taxonomy.phases
    .map(p => ({ phase: p, slugs: p.topics.filter(s => bookmarkedSlugs.has(s)) }))
    .filter(g => g.slugs.length > 0);

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">Bookmarks</h1>
          <p className="text-body text-text-mute">{list.length} bookmarked topic{list.length === 1 ? "" : "s"}.</p>
        </header>
        {groups.length === 0 ? (
          <div className="text-text-mute italic">No bookmarks yet. Bookmark a topic from its detail page to find it here.</div>
        ) : groups.map(({ phase, slugs }) => {
          const isCollapsed = collapsed.has(phase.slug);
          return (
            <section key={phase.slug} className="mb-xl">
              <button
                type="button"
                onClick={() => setCollapsed(prev => {
                  const next = new Set(prev);
                  if (next.has(phase.slug)) next.delete(phase.slug); else next.add(phase.slug);
                  return next;
                })}
                aria-expanded={!isCollapsed}
                className="flex items-baseline gap-md mb-md text-text"
              >
                <span className="text-text-dim text-caption">{isCollapsed ? "▸" : "▾"}</span>
                <h2 className="text-label text-text-mute uppercase m-0">{phase.title}</h2>
                <span className="text-caption text-text-dim tabular-nums">{slugs.length}</span>
              </button>
              {!isCollapsed && (
                <div>
                  {slugs.map(slug => {
                    const fm = topics.find(t => t.frontmatter.slug === slug)?.frontmatter;
                    if (!fm) return null;
                    return <TopicCard key={slug} fm={fm} totalResources={totalRes(slug)} />;
                  })}
                </div>
              )}
            </section>
          );
        })}
      </MainColumn>
    </div>
  );
}
