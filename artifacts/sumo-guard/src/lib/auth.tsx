import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Lifestyle {
  isSmoker?: boolean;
  isDrinker?: boolean;
  isAlcoholic?: boolean;
  hasChronicCondition?: boolean;
  chronicConditions?: string[];
  activityLevel?: string;
  dietType?: string;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  lifestyle: Lifestyle;
  onboardingDone: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  saveOnboarding: (data: Record<string, unknown>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, opts: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers as Record<string, string> || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("sg_token"));
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const t = localStorage.getItem("sg_token");
    if (!t) { setLoading(false); return; }
    try {
      const me = await apiFetch("/api/auth/me", {}, t);
      setUser(me);
      setToken(t);
    } catch {
      localStorage.removeItem("sg_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshUser(); }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("sg_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string): Promise<AuthUser> {
    const data = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    localStorage.setItem("sg_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("sg_token");
    setToken(null);
    setUser(null);
  }

  async function saveOnboarding(onboardingData: Record<string, unknown>) {
    const t = localStorage.getItem("sg_token");
    const updated = await apiFetch("/api/auth/onboarding", { method: "POST", body: JSON.stringify(onboardingData) }, t);
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, saveOnboarding, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
