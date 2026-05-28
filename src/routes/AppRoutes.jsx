import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../views/Home";
import TournamentView from "../views/TournamentView";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/tournament"
          element={<TournamentView />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;