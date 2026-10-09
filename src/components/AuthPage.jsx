import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext.jsx";
import { ApiError } from "../api/client.js";
import { Button, Input, Label } from "./ui/index.js";

const FEATURES = [
  "A LeetCode-style Solve view with a live Java/Python/C++/JS compiler",
  "Instant grading against real test cases, with streaks, achievements, and a leaderboard",
  "Your progress is private to you — the sheet is shared, your streak isn't",
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <div className="hidden lg:flex flex-col justify-center px-16 bg-ink text-paper">
        <span className="inline-block w-fit text-[12px] font-medium tracking-wide uppercase text-paper/60 border border-paper/20 rounded-pill px-2.5 py-1 mb-6">
          Java, Python, C++ &amp; JavaScript
        </span>
        <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight mb-5">
          Practice DSA
          <br />
          like it&rsquo;s the real thing.
        </h1>
        <p className="text-[15px] text-paper/70 max-w-md leading-relaxed mb-8">
          Two curated sheets, hundreds of problems, a real compiler and judge in your browser, and a streak that
          remembers every day you showed up.
        </p>
        <ul className="space-y-3 max-w-md">
          {FEATURES.map((f) => (
            <li key={f} className="flex gap-3 text-[14px] text-paper/85 leading-snug">
              <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-accent/20 text-accent-ink flex items-center justify-center">
                <FiCheck className="h-3 w-3 text-paper" aria-hidden="true" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-ink mb-1">{isLogin ? "Welcome back" : "Create your account"}</h2>
            <p className="text-[13.5px] text-ink-soft">
              {isLogin ? "Sign in to pick up where you left off." : "Takes ten seconds. No email verification, nothing to lose."}
            </p>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="What should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={isLogin ? "Your password" : "At least 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-hard-soft text-hard text-[13px] px-3 py-2">{error}</div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full mt-5">
            {submitting ? "One moment…" : isLogin ? "Sign in" : "Create account"}
          </Button>

          <p className="mt-4 text-center text-[13px] text-ink-soft">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-accent hover:underline"
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
