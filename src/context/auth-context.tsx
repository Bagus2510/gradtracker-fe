"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Mock credential store ────────────────────────────────────────────────────
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "admin",
    name: "Admin GradTracker",
    role: "admin",
    password: "admin123",
  },
  {
    id: "S001",
    name: "Ahmad Fauzi",
    role: "student",
    nim: "S001",
    password: "student123",
  },
  {
    id: "S002",
    name: "Budi Santoso",
    role: "student",
    nim: "S002",
    password: "student123",
  },
  {
    id: "S003",
    name: "Citra Dewi",
    role: "student",
    nim: "S003",
    password: "student123",
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const STORAGE_KEY = "gradtracker_user";
const TOKEN_KEY = "gradtracker_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Token Refresh (Sliding Session) ─────────────────────────────────────────
  useEffect(() => {
    if (!user || !API_BASE) return;

    let lastActivityTime = Date.now();
    let lastRefreshTime = Date.now();

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    window.addEventListener("mousemove", updateActivity, { passive: true });
    window.addEventListener("keydown", updateActivity, { passive: true });

    // Check every 2 minutes
    const interval = setInterval(async () => {
      const now = Date.now();
      // If user was active since the last refresh (or within last 5 mins)
      if (lastActivityTime > lastRefreshTime) {
        try {
          const token = localStorage.getItem(TOKEN_KEY);
          if (!token) return;

          const res = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem(TOKEN_KEY, data.access_token);
            lastRefreshTime = now;
          } else if (res.status === 401) {
            // Token expired and unable to refresh, log out
            logout();
          }
        } catch (err) {
          console.error("Failed to refresh token", err);
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      clearInterval(interval);
    };
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const userOut: User = data.user;
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userOut));
        setUser(userOut);
        return { success: true };
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail ?? "Login gagal. Coba lagi.",
      };
    } catch {
      return { success: false, error: "Tidak dapat terhubung ke server." };
    }

  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
