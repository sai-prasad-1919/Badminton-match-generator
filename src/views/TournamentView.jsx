import {
  useLocation,
  useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";



import {
  saveTournament,
  loadTournament,
  clearTournament
} from "../utils/storage";
import {
  buildLeaderboardMap,
  getMaxMatchesPlayed,
  selectBestMatchForCourt
} from "../utils/scheduler";
import { signOut } from "../utils/auth";

import "../styles/tournament.css";

function TournamentView() {

  const location = useLocation();

  const navigate = useNavigate();

  const [tournament, setTournament] =
    useState(() => {

      if (location.state) {
        return location.state;
      }

      return loadTournament();
    });

  useEffect(() => {

    if (tournament) {

      saveTournament(tournament);
    }

  }, [tournament]);


  const handleNewTournament = () => {

    clearTournament();

    navigate("/");
  };

  const handleLogout = () => {
    clearTournament();
    signOut();
    navigate("/login");
  };
  
  if (!tournament) {

  return (
      <div className="tournament-container">

        <h1>
          No Tournament Found
        </h1>

      </div>
    );
  }

  const handleWinner = (
    courtNumber,
    winnerTeam,
    loserTeam
  ) => {

    const completedCourt =
      tournament.activeCourts.find(
        (court) =>
          court.courtNumber === courtNumber
      );

    if (!completedCourt) {
      return;
    }

    const alreadyCompleted =
      tournament.completedMatches.some(
        (match) =>
          match.id === completedCourt.match.id
      );

    if (alreadyCompleted) {
      return;
    }

    // =========================
    // UPDATE LEADERBOARD
    // =========================

    const updatedLeaderboard =
      tournament.leaderboard
        .map((teamData) => {

          if (teamData.team === winnerTeam) {

            return {
              ...teamData,
              played: teamData.played + 1,
              wins: teamData.wins + 1
            };
          }

          if (teamData.team === loserTeam) {

            return {
              ...teamData,
              played: teamData.played + 1,
              losses: teamData.losses + 1
            };
          }

          return teamData;
        })

        .sort((a, b) => {

          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }

          return a.losses - b.losses;
        });

    // =========================
    // ADD COMPLETED MATCH
    // =========================

    const updatedCompletedMatches = [
      ...tournament.completedMatches,

      {
        ...completedCourt.match,
        winner: winnerTeam,
        played: true
      }
    ];

    // =========================
    // REMOVE COMPLETED COURT
    // =========================

    let updatedActiveCourts =
      tournament.activeCourts.filter(
        (court) =>
          court.courtNumber !== courtNumber
      );

    // =========================
    // COPY PENDING MATCHES
    // =========================

    let updatedPendingMatches = [
      ...tournament.pendingMatches
    ];

    const schedulerCycle =
      (tournament.schedulerCycle ?? 0) + 1;

    const recentlyPlayedTeams = {
      ...(tournament.recentlyPlayedTeams ?? {})
    };

    const playedAt = Date.now();

    recentlyPlayedTeams[winnerTeam] = {
      lastPlayedAt: playedAt,
      lastCycle: schedulerCycle
    };

    recentlyPlayedTeams[loserTeam] = {
      lastPlayedAt: playedAt,
      lastCycle: schedulerCycle
    };

    // =========================
    // GLOBAL RESCHEDULER
    // =========================

    const freeCourtNumbers = [];

    // Existing active courts stay occupied
    const busyTeams = new Set();

    updatedActiveCourts.forEach((court) => {

      busyTeams.add(court.match.teamA);
      busyTeams.add(court.match.teamB);
    });

    // Collect all free courts
    for (
      let i = 1;
      i <= tournament.totalCourts;
      i++
    ) {

      const isCourtBusy =
        updatedActiveCourts.some(
          (court) =>
            court.courtNumber === i
        );

      if (!isCourtBusy) {
        freeCourtNumbers.push(i);
      }
    }

    // =========================
    // FILL ALL FREE COURTS
    // =========================

    const leaderboardMap =
      buildLeaderboardMap(updatedLeaderboard);

    const maxPlayed =
      getMaxMatchesPlayed(updatedLeaderboard);

    for (
      let courtIndex = 0;
      courtIndex < freeCourtNumbers.length;
      courtIndex++
    ) {

      const courtNumber =
        freeCourtNumbers[courtIndex];

      const selection = selectBestMatchForCourt({
        pendingMatches: updatedPendingMatches,
        busyTeams,
        recentlyPlayedTeams,
        schedulerCycle,
        leaderboardMap,
        maxPlayed
      });

      if (!selection) {
        continue;
      }

      const nextMatch =
        updatedPendingMatches.splice(
          selection.index,
          1
        )[0];

      updatedActiveCourts.push({
        courtNumber,
        match: nextMatch
      });

      // mark teams busy
      busyTeams.add(nextMatch.teamA);
      busyTeams.add(nextMatch.teamB);
    }

    // =========================
    // TOURNAMENT COMPLETE
    // =========================

    const tournamentCompleted =
      updatedPendingMatches.length === 0 &&
      updatedActiveCourts.length === 0;

    // =========================
    // FINAL STATE UPDATE
    // =========================

    setTournament({
      ...tournament,

      leaderboard: updatedLeaderboard,

      completedMatches:
        updatedCompletedMatches,

      activeCourts:
        updatedActiveCourts,

      pendingMatches:
        updatedPendingMatches,

      tournamentCompleted,

      schedulerCycle,

      recentlyPlayedTeams
    });
  };

  return (
    <div className="tournament-container">

      <div className="tournament-header">

        <div className="header-topbar">
          <h1>Badminton Tournament</h1>

          <div className="header-actions">
            <button
              className="secondary-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

            <button
              className="new-tournament-btn"
              onClick={handleNewTournament}
            >
              New Tournament
            </button>
          </div>
        </div>

        {
          tournament.tournamentCompleted && (

            <div className="completion-banner">

              Tournament Completed 🏆

            </div>
          )
        }


        <div className="stats-bar">

          <div className="stat-card">

            <h3>
              Total Matches
            </h3>

            <p>
              {tournament.allMatches.length}
            </p>

          </div>

          <div className="stat-card">

            <h3>
              Completed
            </h3>

            <p>
              {tournament.completedMatches.length}
            </p>

          </div>

          <div className="stat-card">

            <h3>
              Remaining
            </h3>

            <p>
              {
                tournament.pendingMatches.length +
                tournament.activeCourts.length
              }
            </p>

          </div>

        </div>

      </div>

      <div className="tournament-grid">

        <div className="left-section">

          <div className="section-card">

            <h2 className="section-title">
              Active Courts
            </h2>

            {
              tournament.activeCourts.map((court) => (

                <div
                  key={court.courtNumber}
                  className="court-card"
                >

                  <h3>
                    Court {court.courtNumber}
                  </h3>

                  <p>
                    {court.match.teamA}
                    {" vs "}
                    {court.match.teamB}
                  </p>

                  <div className="winner-buttons">

                    <button
                      onClick={() =>
                        handleWinner(
                          court.courtNumber,
                          court.match.teamA,
                          court.match.teamB
                        )
                      }
                    >
                      {court.match.teamA} Wins
                    </button>

                    <button
                      onClick={() =>
                        handleWinner(
                          court.courtNumber,
                          court.match.teamB,
                          court.match.teamA
                        )
                      }
                    >
                      {court.match.teamB} Wins
                    </button>

                  </div>

                </div>
              ))
            }

          </div>

          <div className="section-card">

            <h2 className="section-title">
              Match Queue
            </h2>

            {
              tournament.pendingMatches.map((match) => (

                <div
                  key={match.id}
                  className="queue-card"
                >

                  <p>
                    {match.teamA}
                    {" vs "}
                    {match.teamB}
                  </p>

                </div>
              ))
            }

          </div>

          <h2 className="section-title">
            Completed Matches
          </h2>

          {
            tournament.completedMatches.length === 0 ? (

              <p>
                No matches completed yet
              </p>

            ) : (

              tournament.completedMatches.map((match) => (

                <div
                  key={match.id}
                  className="completed-card"
                >

                  <p>

                    <strong>
                      {match.winner}
                    </strong>

                    {" defeated "}

                    {
                      match.teamA === match.winner
                        ? match.teamB
                        : match.teamA
                    }

                  </p>

                </div>
              ))
            )
          }


        </div>

      </div>

      <div className="section-card leaderboard-section">

        <h2 className="section-title">
          Leaderboard
        </h2>

        {
          tournament.leaderboard.map(
            (teamData, index) => {

              let medal = "";

              if (index === 0) medal = "🥇";
              else if (index === 1) medal = "🥈";
              else if (index === 2) medal = "🥉";

              return (

                <div
                  key={teamData.team}
                  className={`leaderboard-card ${
                    index === 0
                      ? "leader-first"
                      : ""
                  }`}
                >

                  <div className="leaderboard-top">

                    <h3>

                      {medal}

                      {" "}

                      #{index + 1}

                      {" - Team "}

                      {teamData.team}

                    </h3>

                  </div>

                  <div className="leaderboard-stats">

                    <p>
                      Played: {teamData.played}
                    </p>

                    <p>
                      Wins: {teamData.wins}
                    </p>

                    <p>
                      Losses: {teamData.losses}
                    </p>

                  </div>

                </div>
              );
            }
          )
        }

      </div>

    </div>
  );
}

export default TournamentView;

