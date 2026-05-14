export function ProgressRing({
  value,
  size = 58,
  thickness = 5,
  done = false,
  pulse = false,
  children
}: { value: number; size?: number; thickness?: number; done?: boolean; pulse?: boolean; children?: React.ReactNode }) {
  const clamped = Math.max(0, Math.min(1, value));
  const color = done ? "var(--green)" : "var(--accent)";
  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: `conic-gradient(${color} 0 ${clamped * 100}%, var(--panel-3) ${clamped * 100}% 100%)`,
    transition: "background 400ms ease-out"
  };
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${pulse ? "pulse-ring" : ""}`}
      style={style}
      aria-label={`${Math.round(clamped * 100)}% complete`}
    >
      <span
        className="absolute rounded-full bg-panel"
        style={{ inset: thickness }}
      />
      <span className="relative text-body-strong tabular-nums">{children ?? `${Math.round(clamped * 100)}%`}</span>
    </span>
  );
}
