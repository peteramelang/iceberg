import { Link, useParams } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { getPath, taxonomy } from "../content/index.js";
import { ProgressMarker } from "../components/domain/ProgressMarker.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

export function Path() {
  const { pathSlug } = useParams();
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const path = getPath(pathSlug!);
  if (!path || !taxonomy) return <Page><div>Path not found.</div></Page>;

  return (
    <Page>
      <Section>
        <Link to="/paths" className="text-caption-md text-mute no-underline">&lt;&lt; all paths</Link>
        <h1 className="text-display-xl mt-md">{path.title}</h1>
        <p className="text-body text-mute mt-lg">{path.description}</p>
        <div className="text-caption-md text-mute mt-md">For {path.audience} · {path.topics.length} topics · ~{path.estimatedHours} hours</div>
      </Section>

      <Section label="Sequence">
        {path.topics.map((slug, i) => {
          const t = taxonomy!.topics[slug];
          const prog = progressStore.getTopicProgress(slug);
          const state: "empty" | "partial" | "done" = prog.completed ? "done" : Object.values(prog.resources).filter(Boolean).length > 0 ? "partial" : "empty";
          return (
            <Link key={slug} to={`/topic/${slug}`} className="no-underline">
              <div className="py-lg border-b border-hairline flex items-baseline gap-md">
                <span className="text-mute select-none w-8">{String(i+1).padStart(2,"0")}</span>
                <ProgressMarker state={state} />
                <div className="flex-1">
                  <div className="text-body-strong">{t?.title ?? slug}</div>
                  <div className="text-body text-mute">{t?.summary}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </Section>
    </Page>
  );
}
