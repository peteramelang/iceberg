export function formatRelative(at: number, now: number = Date.now()): string {
  const diffSec = Math.floor((now - at) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "yesterday";
  if (diffD < 7) return `${diffD} d ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `${diffW} w ago`;
  return new Date(at).toISOString().slice(0, 10);
}
