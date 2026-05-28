import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTeams } from "../utils/teamGenerator";
import { generateMatches } from "../utils/scheduler";
import { createTournamentModel } from "../models/tournamentModel";
import { assignInitialCourts } from "../utils/scheduler";
import { generateLeaderboard } from "../utils/leaderboard";
import { signOut } from "../utils/auth";


import "../styles/setup.css";

function SetupScreen() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(6);
  const [courts, setCourts] = useState(2);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const handleGenerate = () => {

  const totalTeams = Number(teams);
  const totalCourts = Number(courts);

  if (totalTeams < 2) {
    alert("Minimum 2 teams required");
    return;
  }

  if (totalTeams > 26) {
    alert("Maximum 26 teams allowed");
    return;
  }

  if (totalCourts < 1) {
    alert("Minimum 1 court required");
    return;
  }

  if (totalCourts > Math.floor(totalTeams / 2)) {
    alert("Too many courts for given teams");
    return;
  }
  const generatedTeams = generateTeams(totalTeams);
  const matches = generateMatches(generatedTeams);

  const courtData = assignInitialCourts(
    matches,
    totalCourts
  );

  const tournament = createTournamentModel({
    teams: generatedTeams,
    courts: totalCourts,
    matches
  });

  tournament.activeCourts =
    courtData.activeCourts;

  tournament.pendingMatches =
    courtData.remainingMatches;

  tournament.leaderboard =
  generateLeaderboard(generatedTeams);

  console.log(tournament);

  console.log(courtData);

  console.log(tournament);

  console.log(matches);
  
  console.log(generatedTeams);
  
  navigate("/tournament", {
    state: tournament
  });
};

  return (
    <div className="setup-container">

      <div className="setup-card">

        <div className="setup-toolbar">
          <span className="setup-toolbar-label">
            Tournament Setup
          </span>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h1 className="setup-title">
          Badminton Match Generator
        </h1>

        <div className="input-group">

          <label>
            Enter Number of Teams
          </label>

          <input
            type="number"
            min="2"
            max="26"
            value={teams}
            onChange={(e) => setTeams(e.target.value)}
          />

        </div>

        <div className="input-group">

          <label>
            Enter Number of Courts
          </label>

          <input
            type="number"
            min="1"
            value={courts}
            onChange={(e) => setCourts(e.target.value)}
          />

        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
        >
          Generate Tournament
        </button>

      </div>

    </div>
  );
}

export default SetupScreen;