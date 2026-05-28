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