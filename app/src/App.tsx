import { Routes, Route } from "react-router-dom";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 font-mono">iceberg — pre-content</div>} />
    </Routes>
  );
}
