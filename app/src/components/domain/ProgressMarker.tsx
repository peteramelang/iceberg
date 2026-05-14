export function ProgressMarker({
  state,
  size = 10
}: {
  state: "empty" | "partial" | "done";
  size?: number;
}) {
  const px = `${size}px`;
  const style: React.CSSProperties = { width: px, height: px };
  if (state === "done") {
    return <span style={style} className="inline-block rounded-full bg-green" aria-label="completed" />;
  }
  if (state === "partial") {
    return (
      <span
        style={{ ...style, background: "conic-gradient(var(--accent) 0 60%, transparent 60%)", border: "1.5px solid var(--accent)" }}
        className="inline-block rounded-full"
        aria-label="in progress"
      />
    );
  }
  return <span style={style} className="inline-block rounded-full border-[1.5px] border-text-dim" aria-label="not started" />;
}
