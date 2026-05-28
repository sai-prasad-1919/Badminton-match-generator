const STORAGE_KEY =
  "badminton_tournament";

export function saveTournament(tournament) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tournament)
  );
}

export function loadTournament() {

  const data =
    localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

export function clearTournament() {

  localStorage.removeItem(STORAGE_KEY);
}