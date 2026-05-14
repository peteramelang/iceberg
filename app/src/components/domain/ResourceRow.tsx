import { progressStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";

type ResourceKind = "Video" | "Article" | "Service" | "Course";

const KIND_COLOR: Record<ResourceKind, { fg: string; bg: string; border: string }> = {
  Video:   { fg: "var(--amber)", bg: "color-mix(in oklab, var(--amber) 12%, transparent)", border: "color-mix(in oklab, var(--amber) 35%, transparent)" },
  Article: { fg: "var(--blue)",  bg: "color-mix(in oklab, var(--blue) 12%, transparent)",  border: "color-mix(in oklab, var(--blue) 35%, transparent)" },
  Service: { fg: "var(--pink)",  bg: "color-mix(in oklab, var(--pink) 12%, transparent)",  border: "color-mix(in oklab, var(--pink) 35%, transparent)" },
  Course:  { fg: "var(--green)", bg: "color-mix(in oklab, var(--green) 12%, transparent)", border: "color-mix(in oklab, var(--green) 35%, transparent)" }
};

export function ResourceRow({
  topicSlug, resourceKey, kind, title, meta, url, secondaryMeta
}: {
  topicSlug: string;
  resourceKey: string;
  kind: ResourceKind;
  title: string;
  meta: string;
  url: string;
  secondaryMeta?: string;
}) {
  useStoreTick(l => progressStore.subscribe(l));
  const checked = progressStore.getTopicProgress(topicSlug).resources[resourceKey] === true;
  const c = KIND_COLOR[kind];

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    progressStore.setResourceChecked(topicSlug, resourceKey, !checked);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="grid grid-cols-[22px_1fr_auto] gap-md items-center px-md py-md bg-panel border border-border-soft rounded-sm hover:bg-panel-2 hover:border-border"
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={checked}
        aria-label={checked ? "Mark unchecked" : "Mark checked"}
        className={[
          "w-[18px] h-[18px] rounded-sm border-[1.5px] flex items-center justify-center",
          checked ? "bg-accent border-accent text-white" : "border-border text-transparent"
        ].join(" ")}
      >
        ✓
      </button>
      <div className="min-w-0">
        <div className="flex items-center gap-sm flex-wrap">
          <span
            className="inline-block text-[11px] px-xs py-[1px] rounded-sm border"
            style={{ color: c.fg, background: c.bg, borderColor: c.border }}
          >{kind}</span>
          <span className="text-body-strong text-text truncate">{title}</span>
        </div>
        <div className="text-caption text-text-mute mt-xs truncate">{meta}</div>
      </div>
      {secondaryMeta && <div className="text-caption text-text-dim tabular-nums">{secondaryMeta}</div>}
    </a>
  );
}
