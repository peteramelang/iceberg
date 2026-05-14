import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Shell } from "./components/layout/Shell.js";
import { Home } from "./routes/Home.js";
import { Phase } from "./routes/Phase.js";
import { Topic } from "./routes/Topic.js";
import { Bookmarks } from "./routes/Bookmarks.js";
import { Paths } from "./routes/Paths.js";
import { Path } from "./routes/Path.js";
import { WhatsNew } from "./routes/WhatsNew.js";
import { Credits } from "./routes/Credits.js";
import { About } from "./routes/About.js";

// Route-level code splitting for the two heaviest routes:
// - Graph pulls in @xyflow/react + its stylesheet (~200 KB).
// - Settings pulls in Zod schemas for import validation (~20 KB).
// Both are rarely-visited compared to Home/Topic/Phase.
const Graph = lazy(() => import("./routes/Graph.js").then(m => ({ default: m.Graph })));
const Settings = lazy(() => import("./routes/Settings.js").then(m => ({ default: m.Settings })));

function RouteFallback() {
  return <div className="p-xl text-text-mute">Loading…</div>;
}

export function App() {
  return (
    <Shell>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/phase/:phaseSlug" element={<Phase />} />
          <Route path="/topic/:topicSlug" element={<Topic />} />
          <Route path="/paths" element={<Paths />} />
          <Route path="/path/:pathSlug" element={<Path />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
