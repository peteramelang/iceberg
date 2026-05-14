import type { Pitfall } from "../../content/types.js";

export function Pitfalls({ items }: { items: Pitfall[] }) {
  return (
    <ol className="m-0 p-0 list-none">
      {items.map((p, i) => (
        <li
          key={i}
          className={[
            "grid grid-cols-[34px_1fr] gap-md py-lg",
            i === 0 ? "pt-xs" : "border-t border-border-soft"
          ].join(" ")}
        >
          <span className="font-mono text-caption text-text-dim tabular-nums tracking-wide pt-[3px]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="text-body-strong text-text mb-xs">{p.title}</div>
            <div className="text-body text-text-mute leading-[1.6] max-w-[620px]">{p.explanation}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
