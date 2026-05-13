export function ProgressMarker({ state }: { state: "empty" | "partial" | "done" }) {
  const ch = state === "done" ? "x" : state === "partial" ? "~" : " ";
  return <span className="font-mono select-none">[{ch}]</span>;
}
