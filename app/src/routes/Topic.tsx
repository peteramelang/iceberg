import { useParams, Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { ResourceRow } from "../components/domain/ResourceRow.js";
import { ConnectionSidebar } from "../components/domain/ConnectionSidebar.js";
import { NotesField } from "../components/interactive/NotesField.js";
import { MarkCompleteButton } from "../components/interactive/MarkCompleteButton.js";
import { getTopic, taxonomy } from "../content/index.js";

export function Topic() {
  const { topicSlug } = useParams();
  const entry = getTopic(topicSlug!);
  if (!entry || !taxonomy) return <Page><div>Topic not found.</div></Page>;
  const { frontmatter: fm } = entry;
  const phase = taxonomy.phases.find(p => p.slug === fm.phase);

  return (
    <Page>
      <div className="grid md:grid-cols-[1fr_240px] gap-xl">
        <div>
          <Section>
            <Link to={`/phase/${fm.phase}`} className="text-caption-md text-mute no-underline">&lt;&lt; {phase?.title}</Link>
            <h1 className="text-display-xl mt-md">{fm.title}</h1>
            <p className="text-body mt-lg whitespace-pre-line">{fm.definition}</p>
            <div className="mt-xl"><MarkCompleteButton slug={fm.slug} /></div>
          </Section>

          {fm.resources.videos.short && (
            <Section label="Videos">
              <ResourceRow topicSlug={fm.slug} resourceKey="videos.short" title={fm.resources.videos.short.title} url={fm.resources.videos.short.url} meta={`${fm.resources.videos.short.durationMinutes} min`} />
              {fm.resources.videos.long && (
                <ResourceRow topicSlug={fm.slug} resourceKey="videos.long" title={fm.resources.videos.long.title} url={fm.resources.videos.long.url} meta={`${fm.resources.videos.long.durationMinutes} min`} />
              )}
            </Section>
          )}

          {fm.resources.articles.length > 0 && (
            <Section label="Articles & Docs">
              {fm.resources.articles.map((a, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} resourceKey={`articles.${i}`} title={a.title} url={a.url} meta={a.kind} />
              ))}
            </Section>
          )}

          {fm.resources.services.length > 0 && (
            <Section label="Services">
              {fm.resources.services.map((s, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} resourceKey={`services.${i}`} title={s.name} url={s.url} meta={s.category} />
              ))}
            </Section>
          )}

          {fm.resources.courses.length > 0 && (
            <Section label="Courses">
              {fm.resources.courses.map((c, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} resourceKey={`courses.${i}`} title={c.title} url={c.url} meta={`${c.provider}${c.paid ? " · paid" : ""}`} />
              ))}
            </Section>
          )}

          <Section label="Your notes">
            <NotesField slug={fm.slug} />
          </Section>
        </div>
        <ConnectionSidebar slug={fm.slug} />
      </div>
    </Page>
  );
}
