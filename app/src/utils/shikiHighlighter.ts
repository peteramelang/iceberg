// Explicit-bundle Shiki: ship only the languages and themes we actually use,
// not the ~270 language packs shiki/index.mjs's lazy registry pulls in.
// Content uses 6 languages (verified via topics.generated.json) and 2 themes.
//
// Without this file the build emits ~270 language chunks totalling ~8.5 MB.
// With this file the build emits one shared highlighter chunk (~250 KB
// minified for the 6 langs + 2 themes + oniguruma WASM).

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("shiki/themes/github-dark-default.mjs"),
        import("shiki/themes/github-light.mjs")
      ],
      langs: [
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/python.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/yaml.mjs")
      ],
      engine: createOnigurumaEngine(import("shiki/wasm"))
    });
  }
  return highlighterPromise;
}
