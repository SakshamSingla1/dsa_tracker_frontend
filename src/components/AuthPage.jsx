import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import AuthLayout from "../auth/AuthLayout.jsx";
import { DarkInput, DarkLabel, PasswordField } from "../auth/AuthFormFields.jsx";
import { ApiError } from "../api/client.js";
import { Button } from "./ui/index.js";

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
    <AuthLayout
      featureTitle={
        <>
          Practice DSA
          <br />
          like it&rsquo;s the real thing.
        </>
      }
      features={FEATURES}
    >
      <h2 className="text-white text-[20px] font-semibold">{isLogin ? "Welcome back" : "Create your account"}</h2>
      <p className="text-white/50 text-[13px] mt-1 mb-6">
        {isLogin ? "Sign in to pick up where you left off." : "Takes ten seconds. No email verification, nothing to lose."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <DarkLabel htmlFor="displayName">Name</DarkLabel>
              <DarkInput
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
            <DarkLabel htmlFor="email">Email</DarkLabel>
            <DarkInput
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
            <DarkLabel htmlFor="password">Password</DarkLabel>
            <PasswordField
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Your password" : "At least 6 characters"}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-[#fb7185]/10 border border-[#fb7185]/20 text-[#fb7185] text-[12.5px] px-3 py-2">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          className="w-full mt-5 !bg-[#8b5cf6] !border-transparent hover:!brightness-110"
        >
          {submitting ? "One moment…" : isLogin ? "Sign in" : "Create account"}
        </Button>

        <p className="mt-4 text-center text-[13px] text-white/50">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-[#c4b5fd] hover:underline"
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError(null);
            }}
          >
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
