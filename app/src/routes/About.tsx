import { Head } from "../components/layout/Head.js";
import { MainColumn } from "../components/layout/MainColumn.js";
import { IcebergIntro } from "../components/domain/IcebergIntro.js";

export function About() {
  return (
    <div className="p-xl">
      <Head title="About" description="Why iceberg exists — the gap between MVP and production." />
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">About iceberg</h1>
          <p className="text-body text-text-mute max-w-[640px]">
            iceberg is a curated curriculum for the engineering skills that distinguish
            a deployed MVP from a real production system — the depth beneath the visible tip.
          </p>
        </header>

        <IcebergIntro />
      </MainColumn>
    </div>
  );
}
