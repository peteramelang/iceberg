import { useSectionObserver } from "../../hooks/useSectionObserver.js";

export interface JumpPill {
  id: string;
  label: string;
  count?: number;
}

export function JumpNav({ pills, offsetTop = 120 }: { pills: JumpPill[]; offsetTop?: number }) {
  const active = useSectionObserver(pills.map(p => p.id), offsetTop);

  const onClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offsetTop + 1;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="Sections" className="sticky top-[52px] z-20 -mx-xs px-xs py-sm backdrop-blur-bar border-b border-border-soft">
      <div className="flex flex-wrap gap-xs">
        {pills.map(p => {
          const isActive = active === p.id;
          return (
            <a
              key={p.id}
              href={`#${p.id}`}
              onClick={onClick(p.id)}
              className={[
                "inline-flex items-center gap-xs px-md py-[5px] rounded-pill text-caption whitespace-nowrap border",
                isActive
                  ? "bg-accent border-accent text-white"
                  : "border-border text-text-mute hover:text-text hover:border-text-dim"
              ].join(" ")}
            >
              <span>{p.label}</span>
              {typeof p.count === "number" && (
                <span className={isActive ? "text-white/70 text-[11px] tabular-nums" : "text-text-dim text-[11px] tabular-nums"}>{p.count}</span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
