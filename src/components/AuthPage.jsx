import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext.jsx";
import { ApiError } from "../api/client.js";

const DRIFT_TERMS = [
  "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)",
  "O(√n)", "O(V+E)", "O(n!)", "O(n·m)", "O(h)", "O(k)",
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-drift" aria-hidden="true">
          {DRIFT_TERMS.map((term, i) => (
            <span key={term} className="auth-drift-term" style={{ "--i": i }}>
              {term}
            </span>
          ))}
        </div>

        <div className="auth-hero-content">
          <span className="eyebrow">Java, Python, C++ &amp; JavaScript</span>
          <h1>
            Practice DSA
            <br />
            like it's the real thing.
          </h1>
          <p className="auth-hero-lede">
            Two curated sheets, hundreds of problems, a real compiler and judge in your browser, and a streak that
            remembers every day you showed up.
          </p>

          <ul className="auth-feature-list">
            <li>
              <span className="auth-feature-icon">
                <FiCheck aria-hidden="true" />
              </span>
              A LeetCode-style Solve view with a live Java/Python/C++/JS compiler
            </li>
            <li>
              <span className="auth-feature-icon">
                <FiCheck aria-hidden="true" />
              </span>
              Instant grading against real test cases, with streaks, achievements, and a leaderboard
            </li>
            <li>
              <span className="auth-feature-icon">
                <FiCheck aria-hidden="true" />
              </span>
              Your progress is private to you &mdash; the sheet is shared, your streak isn't
            </li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
            <p>{isLogin ? "Sign in to pick up where you left off." : "Takes ten seconds. No email verification, nothing to lose."}</p>
          </div>

          {!isLogin && (
            <label className="auth-field">
              <span>Name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="What should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Your password" : "At least 6 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "One moment…" : isLogin ? "Sign in" : "Create account"}
          </button>

          <p className="auth-switch">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => {
                setMode(isLogin ? "register" : "login");
                setError(null);
              }}
            >
              {isLogin ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
