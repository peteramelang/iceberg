import type { Difficulty } from "../../content/types.js";

const COLORS: Record<Difficulty, { fg: string; bg: string; border: string }> = {
  beginner:     { fg: "var(--green)",  bg: "color-mix(in oklab, var(--green) 12%, transparent)",  border: "color-mix(in oklab, var(--green) 35%, transparent)" },
  intermediate: { fg: "var(--amber)",  bg: "color-mix(in oklab, var(--amber) 12%, transparent)",  border: "color-mix(in oklab, var(--amber) 35%, transparent)" },
  advanced:     { fg: "var(--danger)", bg: "color-mix(in oklab, var(--danger) 12%, transparent)", border: "color-mix(in oklab, var(--danger) 35%, transparent)" }
};

const LABEL: Record<Difficulty, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export function DifficultyBadge({
  difficulty, hours, size = "md"
}: { difficulty: Difficulty; hours: number; size?: "sm" | "md" }) {
  const c = COLORS[difficulty];
  const padX = size === "sm" ? 8 : 10;
  const padY = size === "sm" ? 2 : 4;
  const font = size === "sm" ? 10.5 : 12;
  return (
    <span
      className="inline-flex items-center gap-sm rounded-pill border whitespace-nowrap"
      style={{ color: c.fg, background: c.bg, borderColor: c.border, padding: `${padY}px ${padX}px`, fontSize: font }}
    >
      <span className="font-semibold">{LABEL[difficulty]}</span>
      <span className="text-text-mute tabular-nums">~{Number.isInteger(hours) ? hours : hours.toFixed(1)}h</span>
    </span>
  );
}
