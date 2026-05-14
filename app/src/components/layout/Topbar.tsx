import { useResolvedTheme } from "../../hooks/useResolvedTheme.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";
import { progressStore, themeStore } from "../../stores/index.js";
import { taxonomy } from "../../content/index.js";
import { totalResourcesPerTopic } from "../../content/derived.js";

const totalTopics = taxonomy?.phases.reduce((acc, p) => acc + p.topics.length, 0) ?? 0;

export function Topbar({
  onOpenSearch,
  onToggleSidebar
}: {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}) {
  const theme = useResolvedTheme();
  useStoreTick(l => progressStore.subscribe(l));
  const overall = progressStore.getOverallProgress(totalResourcesPerTopic);

  return (
    <header className="sticky top-0 z-30 h-[52px] flex items-center gap-md px-xl border-b border-border-soft bg-bg">
      {onToggleSidebar && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onToggleSidebar}
          className="md:hidden h-11 w-11 -ml-sm rounded-sm flex items-center justify-center hover:bg-panel-2 text-text-mute"
        >
          <span aria-hidden>☰</span>
        </button>
      )}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex-1 max-w-[420px] h-8 px-md rounded-sm border border-border bg-panel-2 text-text-mute text-body flex items-center gap-sm hover:border-border hover:text-text"
        aria-label="Open search palette"
      >
        <span aria-hidden>⌕</span>
        <span className="truncate">Search topics, resources, connections…</span>
        <span className="ml-auto font-mono text-caption border border-border rounded-sm px-xs text-text-dim">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-md text-text-mute text-caption">
        <span className="tabular-nums" aria-label={`${overall.completedTopics} of ${totalTopics} topics completed`}>
          {overall.completedTopics} / {totalTopics} topics
        </span>
        <button
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => themeStore.set(theme === "dark" ? "light" : "dark")}
          className="h-11 w-11 rounded-sm flex items-center justify-center hover:bg-panel-2 hover:text-text"
        >
          <span aria-hidden>{theme === "dark" ? "☼" : "☾"}</span>
        </button>
      </div>
    </header>
  );
}
