import { useParams, Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { Head } from "../components/layout/Head.js";
import { ResourceRow } from "../components/domain/ResourceRow.js";
import { ConnectionSidebar } from "../components/domain/ConnectionSidebar.js";
import { NotesField } from "../components/interactive/NotesField.js";
import { MarkCompleteButton } from "../components/interactive/MarkCompleteButton.js";
import { Narrative } from "../components/domain/Narrative.js";
import { Pitfalls } from "../components/domain/Pitfalls.js";
import { CodeExamples } from "../components/domain/CodeExamples.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";
import { getTopic, taxonomy } from "../content/index.js";

export function Topic() {
  const { topicSlug } = useParams();
  const entry = getTopic(topicSlug!);
  if (!entry || !taxonomy) return <Page><div>Topic not found.</div></Page>;
  const { frontmatter: fm } = entry;
  const phase = taxonomy.phases.find(p => p.slug === fm.phase);

  return (
    <Page>
      <Head title={fm.title} description={fm.summary} jsonLd={{ "@context": "https://schema.org", "@type": "LearningResource", name: fm.title, description: fm.summary, educationalLevel: fm.difficulty, timeRequired: `PT${Math.ceil(fm.estimatedHours)}H`, teaches: fm.title, isPartOf: { "@type": "Course", name: phase?.title } }} />
      <div className="grid md:grid-cols-[1fr_240px] gap-xl">
        <div>
          <Section>
            <Link to={`/phase/${fm.phase}`} className="text-caption-md text-mute no-underline">&lt;&lt; {phase?.title}</Link>
            <div className="flex items-baseline gap-md mt-md flex-wrap">
              <h1 className="text-display-xl">{fm.title}</h1>
              <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
            </div>
            <p className="text-body mt-lg whitespace-pre-line">{fm.definition}</p>
            <div className="mt-xl"><MarkCompleteButton slug={fm.slug} /></div>
          </Section>

          <Section label="In Depth">
            <Narrative text={fm.narrative} />
          </Section>

          <Section label="Common Pitfalls">
            <Pitfalls items={fm.pitfalls} />
          </Section>

          <Section label="Code">
            <CodeExamples items={fm.codeExamples} />
          </Section>

          {fm.resources.videos.short && (
            <Section label="Videos">
              <ResourceRow
                topicSlug={fm.slug}
                resourceKey="videos.short"
                kind="Video"
                title={fm.resources.videos.short.title}
                url={fm.resources.videos.short.url}
                meta={`${fm.resources.videos.short.author} · ${fm.resources.videos.short.durationMinutes} min`}
              />
              {fm.resources.videos.long && (
                <ResourceRow
                  topicSlug={fm.slug}
                  resourceKey="videos.long"
                  kind="Video"
                  title={fm.resources.videos.long.title}
                  url={fm.resources.videos.long.url}
                  meta={`${fm.resources.videos.long.author} · ${fm.resources.videos.long.durationMinutes} min`}
                />
              )}
            </Section>
          )}

          {fm.resources.articles.length > 0 && (
            <Section label="Articles & Docs">
              {fm.resources.articles.map((a, i) => (
                <ResourceRow
                  key={i}
                  topicSlug={fm.slug}
                  resourceKey={`articles.${i}`}
                  kind="Article"
                  title={a.title}
                  url={a.url}
                  meta={`${a.author ?? a.publisher ?? ""} · ${a.kind}`.replace(/^ · /, "")}
                />
              ))}
            </Section>
          )}

          {fm.resources.services.length > 0 && (
            <Section label="Services">
              {fm.resources.services.map((s, i) => (
                <ResourceRow
                  key={i}
                  topicSlug={fm.slug}
                  resourceKey={`services.${i}`}
                  kind="Service"
                  title={s.name}
                  url={s.url}
                  meta={s.vendor && s.vendor !== s.name ? `${s.vendor} · ${s.category}` : s.category}
                />
              ))}
            </Section>
          )}

          {fm.resources.courses.length > 0 && (
            <Section label="Courses">
              {fm.resources.courses.map((c, i) => (
                <ResourceRow
                  key={i}
                  topicSlug={fm.slug}
                  resourceKey={`courses.${i}`}
                  kind="Course"
                  title={c.title}
                  url={c.url}
                  meta={`${c.instructor ? c.instructor + " · " : ""}${c.provider}${c.paid ? " · paid" : ""}`}
                />
              ))}
            </Section>
          )}

          <Section label="Your notes">
            <NotesField slug={fm.slug} />
          </Section>

          <Section label="Attribution">
            <p className="text-caption-md text-mute">
              These resources are owned by their original creators. iceberg curates and links, but does not redistribute.{" "}
              <Link to="/credits" className="underline">Full credits</Link>.
            </p>
          </Section>
        </div>
        <ConnectionSidebar slug={fm.slug} />
      </div>
    </Page>
  );
}
