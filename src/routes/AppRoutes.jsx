import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../views/Login";
import Home from "../views/Home";
import TournamentView from "../views/TournamentView";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/tournament"
            element={<TournamentView />}
          />
        </Route>

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;