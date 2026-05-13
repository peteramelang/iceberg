import { Routes, Route } from "react-router-dom";
import { Home } from "./routes/Home.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
