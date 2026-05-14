import { Routes, Route } from "react-router-dom";
import { Shell } from "./components/layout/Shell.js";
import { Home } from "./routes/Home.js";
import { Phase } from "./routes/Phase.js";
import { Topic } from "./routes/Topic.js";
import { Bookmarks } from "./routes/Bookmarks.js";
import { Settings } from "./routes/Settings.js";
import { Graph } from "./routes/Graph.js";
import { Paths } from "./routes/Paths.js";
import { Path } from "./routes/Path.js";
import { WhatsNew } from "./routes/WhatsNew.js";
import { Credits } from "./routes/Credits.js";

export function App() {
  return (
    <Shell>
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
      </Routes>
    </Shell>
  );
}
