import { useState } from "react";
import { Link } from "react-router-dom";
import { EDGE_ORDER, EDGE_LABEL, EDGE_HINT, EDGE_GLYPH, EDGE_TOKEN, groupConnections, type RelatedConnection } from "../../utils/connectionHelpers.js";

const CAP = 8;

export function ConnectionSection({ items }: { items: RelatedConnection[] }) {
  const groups = groupConnections(items);
  return (
    <div className="flex flex-col gap-xl">
      {EDGE_ORDER.map(type => {
        const list = groups[type];
        if (list.length === 0) return null;
        return <Group key={type} type={type} list={list} />;
      })}
    </div>
  );
}

function Group({ type, list }: { type: import("../../utils/connectionHelpers.js").EdgeType; list: RelatedConnection[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? list : list.slice(0, CAP);
  const color = EDGE_TOKEN[type];
  return (
    <div>
      <div className="flex items-center gap-sm mb-sm">
        <span
          className="inline-flex items-center gap-xs px-md py-[3px] rounded-sm uppercase tracking-[0.04em] border text-[11px]"
          style={{ color, borderColor: color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
        >
          <span>{EDGE_GLYPH[type]}</span>
          <span>{EDGE_LABEL[type]}</span>
        </span>
        <span className="text-text-dim text-caption">{EDGE_HINT[type]}</span>
      </div>
      <div className="flex flex-col gap-xs">
        {visible.map(c => (
          <Link
            key={`${type}-${c.otherSlug}`}
            to={`/topic/${c.otherSlug}`}
            className="block bg-panel border border-border-soft rounded-sm p-md hover:bg-panel-2"
          >
            <div className="text-body-strong text-text">{c.otherTitle}</div>
            <div className="text-body text-text-mute mt-xs leading-[1.5]">{c.reasoning}</div>
          </Link>
        ))}
      </div>
      {list.length > CAP && (
        <button
          type="button"
          onClick={() => setShowAll(s => !s)}
          className="mt-sm text-caption text-accent hover:text-accent-hover"
        >
          {showAll ? "Show fewer" : `Show ${list.length - CAP} more`}
        </button>
      )}
    </div>
  );
}
