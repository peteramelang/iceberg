import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { JumpNav, type JumpPill } from "../components/interactive/JumpNav.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";
import { Narrative } from "../components/domain/Narrative.js";
import { Pitfalls } from "../components/domain/Pitfalls.js";
import { CodeExamples } from "../components/domain/CodeExamples.js";
import { ResourceRow } from "../components/domain/ResourceRow.js";
import { ConnectionSection } from "../components/domain/ConnectionGroup.js";
import { ConnectionMap } from "../components/domain/ConnectionMap.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { MarkCompleteButton } from "../components/interactive/MarkCompleteButton.js";
import { BookmarkButton } from "../components/interactive/BookmarkButton.js";
import { NotesField } from "../components/interactive/NotesField.js";
import { getTopic, taxonomy } from "../content/index.js";
import { progressStore, activityStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { connectionsForTopic } from "../utils/connectionHelpers.js";

function resourceTotal(fm: import("../content/types.js").TopicFrontmatter): number {
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Topic() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const { topicSlug } = useParams();
  const entry = topicSlug ? getTopic(topicSlug) : undefined;
  if (!entry || !taxonomy) return <div className="p-xl text-text-mute">Topic not found.</div>;
  const fm = entry.frontmatter;
  const phase = taxonomy.phases.find(p => p.slug === fm.phase);
  const phaseIndex = phase ? phase.topics.indexOf(fm.slug) + 1 : 0;

  const prog = progressStore.getTopicProgress(fm.slug);
  const total = resourceTotal(fm);
  const checked = Object.values(prog.resources).filter(Boolean).length;

  const allConn = useMemo(() => connectionsForTopic(fm.slug), [fm.slug]);

  const pills = useMemo<JumpPill[]>(() => {
    const out: JumpPill[] = [
      { id: "definition", label: "Definition" },
      { id: "in-depth",   label: "In Depth" },
      { id: "pitfalls",   label: "Pitfalls", count: fm.pitfalls.length },
      { id: "code",       label: "Code", count: fm.codeExamples.length }
    ];
    const vCount = (fm.resources.videos.short ? 1 : 0) + (fm.resources.videos.long ? 1 : 0);
    if (vCount > 0) out.push({ id: "videos", label: "Videos", count: vCount });
    if (fm.resources.articles.length > 0) out.push({ id: "articles", label: "Articles", count: fm.resources.articles.length });
    if (fm.resources.services.length > 0) out.push({ id: "services", label: "Services", count: fm.resources.services.length });
    if (fm.resources.courses.length > 0)  out.push({ id: "courses",  label: "Courses",  count: fm.resources.courses.length });
    if (allConn.length > 0)               out.push({ id: "connections", label: "Connections", count: allConn.length });
    out.push({ id: "notes", label: "Notes" });
    return out;
  }, [fm, allConn]);

  const onResourceClick = (key: string, title: string) => {
    activityStore.append({ type: "checked", topicSlug: fm.slug, topicTitle: fm.title, resourceKey: key, resourceTitle: title });
  };

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <MainColumn>
        <header className="mb-md">
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
            {phase?.title} · Topic {phaseIndex} of {phase?.topics.length}
          </div>
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="text-display-xl m-0">{fm.title}</h1>
            <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
          </div>
          <p className="text-body text-text-mute mt-sm max-w-[720px]">{fm.summary}</p>
        </header>

        <JumpNav pills={pills} />

        <section id="definition" className="pt-xl scroll-mt-[120px]">
          <h2 className="text-label text-text-mute uppercase mb-md">Definition</h2>
          <p className="text-body text-text leading-[1.6] max-w-[720px] whitespace-pre-line">{fm.definition}</p>
        </section>

        <section id="in-depth" className="pt-xl mt-xl scroll-mt-[120px]">
          <h2 className="text-label text-text-mute uppercase mb-md">In Depth</h2>
          <Narrative text={fm.narrative} />
        </section>

        <section id="pitfalls" className="pt-xl mt-xl scroll-mt-[120px]">
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Common Pitfalls</h2>
            <span className="text-caption text-text-dim tabular-nums">{fm.pitfalls.length}</span>
          </header>
          <Pitfalls items={fm.pitfalls} />
        </section>

        <section id="code" className="pt-xl mt-xl scroll-mt-[120px]">
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Code</h2>
            <span className="text-caption text-text-dim tabular-nums">{fm.codeExamples.length} examples</span>
          </header>
          <CodeExamples items={fm.codeExamples} />
        </section>

        {(fm.resources.videos.short || fm.resources.videos.long) && (
          <section id="videos" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Videos</h2>
              <span className="text-caption text-text-dim tabular-nums">{(fm.resources.videos.short ? 1 : 0) + (fm.resources.videos.long ? 1 : 0)}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.videos.short && (
                <span onClick={() => onResourceClick("videos.short", fm.resources.videos.short!.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey="videos.short" kind="Video" title={fm.resources.videos.short.title} meta={fm.resources.videos.short.author} url={fm.resources.videos.short.url} secondaryMeta={`${fm.resources.videos.short.durationMinutes} min`} />
                </span>
              )}
              {fm.resources.videos.long && (
                <span onClick={() => onResourceClick("videos.long", fm.resources.videos.long!.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey="videos.long" kind="Video" title={fm.resources.videos.long.title} meta={fm.resources.videos.long.author} url={fm.resources.videos.long.url} secondaryMeta={`${fm.resources.videos.long.durationMinutes} min`} />
                </span>
              )}
            </div>
          </section>
        )}

        {fm.resources.articles.length > 0 && (
          <section id="articles" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Articles &amp; Docs</h2>
              <span className="text-caption text-text-dim tabular-nums">{fm.resources.articles.length}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.articles.map((a, i) => (
                <span key={i} onClick={() => onResourceClick(`articles.${i}`, a.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey={`articles.${i}`} kind="Article" title={a.title} meta={a.publisher ?? a.author ?? a.kind} url={a.url} />
                </span>
              ))}
            </div>
          </section>
        )}

        {fm.resources.services.length > 0 && (
          <section id="services" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Services</h2>
              <span className="text-caption text-text-dim tabular-nums">{fm.resources.services.length}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.services.map((s, i) => (
                <span key={i} onClick={() => onResourceClick(`services.${i}`, s.name)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey={`services.${i}`} kind="Service" title={s.name} meta={`${s.category}${s.vendor ? " · " + s.vendor : ""}`} url={s.url} />
                </span>
              ))}
            </div>
          </section>
        )}

        {fm.resources.courses.length > 0 && (
          <section id="courses" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Courses</h2>
              <span className="text-caption text-text-dim tabular-nums">{fm.resources.courses.length}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.courses.map((c, i) => (
                <span key={i} onClick={() => onResourceClick(`courses.${i}`, c.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey={`courses.${i}`} kind="Course" title={c.title} meta={`${c.provider}${c.paid ? " · paid" : " · free"}`} url={c.url} />
                </span>
              ))}
            </div>
          </section>
        )}

        {allConn.length > 0 && (
          <section id="connections" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Connections</h2>
              <span className="text-caption text-text-dim tabular-nums">{allConn.length} related topics</span>
            </header>
            <ConnectionSection items={allConn} />
          </section>
        )}

        <section id="notes" className="pt-xl mt-xl scroll-mt-[120px]">
          <h2 className="text-label text-text-mute uppercase mb-md">Your notes</h2>
          <NotesField slug={fm.slug} />
        </section>
      </MainColumn>

      <RightRail>
        <RailCard title="Progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={total === 0 ? 0 : checked / total} done={prog.completed}>
              <span className="text-body-strong">{total === 0 ? 0 : Math.round((checked / total) * 100)}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checked} / {total} resources</div>
              <div className="text-caption text-text-mute">Mark complete when all are done</div>
            </div>
          </div>
          <div className="mt-md flex flex-wrap gap-sm">
            <MarkCompleteButton slug={fm.slug} />
            <BookmarkButton slug={fm.slug} />
          </div>
        </RailCard>

        <RailCard title="Connection map">
          <ConnectionMap topicSlug={fm.slug} topicTitle={fm.title} />
        </RailCard>
      </RightRail>
    </div>
  );
}
