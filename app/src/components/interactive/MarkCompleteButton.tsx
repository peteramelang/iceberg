import { progressStore } from "../../stores/index.js";
import { useTopicProgress } from "../../hooks/useTopicProgress.js";

export function MarkCompleteButton({ slug }: { slug: string }) {
  const p = useTopicProgress(slug);
  const onClick = () => p.completed ? progressStore.unmarkTopicComplete(slug) : progressStore.markTopicComplete(slug);
  return (
    <button type="button" onClick={onClick} className="px-lg py-xs rounded-sm bg-ink text-canvas">
      {p.completed ? "[x] mark incomplete" : "[ ] mark complete"}
    </button>
  );
}
