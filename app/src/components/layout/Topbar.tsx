import { useState } from "react";
import { useResolvedTheme } from "../../hooks/useResolvedTheme.js";
import { themeStore } from "../../stores/index.js";

export function Topbar({
  topicsCompleted,
  topicsTotal,
  onOpenSearch,
  onToggleSidebar
}: {
  topicsCompleted: number;
  topicsTotal: number;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}) {
  const theme = useResolvedTheme();
  // @ts-ignore - intentionally declared for future use
  const [hover, setHover] = useState(false);
  return (
    <header className="sticky top-0 z-30 h-[52px] flex items-center gap-md px-xl border-b border-border-soft bg-bg">
      {onToggleSidebar && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onToggleSidebar}
          className="md:hidden h-8 w-8 rounded-sm flex items-center justify-center hover:bg-panel-2 text-text-mute"
        >
          ☰
        </button>
      )}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex-1 max-w-[420px] h-8 px-md rounded-sm border border-border bg-panel-2 text-text-mute text-body flex items-center gap-sm hover:border-border hover:text-text"
        aria-label="Open search palette"
      >
        <span>⌕</span>
        <span className="truncate">Search topics, resources, connections…</span>
        <span className="ml-auto font-mono text-caption border border-border rounded-sm px-xs text-text-dim">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-md text-text-mute text-caption">
        <span className="tabular-nums">{topicsCompleted} / {topicsTotal} topics</span>
        <button
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => themeStore.set(theme === "dark" ? "light" : "dark")}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="h-8 w-8 rounded-sm flex items-center justify-center hover:bg-panel-2 hover:text-text"
        >
          {theme === "dark" ? "☼" : "☾"}
        </button>
      </div>
    </header>
  );
}
