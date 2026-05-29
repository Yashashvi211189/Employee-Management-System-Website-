// context/AuthContext.js
"use client";
import { API_URL } from '@/lib/config';
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (accessToken) => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (access) => {
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const urls = [`${API_URL}/api/employees/me/`, `${API_URL}/api/admin/dashboard/`, `${API_URL}/api/`];

      for (const url of urls) {
        const tryFetch = async (authType) =>
          fetch(url, { headers: { Authorization: `${authType} ${access}` } });

        let res = await tryFetch("JWT");
        if ((res.status === 401 || res.status === 403)) {
          res = await tryFetch("Bearer");
        }
        if (!res.ok) continue;
        const data = await res.json();
        if (
          data &&
          typeof data === "object" &&
          data.detail &&
          !data.employee_id &&
          !data.user &&
          !data.username &&
          !data.user_name &&
          !data.user_email
        ) {
          continue;
        }
        if (url.endsWith("/api/admin/dashboard/")) {
          setUser(data?.user || data);
        } else {
          setUser(data);
        }
        return;
      }

      throw new Error("Failed to fetch user");
    } catch (err) {
      console.error("fetchUser error:", err);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // login: store token and fetch user
  const login = useCallback(
    async (access) => {
      if (!access) return;
      localStorage.setItem("access", access);
      // trigger other tabs (storage event)
      try {
        await fetchUser(access);
      } finally {
        // custom event for same-window listeners
        window.dispatchEvent(new Event("authChanged"));
      }
    },
    [fetchUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.dispatchEvent(new Event("authChanged"));
    // redirect to home (or login) — you can use next/navigation's push in components
    window.location.href = "/login";
  }, []);

  // Refresh user from existing token
  const refreshUser = useCallback(async () => {
    const access = localStorage.getItem("access");
    await fetchUser(access);
  }, [fetchUser]);

  useEffect(() => {
    // initial load
    refreshUser();

    // listen to storage events (other tabs)
    const onStorage = (e) => {
      if (e.key === "access") {
        refreshUser();
      }
    };
    const onAuthChanged = () => {
      refreshUser();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChanged);
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook to consume
export function useAuthContext() {
  return useContext(AuthContext);
}
