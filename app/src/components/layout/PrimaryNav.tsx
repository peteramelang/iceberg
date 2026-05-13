import { Link } from "react-router-dom";

export function PrimaryNav() {
  return (
    <nav className="h-14 flex items-center border-b border-hairline px-xl gap-xl text-body-strong">
      <Link to="/" className="no-underline">iceberg</Link>
      <Link to="/graph" className="no-underline text-mute hover:text-ink">graph</Link>
      <Link to="/bookmarks" className="no-underline text-mute hover:text-ink">bookmarks</Link>
      <div className="flex-1" />
      <Link to="/settings" className="no-underline text-mute hover:text-ink">settings</Link>
    </nav>
  );
}
