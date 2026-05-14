import type { ReactNode } from "react";

export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden lg:flex flex-col gap-lg w-[320px] shrink-0 self-start">
      {children}
    </aside>
  );
}

export function RailCard({ title, children, sticky = true }: { title?: string; children: ReactNode; sticky?: boolean }) {
  // Each card individually sticky-pins to top:80px (52px topbar + 28px breathing room).
  // Multiple sticky siblings naturally stack as the user scrolls — when card 2
  // reaches the top it pushes card 1 up rather than overlapping it.
  return (
    <section
      className={[
        "bg-panel border border-border-soft rounded p-lg",
        // Cap card height when sticky so long content (like the resource checklist)
        // doesn't push the next card off-screen on short viewports.
        sticky ? "lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-thin" : ""
      ].join(" ")}
    >
      {title && <h3 className="text-label text-text-dim uppercase mb-md">{title}</h3>}
      {children}
    </section>
  );
}
