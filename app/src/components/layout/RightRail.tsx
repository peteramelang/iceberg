import type { ReactNode } from "react";

export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden lg:flex flex-col gap-lg w-[320px] shrink-0">
      {children}
    </aside>
  );
}

export function RailCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="bg-panel border border-border-soft rounded p-lg">
      {title && <h4 className="text-label text-text-dim uppercase mb-md">{title}</h4>}
      {children}
    </section>
  );
}
