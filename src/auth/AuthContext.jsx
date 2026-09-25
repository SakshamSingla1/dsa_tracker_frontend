import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser, setToken, ApiError } from "../api/client.js";

const USER_KEY = "dsa-auth-user";
const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* private browsing or storage disabled: session just won't persist */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      persistUser(null);
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const applyAuthResponse = (res) => {
    const nextUser = { id: res.userId, email: res.email, displayName: res.displayName };
    setToken(res.token);
    persistUser(nextUser);
    setUser(nextUser);
  };

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    applyAuthResponse(res);
  };

  const register = async (email, password, displayName) => {
    const res = await registerUser(email, password, displayName);
    applyAuthResponse(res);
  };

  const logout = () => {
    setToken(null);
    persistUser(null);
    setUser(null);
  };

  /** Merges a patch (e.g. a new displayName after a profile edit) into the cached user, so
   *  the header/greeting update immediately without needing a re-login. */
  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persistUser(next);
      return next;
    });
  };

  const value = useMemo(() => ({ user, login, register, logout, updateUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
