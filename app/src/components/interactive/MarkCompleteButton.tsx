import { progressStore, activityStore } from "../../stores/index.js";
import { useStoreSubscription } from "../../hooks/useStoreSubscription.js";
import { getTopic } from "../../content/index.js";

export function MarkCompleteButton({ slug }: { slug: string }) {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const done = progressStore.getTopicProgress(slug).completed;
  const onClick = () => {
    if (done) {
      progressStore.unmarkTopicComplete(slug);
      return;
    }
    progressStore.markTopicComplete(slug);
    const fm = getTopic(slug)?.frontmatter;
    if (fm) activityStore.append({ type: "completed", topicSlug: slug, topicTitle: fm.title });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done}
      className={[
        "inline-flex items-center gap-sm px-md py-sm rounded-sm font-medium",
        done ? "bg-green text-white" : "bg-accent text-white hover:bg-accent-hover"
      ].join(" ")}
    >
      {done ? "✓ Completed" : "Mark complete"}
    </button>
  );
}
