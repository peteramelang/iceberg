import { PrimaryNav } from "./PrimaryNav.js";
import { Footer } from "./Footer.js";
import { SearchPalette } from "../interactive/SearchPalette.js";
import { useEffect, useState, type ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("iceberg-open-search", onOpen as EventListener);
    return () => window.removeEventListener("iceberg-open-search", onOpen as EventListener);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <PrimaryNav />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-xl py-xl">{children}</main>
      <Footer />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
