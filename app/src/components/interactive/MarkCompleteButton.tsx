import { progressStore, activityStore, completionPulseStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";
import { getTopic } from "../../content/index.js";
import { connections } from "../../content/index.js";

export function MarkCompleteButton({ slug }: { slug: string }) {
  useStoreTick(l => progressStore.subscribe(l));
  const done = progressStore.getTopicProgress(slug).completed;
  const onClick = () => {
    if (done) {
      progressStore.unmarkTopicComplete(slug);
      return;
    }
    progressStore.markTopicComplete(slug);
    const fm = getTopic(slug)?.frontmatter;
    if (fm) activityStore.append({ type: "completed", topicSlug: slug, topicTitle: fm.title });
    // Pulse the completed topic (sidebar glyph + progress ring) and any topics
    // newly unblocked by this completion (connection-map highlight).
    completionPulseStore.pulse(slug);
    for (const e of connections) {
      if (e.type === "prerequisite" && e.from === slug) {
        completionPulseStore.pulse(e.to);
      }
    }
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
