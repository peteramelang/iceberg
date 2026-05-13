import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { bookmarkStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { getTopic } from "../content/index.js";

export function Bookmarks() {
  const list = useStoreSubscription(l => bookmarkStore.subscribe(l), () => bookmarkStore.list());
  return (
    <Page>
      <Section label="Bookmarks">
        {list.length === 0 && <div className="text-mute">[ ] no bookmarks yet</div>}
        {list.map((b, i) => {
          const t = getTopic(b.topic);
          return (
            <div key={i} className="py-sm border-b border-hairline">
              <Link to={`/topic/${b.topic}`} className="underline">{t?.frontmatter.title ?? b.topic}</Link>
              {b.resource && <span className="text-caption-md text-mute ml-md">{b.resource}</span>}
            </div>
          );
        })}
      </Section>
    </Page>
  );
}
