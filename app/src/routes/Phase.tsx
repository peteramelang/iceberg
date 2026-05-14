import { Link, useParams } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { Head } from "../components/layout/Head.js";
import { getPhase, taxonomy, topics } from "../content/index.js";
import { ProgressMarker } from "../components/domain/ProgressMarker.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

export function Phase() {
  const { phaseSlug } = useParams();
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const phase = getPhase(phaseSlug!);
  if (!phase || !taxonomy) return <Page><div>Phase not found.</div></Page>;
  const tax = taxonomy;

  return (
    <Page>
      <Head title={phase?.title ?? "Phase"} description={phase?.description} />
      <Section>
        <Link to="/" className="text-caption-md text-mute no-underline">&lt;&lt; back</Link>
        <h1 className="text-display-xl mt-md">{phase.title}</h1>
        <p className="text-body text-mute mt-lg">{phase.description}</p>
      </Section>

      <Section label="Topics">
        {phase.topics.map(slug => {
          const t = tax.topics[slug];
          const tf = topics.find(x => x.frontmatter.slug === slug)?.frontmatter;
          const prog = progressStore.getTopicProgress(slug);
          const totalRes = tf
            ? (tf.resources.videos.short ? 1 : 0) +
              (tf.resources.videos.long ? 1 : 0) +
              tf.resources.articles.length +
              tf.resources.services.length +
              tf.resources.courses.length
            : 0;
          const checked = Object.values(prog.resources).filter(Boolean).length;
          const state: "empty" | "partial" | "done" = prog.completed ? "done" : checked > 0 ? "partial" : "empty";
          if (!t) return null;
          return (
            <Link key={slug} to={`/topic/${slug}`} className="no-underline">
              <div className="py-lg border-b border-hairline flex items-baseline gap-md">
                <ProgressMarker state={state} />
                <div className="flex-1">
                  <div className="text-body-strong">{t.title}</div>
                  <div className="text-body text-mute">{t.summary}</div>
                </div>
                <div className="text-caption-md text-mute">{checked}/{totalRes}</div>
              </div>
            </Link>
          );
        })}
      </Section>
    </Page>
  );
}
