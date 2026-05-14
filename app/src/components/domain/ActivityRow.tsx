import { Link } from "react-router-dom";
import type { ActivityEntry } from "../../stores/index.js";
import { formatRelative } from "../../utils/activityHelpers.js";

const ICON: Record<ActivityEntry["type"], string> = {
  completed: "●",
  checked: "✓",
  bookmarked: "★",
  unbookmarked: "☆"
};

export function ActivityRow({ entry }: { entry: ActivityEntry }) {
  let body: React.ReactNode = null;
  if (entry.type === "completed") {
    body = <>Marked complete — <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  } else if (entry.type === "checked") {
    body = <>Checked <span className="text-text">{entry.resourceTitle ?? entry.resourceKey}</span> in <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  } else if (entry.type === "bookmarked") {
    body = <>Bookmarked <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  } else {
    body = <>Removed bookmark — <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  }
  return (
    <div className="flex items-baseline gap-md py-sm border-t border-border-soft first:border-t-0 text-text-mute text-body">
      <span className="w-[14px] text-accent inline-flex justify-center" aria-hidden>{ICON[entry.type]}</span>
      <span className="flex-1 min-w-0 truncate">{body}</span>
      <span className="ml-auto text-text-dim text-caption tabular-nums">{formatRelative(entry.at)}</span>
    </div>
  );
}
