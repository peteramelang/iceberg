import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { paths } from "../content/index.js";

export function Paths() {
  return (
    <Page>
      <Section label="Learning Paths">
        <p className="text-body text-mute mb-xl max-w-prose">
          Each path is an opinionated sequence of topics for a specific audience and goal. Start at the top, work down.
        </p>
        {paths.map(p => (
          <Link key={p.slug} to={`/path/${p.slug}`} className="no-underline">
            <div className="py-lg border-b border-hairline">
              <div className="text-body-strong">[+] {p.title}</div>
              <div className="text-caption-md text-mute mt-xs">For {p.audience} · {p.topics.length} topics · ~{p.estimatedHours}h</div>
              <div className="text-body text-mute mt-sm">{p.description}</div>
            </div>
          </Link>
        ))}
      </Section>
    </Page>
  );
}
