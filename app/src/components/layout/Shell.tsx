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
        <Topbar onOpenSearch={openSearch} onToggleSidebar={openDrawer} />
        <main id="main" className="flex-1 min-w-0">{children}</main>
      </div>
      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
