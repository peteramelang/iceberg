import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Head } from "../components/layout/Head.js";
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
import { ResourceChecklist } from "../components/domain/ResourceChecklist.js";
import { MarkCompleteButton } from "../components/interactive/MarkCompleteButton.js";
import { BookmarkButton } from "../components/interactive/BookmarkButton.js";
import { NotesField } from "../components/interactive/NotesField.js";
import { getPhase, getTopic, taxonomy } from "../content/index.js";
import { resourceTotalFor } from "../content/derived.js";
import { getPathBySlug } from "../utils/pathHelpers.js";
import type { LearningPath, TopicFrontmatter } from "../content/types.js";
import { progressStore } from "../stores/index.js";
import { useStoreTick } from "../hooks/useStoreSubscription.js";
import { useCompletionPulse } from "../hooks/useCompletionPulse.js";
import { connectionsForTopic } from "../utils/connectionHelpers.js";
import { InfoDot } from "../components/interactive/InfoDot.js";

function formatUpdated(iso: string): string {
  // Render ISO datetime as YYYY-MM-DD. Returns the raw input on parse failure
  // so the page doesn't blank out on malformed data (defensive — schema says
  // it's always valid).
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function youtubeEmbedUrl(watchUrl: string): string | null {
  // Accepts https://www.youtube.com/watch?v=<id> (the canonical form used
  // throughout content). Returns the matching /embed/ URL, or null if the
  // input doesn't parse.
  try {
    const u = new URL(watchUrl);
    const id = u.searchParams.get("v");
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Route wrapper: resolves the topic and the optional ?from-path= context,
// handles not-found, then renders TopicView. No hooks here — they all live
// inside TopicView where the frontmatter is guaranteed-defined. Splitting
// like this keeps the route bullet-proof against the Rules-of-Hooks
// regression that "move the early-return earlier" would otherwise cause.
export function Topic() {
  const { topicSlug } = useParams();
  const [searchParams] = useSearchParams();
  const entry = topicSlug ? getTopic(topicSlug) : undefined;
  if (!entry || !taxonomy) return <div className="p-xl text-text-mute">Topic not found.</div>;

  const fromPathSlug = searchParams.get("from-path");
  const fromPath = fromPathSlug ? getPathBySlug(fromPathSlug) : undefined;

  // Key on slug so navigation between topics fully remounts TopicView.
  // That resets any per-topic local UI state (e.g. JumpNav's section
  // observer) cleanly without us having to thread slug into every dep
  // array inside.
  return (
    <TopicView
      key={entry.frontmatter.slug}
      fm={entry.frontmatter}
      fromPath={fromPath}
    />
  );
}

interface TopicViewProps {
  fm: TopicFrontmatter;
  fromPath: LearningPath | undefined;
}

function TopicView({ fm, fromPath }: TopicViewProps) {
  useStoreTick(l => progressStore.subscribe(l));

  const nextInPath = useMemo(() => {
    if (!fromPath) return null;
    const idx = fromPath.topics.indexOf(fm.slug);
    if (idx < 0 || idx === fromPath.topics.length - 1) return null;
    const nextSlug = fromPath.topics[idx + 1];
    if (!nextSlug) return null;
    const nextTopic = getTopic(nextSlug);
    if (!nextTopic) return null;
    return { slug: nextSlug, title: nextTopic.frontmatter.title, position: idx + 2, total: fromPath.topics.length };
  }, [fromPath, fm.slug]);

  const pulse = useCompletionPulse(fm.slug);
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

  const phase = getPhase(fm.phase);
  const phaseIndex = phase ? phase.topics.indexOf(fm.slug) + 1 : 0;
  const prog = progressStore.getTopicProgress(fm.slug);
  const total = resourceTotalFor(fm.slug);
  const checked = Object.values(prog.resources).filter(Boolean).length;

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <Head title={fm.title} description={fm.summary} />
      <MainColumn>
        <header className="mb-md">
          {fromPath && (
            <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
              In path:{" "}
              <Link to={`/path/${fromPath.slug}`} className="text-accent hover:text-accent-hover">
                {fromPath.title}
              </Link>
            </div>
          )}
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            {!fromPath && <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />}
            {phase?.title} · Topic {phaseIndex} of {phase?.topics.length}
          </div>
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="text-display-xl m-0">{fm.title}</h1>
            <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
          </div>
        </header>

        <Primer fm={fm} />

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
                <ResourceRow topicSlug={fm.slug} topicTitle={fm.title} resourceKey="videos.short" kind="Video" title={fm.resources.videos.short.title} meta={fm.resources.videos.short.author} url={fm.resources.videos.short.url} secondaryMeta={`${fm.resources.videos.short.durationMinutes} min`} reasoning={fm.resources.videos.short.reasoning} />
              )}
              {fm.resources.videos.long && (
                <ResourceRow topicSlug={fm.slug} topicTitle={fm.title} resourceKey="videos.long" kind="Video" title={fm.resources.videos.long.title} meta={fm.resources.videos.long.author} url={fm.resources.videos.long.url} secondaryMeta={`${fm.resources.videos.long.durationMinutes} min`} reasoning={fm.resources.videos.long.reasoning} />
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
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`articles.${i}`} kind="Article" title={a.title} meta={a.publisher ?? a.author ?? a.kind} url={a.url} reasoning={a.reasoning} />
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
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`services.${i}`} kind="Service" title={s.name} meta={`${s.category}${s.vendor ? " · " + s.vendor : ""}`} url={s.url} reasoning={s.reasoning} />
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
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`courses.${i}`} kind="Course" title={c.title} meta={`${c.provider}${c.paid ? " · paid" : " · free"}`} url={c.url} reasoning={c.reasoning} />
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

        {fromPath && nextInPath && (
          <section className="pt-xl mt-xl border-t border-border-soft">
            <div className="text-label text-text-mute uppercase mb-sm">Next in {fromPath.title}</div>
            <Link
              to={`/topic/${nextInPath.slug}?from-path=${fromPath.slug}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-md p-lg bg-panel border border-border-soft rounded hover:bg-panel-2 hover:border-border"
            >
              <span className="font-mono text-caption text-text-dim tabular-nums">
                {String(nextInPath.position).padStart(2, "0")} / {String(nextInPath.total).padStart(2, "0")}
              </span>
              <span className="text-body-strong text-text">{nextInPath.title}</span>
              <span className="text-text-mute">→</span>
            </Link>
          </section>
        )}
        {fromPath && !nextInPath && (
          <section className="pt-xl mt-xl border-t border-border-soft">
            <div className="text-label text-text-mute uppercase mb-sm">End of path</div>
            <Link to={`/path/${fromPath.slug}`} className="text-accent hover:text-accent-hover text-body">
              ← Back to {fromPath.title}
            </Link>
          </section>
        )}

        <div className="pt-xl mt-xl border-t border-border-soft text-caption text-text-dim">
          Updated {formatUpdated(fm.lastUpdatedAt)}
        </div>
      </MainColumn>

      <RightRail>
        <RailCard title="Progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={total === 0 ? 0 : checked / total} done={prog.completed} pulse={pulse}>
              <span className="text-body-strong">{total === 0 ? 0 : Math.round((checked / total) * 100)}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checked} / {total} resources</div>
              <div className="text-caption text-text-mute">Mark complete when all are done</div>
            </div>
          </div>
          <ResourceChecklist fm={fm} />
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

function Primer({ fm }: { fm: TopicFrontmatter }) {
  const v = fm.shortExplainerVideo;
  const embedUrl = v ? youtubeEmbedUrl(v.url) : null;

  return (
    <section
      className={[
        "mb-xl bg-panel-2 border border-border-soft rounded p-lg",
        v && embedUrl
          ? "grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)] gap-lg items-start"
          : ""
      ].join(" ")}
    >
      <div>
        <div className="text-label text-text-dim uppercase mb-xs">TL;DR</div>
        <p className="text-[15px] leading-[1.6] text-text m-0">{fm.tldr}</p>
      </div>
      {v && embedUrl && (
        <div>
          <div className="aspect-video w-full rounded-sm overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title={v.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="mt-sm flex items-start gap-sm">
            <div className="min-w-0 flex-1">
              <div className="text-body-strong text-text truncate">{v.title}</div>
              <div className="text-caption text-text-mute truncate">{v.author} · {formatDuration(v.durationSeconds)}</div>
            </div>
            <InfoDot reasoning={v.reasoning} label={`Why this primer was picked`} />
          </div>
        </div>
      )}
    </section>
  );
}
