import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { useChangelog } from "../hooks/useChangelog.js";
import { getTopic } from "../content/index.js";

export function WhatsNew() {
  const entries = useChangelog();
  return (
    <Page>
      <Section label="What's New">
        <p className="text-body text-mute mb-xl max-w-prose">
          Every content change committed to <code>content/</code>, newest first.
        </p>
        {entries.length === 0 && <div className="text-mute">[ ] loading…</div>}
        {entries.map(e => (
          <div key={e.sha} className="py-lg border-b border-hairline">
            <div className="text-caption-md text-mute">{e.date.slice(0,10)} · {e.sha}</div>
            <div className="text-body mt-xs">{e.message}</div>
            <div className="mt-sm flex flex-wrap gap-sm">
              {e.touchedTopics.map(slug => {
                const t = getTopic(slug);
                return (
                  <Link key={slug} to={`/topic/${slug}`} className="text-caption-md underline">
                    {t?.frontmatter.title ?? slug}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </Section>
    </Page>
  );
}
