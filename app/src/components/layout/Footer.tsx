import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-hairline mt-section py-xl text-caption-md text-mute">
      <div className="max-w-[960px] mx-auto px-xl flex flex-wrap gap-md items-baseline">
        <span>iceberg — production-readiness curriculum</span>
        <span aria-hidden="true">·</span>
        <Link to="/credits" className="underline">credits</Link>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/peteramelang/iceberg" target="_blank" rel="noreferrer" className="underline">github</a>
      </div>
    </footer>
  );
}
