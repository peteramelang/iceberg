import { useEffect, useState } from "react";
import type { CodeExample } from "../../content/types.js";
import { useResolvedTheme } from "../../hooks/useResolvedTheme.js";
import { getHighlighter } from "../../utils/shikiHighlighter.js";

export function CodeExamples({ items }: { items: CodeExample[] }) {
  return (
    <div className="flex flex-col gap-xl">
      {items.map((ex, i) => <CodeBlock key={i} ex={ex} />)}
    </div>
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function CodeBlock({ ex }: { ex: CodeExample }) {
  const theme = useResolvedTheme();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const themeName = theme === "dark" ? "github-dark-default" : "github-light";
    getHighlighter()
      .then(h => h.codeToHtml(ex.code, { lang: ex.language, theme: themeName }))
      .then(h => { if (!cancelled) setHtml(h); })
      .catch(() => { if (!cancelled) setHtml(`<pre><code>${escape(ex.code)}</code></pre>`); });
    return () => { cancelled = true; };
  }, [ex.code, ex.language, theme]);

  return (
    <div>
      <div className="text-body-strong mb-xs">{ex.title}</div>
      <div className="text-caption text-text-mute italic mb-sm">{ex.reasoning}</div>
      <div
        className="rounded-sm border border-border-soft overflow-x-auto font-mono text-[12.5px] leading-[1.6] [&_pre]:p-md [&_pre]:m-0 [&_pre]:bg-transparent"
        style={{ background: theme === "dark" ? "#0d0d11" : "var(--panel-2)" }}
        dangerouslySetInnerHTML={{ __html: html ?? `<pre><code>${escape(ex.code)}</code></pre>` }}
      />
    </div>
  );
}
