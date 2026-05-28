export function generateTeams(totalTeams) {

  const teams = [];

  for (let i = 0; i < totalTeams; i++) {

    const teamName = String.fromCharCode(65 + i);

    teams.push(teamName);
  }

  return teams;
}