export function generateMatches(teams) {
  const matches = [];

  let matchId = 1;

  for (let i = 0; i < teams.length; i++) {

    for (let j = i + 1; j < teams.length; j++) {

      matches.push({
        id: matchId,
        teamA: teams[i],
        teamB: teams[j],
        winner: null,
        played: false
      });

      matchId++;
    }
  }

  return matches;
}

export function assignInitialCourts(matches, totalCourts) {

  const activeCourts = [];

  const remainingMatches = [...matches];

  const activeTeams = new Set();

  for (let i = 0; i < totalCourts; i++) {

    let selectedMatchIndex = -1;

    for (let j = 0; j < remainingMatches.length; j++) {

      const match = remainingMatches[j];

      const teamAPlaying = activeTeams.has(match.teamA);

      const teamBPlaying = activeTeams.has(match.teamB);

      if (!teamAPlaying && !teamBPlaying) {

        selectedMatchIndex = j;

        break;
      }
    }

    if (selectedMatchIndex === -1) {
      break;
    }

    const selectedMatch =
      remainingMatches[selectedMatchIndex];

    remainingMatches.splice(selectedMatchIndex, 1);

    activeTeams.add(selectedMatch.teamA);
    activeTeams.add(selectedMatch.teamB);

    activeCourts.push({
      courtNumber: i + 1,
      match: selectedMatch
    });
  }

  return {
    activeCourts,
    remainingMatches
  };
}

const REST_BONUS_BOTH_RESTED = 100;
const REST_BONUS_ONE_RESTED = 40;

export function buildLeaderboardMap(leaderboard) {
  return leaderboard.reduce((acc, teamData) => {
    acc[teamData.team] = teamData;
    return acc;
  }, {});
}

export function getMaxMatchesPlayed(leaderboard) {
  return leaderboard.reduce((maxPlayed, teamData) => {
    return Math.max(maxPlayed, teamData.played);
  }, 0);
}

function isTeamRecent(teamId, recentlyPlayedTeams, schedulerCycle) {
  const record = recentlyPlayedTeams[teamId];

  if (!record) {
    return false;
  }

  return record.lastCycle >= schedulerCycle - 1;
}

export function selectBestMatchForCourt({
  pendingMatches,
  busyTeams,
  recentlyPlayedTeams,
  schedulerCycle,
  leaderboardMap,
  maxPlayed
}) {
  let bestIndex = -1;
  let bestScore = -Infinity;

  for (let i = 0; i < pendingMatches.length; i++) {
    const match = pendingMatches[i];

    if (busyTeams.has(match.teamA) || busyTeams.has(match.teamB)) {
      continue;
    }

    const teamARecent = isTeamRecent(
      match.teamA,
      recentlyPlayedTeams,
      schedulerCycle
    );

    const teamBRecent = isTeamRecent(
      match.teamB,
      recentlyPlayedTeams,
      schedulerCycle
    );

    let score = 0;

    if (!teamARecent && !teamBRecent) {
      score += REST_BONUS_BOTH_RESTED;
    } else if (teamARecent !== teamBRecent) {
      score += REST_BONUS_ONE_RESTED;
    }

    const playedA = leaderboardMap[match.teamA]?.played ?? 0;
    const playedB = leaderboardMap[match.teamB]?.played ?? 0;

    score += (maxPlayed - playedA) + (maxPlayed - playedB);
    score += pendingMatches.length - i;

    if (
      score > bestScore ||
      (score === bestScore && i < bestIndex)
    ) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex === -1) {
    return null;
  }

  return {
    index: bestIndex,
    match: pendingMatches[bestIndex]
  };
}