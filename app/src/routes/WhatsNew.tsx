import { Link } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { useChangelog } from "../hooks/useChangelog.js";
import { topics } from "../content/index.js";

export function WhatsNew() {
  const entries = useChangelog();
  const titleBySlug = new Map<string, string>();
  for (const t of topics) titleBySlug.set(t.frontmatter.slug, t.frontmatter.title);

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">What's new</h1>
          <p className="text-body text-text-mute">Curriculum updates derived from the git history of <span className="font-mono">content/</span>.</p>
        </header>
        {entries.length === 0 && <div className="text-text-mute italic">No entries yet.</div>}
        {entries.map(e => (
          <article key={e.sha} className="py-lg border-t border-border-soft first:border-t-0">
            <div className="flex items-baseline gap-md mb-xs text-caption text-text-dim">
              <span className="tabular-nums">{e.date.slice(0, 10)}</span>
              <span className="font-mono">{e.sha}</span>
            </div>
            <div className="text-body-strong text-text mb-sm">{e.message}</div>
            <div className="flex flex-wrap gap-xs">
              {e.touchedTopics.map(slug => (
                <Link key={slug} to={`/topic/${slug}`} className="text-caption px-xs py-[1px] border border-border-soft rounded-sm text-text-mute hover:text-text hover:border-border">{titleBySlug.get(slug) ?? slug}</Link>
              ))}
            </div>
          </article>
        ))}
      </MainColumn>
    </div>
  );
}
