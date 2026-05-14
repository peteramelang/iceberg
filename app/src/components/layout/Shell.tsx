import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { SearchPalette } from "../interactive/SearchPalette.js";
import { taxonomy, topics } from "../../content/index.js";
import { progressStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";

export function Shell({ children }: { children: ReactNode }) {
  useStoreTick(l => progressStore.subscribe(l));
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const totalResourcesPerTopic: Record<string, number> = {};
  for (const t of topics) {
    const fm = t.frontmatter;
    totalResourcesPerTopic[fm.slug] =
      (fm.resources.videos.short ? 1 : 0)
      + (fm.resources.videos.long ? 1 : 0)
      + fm.resources.articles.length
      + fm.resources.services.length
      + fm.resources.courses.length;
  }
  const overall = progressStore.getOverallProgress(totalResourcesPerTopic);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  useEffect(() => {
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("iceberg-open-search", onOpen as EventListener);
    return () => window.removeEventListener("iceberg-open-search", onOpen as EventListener);
  }, []);

  return (
    <div className="min-h-[100dvh] flex bg-bg text-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only fixed top-sm left-sm z-50 bg-accent text-white px-md py-sm rounded-sm"
      >
        Skip to main content
      </a>
      <div className="hidden md:block"><Sidebar /></div>
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <div className="absolute left-0 top-0 h-full"><Sidebar onNavigate={closeDrawer} /></div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          topicsCompleted={overall.completedTopics}
          topicsTotal={taxonomy?.phases.reduce((acc, p) => acc + p.topics.length, 0) ?? 0}
          onOpenSearch={openSearch}
          onToggleSidebar={() => setDrawer(true)}
        />
        <main id="main" className="flex-1 min-w-0">{children}</main>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
