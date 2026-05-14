import type { TopicFrontmatter } from "../../content/types.js";
import { progressStore } from "../../stores/index.js";

// Compact per-resource checklist for the Topic right-rail Progress card.
// Mirrors the main-column ResourceRow checkboxes — they share the same
// progressStore.resources[resourceKey] keys so checking either side
// updates the other immediately (both subscribe via useStoreTick at the
// route level, so a single render pass propagates the change).
//
// Spec §5 right rail Progress card: "every resource (video short/long,
// each article, each service, each course) gets a row with a checkbox
// glyph and a short label."

interface ChecklistItem {
  key: string;
  label: string;
  kind: string;
}

function itemsForTopic(fm: TopicFrontmatter): ChecklistItem[] {
  const out: ChecklistItem[] = [];
  if (fm.resources.videos.short) out.push({ key: "videos.short", label: fm.resources.videos.short.title, kind: "Video" });
  if (fm.resources.videos.long) out.push({ key: "videos.long", label: fm.resources.videos.long.title, kind: "Video" });
  fm.resources.articles.forEach((a, i) => out.push({ key: `articles.${i}`, label: a.title, kind: "Article" }));
  fm.resources.services.forEach((s, i) => out.push({ key: `services.${i}`, label: s.name, kind: "Service" }));
  fm.resources.courses.forEach((c, i) => out.push({ key: `courses.${i}`, label: c.title, kind: "Course" }));
  return out;
}

export function ResourceChecklist({ fm }: { fm: TopicFrontmatter }) {
  const items = itemsForTopic(fm);
  if (items.length === 0) return null;
  const prog = progressStore.getTopicProgress(fm.slug);

  return (
    <ul className="mt-md flex flex-col gap-xs border-t border-border-soft pt-md">
      {items.map(item => {
        const checked = prog.resources[item.key] === true;
        return (
          <li key={item.key}>
            <button
              type="button"
              aria-pressed={checked}
              aria-label={`${checked ? "Mark unchecked" : "Mark checked"}: ${item.label}`}
              onClick={() => progressStore.setResourceChecked(fm.slug, item.key, !checked)}
              // Min-height pushes the row to ≥24px tall (WCAG 2.5.8 target).
              className="w-full min-h-[28px] flex items-center gap-sm text-left text-caption text-text-mute hover:text-text"
            >
              <span
                className={[
                  "w-[16px] h-[16px] shrink-0 rounded-sm border-[1.5px] flex items-center justify-center text-[10px]",
                  checked ? "bg-accent border-accent text-white" : "border-border text-transparent"
                ].join(" ")}
                aria-hidden
              >
                ✓
              </span>
              <span className="truncate flex-1">{item.label}</span>
              <span aria-hidden className="text-text-dim text-[10px] uppercase tracking-[0.04em] shrink-0">{item.kind}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
