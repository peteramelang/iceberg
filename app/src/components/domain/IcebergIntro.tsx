// Home-page intro panel. References the "Vibe Coding vs Production Reality"
// iceberg diagram from the Reddit post linked below.
//
// Image lives in app/public/iceberg-intro.png and is served as a same-origin
// static asset. The container forces a dark backdrop in both themes so the
// black-bg PNG always reads correctly.
//
// Inspiration: https://www.reddit.com/r/ClaudeAI/comments/1t3bk3x/vibe_coding_vs_production_reality/

import { Link } from "react-router-dom";

export function IcebergIntro() {
  return (
    <section className="mb-xl rounded p-xl border border-border-soft bg-panel">
      <header className="mb-lg text-center">
        <div className="text-label text-text-mute uppercase mb-sm">Why iceberg exists</div>
        <h2 className="text-display-lg m-0 mb-sm">The gap between MVP and production</h2>
        <p className="text-body text-text-mute max-w-[640px] mx-auto">
          What ships in a demo is the visible tip. What it takes to keep a real product
          running — auth, payments, observability, rollbacks, compliance — is the depth
          below. iceberg is a curated path through that depth.
        </p>
      </header>

      <figure className="flex justify-center">
        {/* PNG has a dark background baked in; black inset keeps it readable
            in light mode without inverting the artwork. */}
        <div className="bg-black rounded p-lg">
          <img
            src="/iceberg-intro.png"
            alt="Vibe Coding vs Production Reality — left iceberg shows AI coding tools at the tip; right iceberg shows the submerged depth of production concerns (authentication, payments, observability, CI/CD, compliance, etc.)."
            className="block max-w-full h-auto"
            loading="lazy"
          />
        </div>
      </figure>

      <footer className="mt-lg text-center text-caption text-text-dim">
        Inspired by{" "}
        <a
          href="https://www.reddit.com/r/ClaudeAI/comments/1t3bk3x/vibe_coding_vs_production_reality/"
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent hover:text-accent-hover hover:underline"
        >
          Vibe Coding vs Production Reality
        </a>
        {" · "}
        <Link to="/paths" className="hover:text-text">Start with a path →</Link>
      </footer>
    </section>
  );
}
