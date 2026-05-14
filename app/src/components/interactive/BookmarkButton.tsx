import { bookmarkStore, activityStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";
import { getTopic } from "../../content/index.js";

export function BookmarkButton({ slug }: { slug: string }) {
  useStoreTick(l => bookmarkStore.subscribe(l));
  const on = bookmarkStore.isBookmarked(slug);
  const onClick = () => {
    bookmarkStore.toggle(slug);
    const fm = getTopic(slug)?.frontmatter;
    if (fm) activityStore.append({ type: on ? "unbookmarked" : "bookmarked", topicSlug: slug, topicTitle: fm.title });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={[
        "inline-flex items-center gap-sm px-md py-sm rounded-sm border",
        on ? "bg-panel-2 border-accent text-accent" : "bg-panel border-border text-text-mute hover:text-text hover:border-text-dim"
      ].join(" ")}
    >
      <span aria-hidden>{on ? "★" : "☆"}</span>
      {on ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
