import { useBookmark } from "../../hooks/useBookmark.js";

export function BookmarkButton({ topic, resource }: { topic: string; resource?: string }) {
  const { isBookmarked, toggle } = useBookmark(topic, resource);
  return (
    <button type="button" onClick={toggle} className="font-mono select-none">
      [{isBookmarked ? "*" : " "}]
    </button>
  );
}
