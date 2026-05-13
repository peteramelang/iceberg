import { PrimaryNav } from "./PrimaryNav.js";
import { Footer } from "./Footer.js";
import type { ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PrimaryNav />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-xl py-xl">{children}</main>
      <Footer />
    </div>
  );
}
