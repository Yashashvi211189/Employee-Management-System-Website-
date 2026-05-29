"use client";

import { useCallback, useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";

export default function useAuth() {
  const ctx = useAuthContext();

  const getToken = useCallback(() => {
    const token =
      localStorage.getItem("access") || localStorage.getItem("access_token");
    return token || null;
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const doFetch = (authType) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `${authType} ${token}`,
        },
        credentials: "include",
      });

    const res = await doFetch("JWT");
    if (res.status === 401 || res.status === 403) {
      return await doFetch("Bearer");
    }
    return res;
  }, [getToken]);

  return useMemo(() => ({ ...ctx, authFetch }), [ctx, authFetch]);
}
