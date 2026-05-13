import { Routes, Route } from "react-router-dom";
import { Home } from "./routes/Home.js";
import { Phase } from "./routes/Phase.js";
import { Topic } from "./routes/Topic.js";
import { Bookmarks } from "./routes/Bookmarks.js";
import { Settings } from "./routes/Settings.js";
import { Graph } from "./routes/Graph.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/phase/:phaseSlug" element={<Phase />} />
      <Route path="/topic/:topicSlug" element={<Topic />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/graph" element={<Graph />} />
    </Routes>
  );
}
