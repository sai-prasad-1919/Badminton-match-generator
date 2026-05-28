export function generateLeaderboard(teams) {

  return teams.map((team) => {

    return {
      team,
      played: 0,
      wins: 0,
      losses: 0
    };
  });
}