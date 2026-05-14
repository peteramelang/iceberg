import { Head } from "../components/layout/Head.js";
import { MainColumn } from "../components/layout/MainColumn.js";
import { PathCard } from "../components/domain/PathCard.js";
import { paths } from "../content/index.js";

export function Paths() {
  return (
    <div className="p-xl">
      <Head title="Learning paths" description="Curated sequences of topics for specific audiences." />
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">Learning paths</h1>
          <p className="text-body text-text-mute max-w-[640px]">
            Each path is an opinionated sequence of topics for a specific audience and goal. Start at the top, work down.
          </p>
        </header>
        {paths.length === 0 ? (
          <div className="text-text-mute italic">No paths yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {paths.map(p => <PathCard key={p.slug} path={p} />)}
          </div>
        )}
      </MainColumn>
    </div>
  );
}
