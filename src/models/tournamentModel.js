export function createTournamentModel({

  teams,
  courts,
  matches

}) {

  return {

    teams,

    totalCourts: courts,

    allMatches: matches,

    activeCourts: [],

    completedMatches: [],

    pendingMatches: [...matches],

    leaderboard: [],

    tournamentCompleted: false
  };
}