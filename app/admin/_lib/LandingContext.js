"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { landingPages } from "./mockData";

const STORAGE_KEY = "admin_active_landing";

const LandingContext = createContext(null);

export function LandingProvider({ children }) {
  const [landing, setLandingState] = useState(landingPages[0].path);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && landingPages.some((l) => l.path === saved)) {
      setLandingState(saved);
    }
  }, []);

  const setLanding = (path) => {
    setLandingState(path);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, path);
  };

  return <LandingContext.Provider value={{ landing, setLanding }}>{children}</LandingContext.Provider>;
}

// Trả về path landing đang được chọn trong Cài đặt (áp dụng cho toàn hệ thống admin).
export function useActiveLanding() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useActiveLanding phải dùng bên trong LandingProvider");
  return ctx;
}
