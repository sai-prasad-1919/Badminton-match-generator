import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { isAuthenticated, signIn } from "../utils/auth";

import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const session = signIn(username, password);

    if (!session) {
      setError("Invalid username or password.");
      return;
    }

    setError("");
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-badge">Secure Access</div>

        <h1>Badminton Match Generator</h1>

        <p className="auth-copy">
          Sign in to manage tournaments and view live match updates.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter Username "
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter Password"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
