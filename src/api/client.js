const API_BASE = `${import.meta.env.VITE_API_BASE ?? "http://localhost:8081"}/api`;
const TOKEN_KEY = "dsa-auth-token";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing or storage disabled: session just won't persist */
  }
}

async function request(path, options) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options?.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    let message = `${options?.method ?? "GET"} ${path} failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* no JSON body to read */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function fetchSheets() {
  return request("/sheets");
}

export function fetchTopics(sheetSlug) {
  return request(`/topics${sheetSlug ? `?sheet=${encodeURIComponent(sheetSlug)}` : ""}`);
}

/** Fetches a single problem regardless of the active sheet -- used when solving a problem
 *  (e.g. from a contest) that isn't part of the currently loaded sheet's topics. */
export function fetchProblem(id) {
  return request(`/problems/${id}`);
}

export function updateProblem(id, patch) {
  return request(`/problems/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function runCode(language, code, stdin) {
  return request("/run", {
    method: "POST",
    body: JSON.stringify({ language, code, stdin }),
  });
}

/** Judges against the problem's sample test cases only. Nothing is persisted. */
export function runTests(problemId, language, code) {
  return request(`/problems/${problemId}/run-tests`, {
    method: "POST",
    body: JSON.stringify({ language, code }),
  });
}

/** Judges against every test case, records the attempt, and marks the problem DONE on ACCEPTED.
 *  Pass `contestSessionId` when solving from inside an active contest so the attempt counts toward it. */
export function submitSolution(problemId, language, code, contestSessionId) {
  return request(`/problems/${problemId}/submit`, {
    method: "POST",
    body: JSON.stringify({ language, code, contestSessionId: contestSessionId ?? null }),
  });
}

export function fetchSubmissions(problemId) {
  return request(`/submissions?problemId=${problemId}`);
}

export function fetchSubmission(id) {
  return request(`/submissions/${id}`);
}

export function fetchProblemOfTheDay(sheetSlug) {
  return request(`/topics/problem-of-the-day${sheetSlug ? `?sheet=${encodeURIComponent(sheetSlug)}` : ""}`);
}

/** `scope` is "ALL" (default) | "WEEK" | "MONTH"; `sheet` narrows to one sheet's problems, omit for all. */
export function fetchLeaderboard({ scope = "ALL", sheet } = {}) {
  const params = new URLSearchParams({ scope });
  if (sheet) params.set("sheet", sheet);
  return request(`/leaderboard?${params.toString()}`);
}

/** `sheet` may be a real sheet slug, or "all" to merge every sheet's topics into one list. */
export function fetchProgressSummary(sheet = "all") {
  return request(`/progress/summary?sheet=${encodeURIComponent(sheet)}`);
}

export function fetchReviewQueue() {
  return request("/review/queue");
}

export function reviewProblem(id, outcome) {
  return request(`/problems/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ outcome }),
  });
}

/** Aggregated submission history (verdicts, languages, per-topic mix, daily activity) for the Insights view. */
export function fetchAnalyticsSummary(days = 90) {
  return request(`/analytics/summary?days=${days}`);
}

/** Draws a fresh problem set and starts a timed session. `difficulty`/`sheetSlug` may be omitted for "any". */
export function createContest({ problemCount, difficulty, sheetSlug, durationMinutes }) {
  return request("/contests", {
    method: "POST",
    body: JSON.stringify({ problemCount, difficulty, sheetSlug, durationMinutes }),
  });
}

export function fetchContest(id) {
  return request(`/contests/${id}`);
}

export function finishContest(id) {
  return request(`/contests/${id}/finish`, { method: "POST" });
}

export function fetchContestHistory() {
  return request("/contests/history");
}

export function fetchProfile() {
  return request("/auth/profile");
}

/** Partial update -- omit a field (or pass undefined) to leave it unchanged. */
export function updateProfile({ displayName, bio } = {}) {
  return request("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify({ displayName: displayName ?? null, bio: bio ?? null }),
  });
}

export function changePassword({ currentPassword, newPassword }) {
  return request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/** Permanently deletes the account and everything in it. Requires the current password as confirmation. */
export function deleteAccount({ currentPassword }) {
  return request("/auth/account", {
    method: "DELETE",
    body: JSON.stringify({ currentPassword }),
  });
}

/** Short, non-spoiling hint from Gemini. `code`/`language` optional context from the editor. */
export function fetchAiHint(problemId, { code, language } = {}) {
  return request(`/problems/${problemId}/ai-hint`, {
    method: "POST",
    body: JSON.stringify({ code: code ?? null, language: language ?? null }),
  });
}

/** Short AI review of a just-submitted solution. Not persisted. */
export function fetchAiReview({ code, language, verdict }) {
  return request("/ai-review", {
    method: "POST",
    body: JSON.stringify({ code, language, verdict }),
  });
}

/** Rule-based "what to solve next" -- weak topics first, unexplored topics as a fallback. */
export function fetchRecommendations() {
  return request("/analytics/recommendations");
}

/** AI-personalized "what to focus on" note built from the user's own practice stats. */
export function fetchAiCoachNote() {
  return request("/analytics/ai-coach-note");
}

/** Full tutor-chat history for this problem, oldest first. */
export function fetchTutorMessages(problemId) {
  return request(`/problems/${problemId}/tutor/messages`);
}

/** Sends one message to the AI tutor for this problem and gets a reply, both persisted. */
export function sendTutorMessage(problemId, { content, code, language }) {
  return request(`/problems/${problemId}/tutor/messages`, {
    method: "POST",
    body: JSON.stringify({ content, code: code ?? null, language: language ?? null }),
  });
}

/** Clears the tutor-chat history for this problem, starting fresh. */
export function clearTutorMessages(problemId) {
  return request(`/problems/${problemId}/tutor/messages`, { method: "DELETE" });
}

/** Starts a new AI mock interview. `problemId` omitted picks a random problem, optionally
 *  narrowed by `difficulty` ("EASY"/"MEDIUM"/"HARD"). */
export function startInterview({ problemId, difficulty } = {}) {
  return request("/interview", {
    method: "POST",
    body: JSON.stringify({ problemId: problemId ?? null, difficulty: difficulty ?? null }),
  });
}

export function fetchInterviewHistory() {
  return request("/interview/history");
}

export function fetchInterviewSession(id) {
  return request(`/interview/${id}`);
}

export function sendInterviewMessage(id, content) {
  return request(`/interview/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function endInterview(id) {
  return request(`/interview/${id}/end`, { method: "POST" });
}

export function fetchComments(problemId) {
  return request(`/problems/${problemId}/comments`);
}

export function postComment(problemId, body) {
  return request(`/problems/${problemId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function deleteComment(commentId) {
  return request(`/comments/${commentId}`, { method: "DELETE" });
}

export function registerUser(email, password, displayName) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });
}

export function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
