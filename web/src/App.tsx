import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ImageCombiner from "./pages/ImageCombiner";
import Error404 from "./pages/Error404";
import Pokedex from "./pages/Pokedex";
import Layout from "./components/layout";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/combiner" element={<ImageCombiner />} />
          <Route path="/pokedex" element={<Pokedex />} />

          {/* redirect example */}
          <Route path="/" element={<Navigate to="/combiner" replace />} />
          {/* 404 */}
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
