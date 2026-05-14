import { MainColumn } from "../components/layout/MainColumn.js";
import { PathCard } from "../components/domain/PathCard.js";
import { paths } from "../content/index.js";

export function Paths() {
  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">Learning paths</h1>
          <p className="text-body text-text-mute max-w-[640px]">
            Each path is an opinionated sequence of topics for a specific audience and goal. Start at the top, work down.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {paths.map(p => <PathCard key={p.slug} path={p} />)}
        </div>
      </MainColumn>
    </div>
  );
}
