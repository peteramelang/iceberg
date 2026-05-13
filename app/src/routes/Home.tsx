import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { HairlineRule } from "../components/layout/HairlineRule.js";
import { taxonomy, topics } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

export function Home() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const totalResourcesPerTopic = Object.fromEntries(topics.map(t => [
    t.frontmatter.slug,
    (t.frontmatter.resources.videos.short ? 1 : 0) +
    (t.frontmatter.resources.videos.long ? 1 : 0) +
    t.frontmatter.resources.articles.length +
    t.frontmatter.resources.services.length +
    t.frontmatter.resources.courses.length
  ]));
  const overall = progressStore.getOverallProgress(totalResourcesPerTopic);
  const last = progressStore.getLastTouchedTopic();

  if (!taxonomy) return <Page><div>No content yet. Run the pipeline.</div></Page>;

  return (
    <Page>
      <Section>
        <h1 className="text-display-xl">iceberg</h1>
        <p className="text-body mt-lg max-w-prose">
          A guided curriculum for the production-readiness topics below the waterline.
        </p>
        <div className="mt-xl text-body-md">
          [+] {overall.completedTopics}/{overall.totalTopics} topics complete &middot;{" "}
          {overall.resourcesCompleted}/{overall.resourcesTotal} resources
        </div>
        {last && (
          <div className="mt-md text-body-md">
            &gt;&gt; Continue:{" "}
            <Link to={`/topic/${last}`} className="underline">{last}</Link>
          </div>
        )}
      </Section>

      <Section label="Phases">
        <HairlineRule />
        {taxonomy.phases.sort((a, b) => a.order - b.order).map(phase => (
          <div key={phase.slug} className="py-lg border-b border-hairline">
            <Link to={`/phase/${phase.slug}`} className="no-underline">
              <div className="text-body-strong">[+] {phase.title}</div>
              <div className="text-body text-mute mt-xs">{phase.description}</div>
              <div className="text-caption-md text-mute mt-xs">{phase.topics.length} topics</div>
            </Link>
          </div>
        ))}
      </Section>
    </Page>
  );
}
