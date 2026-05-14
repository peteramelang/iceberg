import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { SearchPalette } from "../interactive/SearchPalette.js";

export function Shell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const openDrawer = useCallback(() => setDrawer(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("iceberg-open-search", onOpen as EventListener);
    return () => window.removeEventListener("iceberg-open-search", onOpen as EventListener);
  }, []);

  // Esc dismisses the mobile drawer (the same way it dismisses the search
  // palette). SearchPalette owns its own Esc listener and bails out early
  // when it's not open, so the two handlers don't fight.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, closeDrawer]);

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
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/50 cursor-default"
          />
          <div className="absolute left-0 top-0 h-full"><Sidebar onNavigate={closeDrawer} /></div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenSearch={openSearch} onToggleSidebar={openDrawer} />
        {/* 1480px cap per spec §1. left-aligned within the cap so right rails
            still anchor cleanly; only kicks in on ultra-wide displays. */}
        <main id="main" className="flex-1 min-w-0 w-full max-w-[1480px]">{children}</main>
      </div>
      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
