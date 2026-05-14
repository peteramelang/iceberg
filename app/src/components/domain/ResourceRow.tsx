import { progressStore, activityStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";
import { InfoDot } from "../interactive/InfoDot.js";

type ResourceKind = "Video" | "Article" | "Service" | "Course";

const KIND_COLOR: Record<ResourceKind, { fg: string; bg: string; border: string }> = {
  Video:   { fg: "var(--amber)", bg: "color-mix(in oklab, var(--amber) 12%, transparent)", border: "color-mix(in oklab, var(--amber) 35%, transparent)" },
  Article: { fg: "var(--blue)",  bg: "color-mix(in oklab, var(--blue) 12%, transparent)",  border: "color-mix(in oklab, var(--blue) 35%, transparent)" },
  Service: { fg: "var(--pink)",  bg: "color-mix(in oklab, var(--pink) 12%, transparent)",  border: "color-mix(in oklab, var(--pink) 35%, transparent)" },
  Course:  { fg: "var(--green)", bg: "color-mix(in oklab, var(--green) 12%, transparent)", border: "color-mix(in oklab, var(--green) 35%, transparent)" }
};

export function ResourceRow({
  topicSlug, topicTitle, resourceKey, kind, title, meta, url, secondaryMeta, reasoning
}: {
  topicSlug: string;
  topicTitle: string;
  resourceKey: string;
  kind: ResourceKind;
  title: string;
  meta: string;
  url: string;
  secondaryMeta?: string;
  reasoning?: string;
}) {
  useStoreTick(l => progressStore.subscribe(l));
  const checked = progressStore.getTopicProgress(topicSlug).resources[resourceKey] === true;
  const c = KIND_COLOR[kind];

  // Toggle = check/uncheck. Only log "checked" activity on transition false→true;
  // unchecking is corrective and doesn't merit an activity-feed entry.
  const onToggle = () => {
    const next = !checked;
    progressStore.setResourceChecked(topicSlug, resourceKey, next);
    if (next) {
      activityStore.append({
        type: "checked",
        topicSlug,
        topicTitle,
        resourceKey,
        resourceTitle: title
      });
    }
  };

  return (
    <div className="grid grid-cols-[28px_1fr_auto] gap-md items-center px-md py-md bg-panel border border-border-soft rounded-sm hover:bg-panel-2 hover:border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={checked ? `Mark "${title}" unchecked` : `Mark "${title}" checked`}
        // 28×28 hit area (≥WCAG 2.5.8 24px minimum); the inner span is the
        // 18×18 visual checkbox glyph so the design stays compact.
        className="w-[28px] h-[28px] flex items-center justify-center -ml-[5px]"
      >
        <span
          aria-hidden
          className={[
            "block w-[18px] h-[18px] rounded-sm border-[1.5px] flex items-center justify-center text-[12px]",
            checked ? "bg-accent border-accent text-white" : "border-border text-transparent"
          ].join(" ")}
        >
          ✓
        </span>
      </button>
      <div className="min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="block outline-offset-2"
        >
          <div className="flex items-center gap-sm flex-wrap">
            <span
              className="inline-block text-[11px] px-xs py-[1px] rounded-sm border"
              style={{ color: c.fg, background: c.bg, borderColor: c.border }}
            >{kind}</span>
            <span className="text-body-strong text-text truncate">{title}</span>
          </div>
          <div className="text-caption text-text-mute mt-xs truncate">{meta}</div>
        </a>
        {reasoning && (
          <div className="mt-xs">
            <InfoDot reasoning={reasoning} label={`Why "${title}" was picked`} />
          </div>
        )}
      </div>
      {secondaryMeta && <div className="text-caption text-text-dim tabular-nums">{secondaryMeta}</div>}
    </div>
  );
}
