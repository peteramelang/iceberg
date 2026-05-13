import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeExample { language: string; title: string; code: string; reasoning: string; }

export function CodeExamples({ items }: { items: CodeExample[] }) {
  return (
    <div className="space-y-xl">
      {items.map((ex, i) => <CodeBlock key={i} ex={ex} />)}
    </div>
  );
}

function CodeBlock({ ex }: { ex: CodeExample }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    codeToHtml(ex.code, { lang: ex.language, theme: "github-light" })
      .then(h => { if (!cancelled) setHtml(h); })
      .catch(() => { if (!cancelled) setHtml(`<pre><code>${escape(ex.code)}</code></pre>`); });
    return () => { cancelled = true; };
  }, [ex.code, ex.language]);

  return (
    <div>
      <div className="text-body-strong mb-xs">[+] {ex.title}</div>
      <div className="text-caption-md text-mute mb-sm">— {ex.reasoning}</div>
      <div
        className="text-caption-md bg-surface-soft border border-hairline rounded-sm overflow-x-auto [&_pre]:p-md [&_pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html ?? `<pre><code>${escape(ex.code)}</code></pre>` }}
      />
    </div>
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
