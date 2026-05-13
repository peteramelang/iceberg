import { progressStore } from "../../stores/index.js";
import { useTopicProgress } from "../../hooks/useTopicProgress.js";
import { BookmarkButton } from "../interactive/BookmarkButton.js";

export function ResourceRow({ topicSlug, resourceKey, title, url, meta, attribution }: {
  topicSlug: string;
  resourceKey: string;
  title: string;
  url: string;
  meta?: string;
  attribution?: string;
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
      <div className="flex-1">
        <a href={url} target="_blank" rel="noreferrer" className="underline">{title}</a>
        {attribution && <span className="text-caption-md text-mute ml-md">— {attribution}</span>}
      </div>
      {meta && <span className="text-caption-md text-mute">{meta}</span>}
    </div>
  );
}
