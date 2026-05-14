// The iceberg brand mark — silhouette is also a graph (Concept 5).
// Three nodes at the visible tip, three more in the submerged depth,
// connected to echo the curriculum's typed-edge model. Faint dashed
// waterline reads as "what you can see vs. what's actually there."
//
// Reusable across the sidebar (22×22), favicon (32×32 raster derived),
// OG card (large), and anywhere else the wordmark needs a glyph.

export function BrandMark({
  size = 22,
  title
}: { size?: number; title?: string }) {
  // Decorative by default (aria-hidden + no title). Pass `title` to make it
  // labelled — e.g. in a standalone link without surrounding text.
  return (
    <svg
      viewBox="0 0 22 22"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* edges — drawn first so node disks sit on top */}
      <g stroke="var(--accent)" strokeWidth="0.75" strokeOpacity="0.5" fill="none">
        <line x1="11" y1="4"  x2="7"  y2="9" />
        <line x1="11" y1="4"  x2="15" y2="9" />
        <line x1="7"  y1="9"  x2="15" y2="9" />
        <line x1="7"  y1="9"  x2="5"  y2="15" />
        <line x1="15" y1="9"  x2="17" y2="15" />
        <line x1="5"  y1="15" x2="11" y2="19" />
        <line x1="17" y1="15" x2="11" y2="19" />
        <line x1="7"  y1="9"  x2="11" y2="19" />
      </g>
      {/* waterline */}
      <line x1="1" y1="10.5" x2="21" y2="10.5" stroke="var(--text-dim)" strokeWidth="0.5" strokeDasharray="1 1" />
      {/* nodes above water — solid accent */}
      <circle cx="11" cy="4" r="1.5" fill="var(--accent)" />
      <circle cx="7"  cy="9" r="1.2" fill="var(--accent)" />
      <circle cx="15" cy="9" r="1.2" fill="var(--accent)" />
      {/* nodes below — blue, suggesting depth */}
      <circle cx="5"  cy="15" r="1" fill="var(--blue)" />
      <circle cx="17" cy="15" r="1" fill="var(--blue)" />
      <circle cx="11" cy="19" r="1" fill="var(--blue)" />
    </svg>
  );
}
