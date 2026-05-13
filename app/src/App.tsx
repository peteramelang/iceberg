import { Routes, Route } from "react-router-dom";
import { Home } from "./routes/Home.js";
import { Phase } from "./routes/Phase.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/phase/:phaseSlug" element={<Phase />} />
    </Routes>
  );
}
