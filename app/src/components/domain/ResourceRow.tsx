import { progressStore } from "../../stores/index.js";
import { useTopicProgress } from "../../hooks/useTopicProgress.js";
import { BookmarkButton } from "../interactive/BookmarkButton.js";

export function ResourceRow({ topicSlug, resourceKey, title, url, meta }: {
  topicSlug: string; resourceKey: string; title: string; url: string; meta?: string;
}) {
  const prog = useTopicProgress(topicSlug);
  const checked = !!prog.resources[resourceKey];
  return (
    <div className="flex items-baseline gap-md py-sm">
      <button
        type="button"
        onClick={() => progressStore.setResourceChecked(topicSlug, resourceKey, !checked)}
        className="font-mono select-none"
        aria-label={checked ? "uncheck" : "check"}
      >
        [{checked ? "x" : " "}]
      </button>
      <BookmarkButton topic={topicSlug} resource={resourceKey} />
      <a href={url} target="_blank" rel="noreferrer" className="flex-1 underline">{title}</a>
      {meta && <span className="text-caption-md text-mute">{meta}</span>}
    </div>
  );
}
