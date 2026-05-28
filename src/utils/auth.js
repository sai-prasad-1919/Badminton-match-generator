const AUTH_STORAGE_KEY = "badminton_auth_session";

const DEFAULT_CREDENTIALS = {
  username: "admin#play",
  password: "start@1919"
};

export function loadAuthSession() {
  const session = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(loadAuthSession());
}

export function signIn(username, password) {
  const normalizedUsername = username.trim();

  if (
    normalizedUsername === DEFAULT_CREDENTIALS.username &&
    password === DEFAULT_CREDENTIALS.password
  ) {
    const session = {
      username: DEFAULT_CREDENTIALS.username,
      signedInAt: new Date().toISOString()
    };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(session)
    );

    return session;
  }

  return null;
}

export function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
