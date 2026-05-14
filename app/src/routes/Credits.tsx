import { Head } from "../components/layout/Head.js";
import { MainColumn } from "../components/layout/MainColumn.js";

export function Credits() {
  return (
    <div className="p-xl">
      <Head title="Credits" />
      <MainColumn maxWidth="max-w-[720px]">
        <h1 className="text-display-xl m-0 mb-md">Credits</h1>
        <p className="text-body text-text-mute">
          iceberg is curated from public web resources. Each resource credits its original author/publisher inline.
          Content licenses are documented in <a className="text-accent" href="https://github.com/peteramelang/iceberg/blob/main/LICENSE-content.md">LICENSE-content.md</a>.
        </p>
      </MainColumn>
    </div>
  );
}
