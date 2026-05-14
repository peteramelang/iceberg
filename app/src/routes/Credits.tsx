import { marked } from "marked";
import { Page } from "../components/layout/Page.js";
import { Head } from "../components/layout/Head.js";
import creditsMd from "../content/CREDITS.md?raw";

const html = marked.parse(creditsMd, { async: false }) as string;

export function Credits() {
  return (
    <Page>
      <Head title="Credits" />
      <article
        className="max-w-none [&_a]:underline [&_h1]:text-display-xl [&_h1]:mb-xl [&_h2]:text-heading-md [&_h2]:mt-xxl [&_h2]:mb-md [&_ul]:list-none [&_ul]:my-md [&_li]:py-xxs [&_p]:my-md [&_p]:text-body [&_hr]:my-xl [&_hr]:border-hairline [&_strong]:font-medium"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Page>
  );
}
