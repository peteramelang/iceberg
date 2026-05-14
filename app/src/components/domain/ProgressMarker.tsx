export function ProgressMarker({
  state,
  size = 10,
  pulse = false
}: {
  state: "empty" | "partial" | "done";
  size?: number;
  pulse?: boolean;
}) {
  const px = `${size}px`;
  const style: React.CSSProperties = { width: px, height: px };
  const cls = pulse ? "pulse-scale" : "";
  if (state === "done") {
    return <span style={style} className={`inline-block rounded-full bg-green ${cls}`} aria-label="completed" />;
  }
  if (state === "partial") {
    return (
      <span
        style={{ ...style, background: "conic-gradient(var(--accent) 0 60%, transparent 60%)", border: "1.5px solid var(--accent)" }}
        className={`inline-block rounded-full ${cls}`}
        aria-label="in progress"
      />
    );
  }
  return <span style={style} className={`inline-block rounded-full border-[1.5px] border-text-dim ${cls}`} aria-label="not started" />;
}
