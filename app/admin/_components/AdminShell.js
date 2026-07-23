"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LandingProvider, useActiveLanding } from "../_lib/LandingContext";
import { landingPages } from "../_lib/mockData";
import { IconGrid, IconUsers, IconMegaphone, IconFlame, IconActivity, IconSettings } from "./icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: IconGrid, exact: true },
  { href: "/admin/khach-hang", label: "Khách hàng", icon: IconUsers },
  { href: "/admin/chien-dich", label: "Chiến dịch", icon: IconMegaphone },
  { href: "/admin/heatmap", label: "Heatmap", icon: IconFlame },
  { href: "/admin/tracking", label: "Tracking", icon: IconActivity },
  { href: "/admin/cai-dat", label: "Cài đặt", icon: IconSettings },
];

const PAGE_TITLES = {
  "/admin": "Tổng quan",
  "/admin/khach-hang": "Khách hàng",
  "/admin/chien-dich": "Chiến dịch",
  "/admin/heatmap": "Heatmap",
  "/admin/tracking": "Tracking",
  "/admin/cai-dat": "Cài đặt",
};

function ActiveLandingBadge() {
  const { landing } = useActiveLanding();
  const info = landingPages.find((l) => l.path === landing);
  return (
    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-[#e25010] text-xs font-semibold px-3.5 py-1.5 border border-orange-200/80 shadow-2xs">
      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" />
      {info?.name ?? landing}
    </span>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] || "Quản trị";
  const isLoginPage = pathname === "/admin/login";

  const [session, setSession] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Multi-layered DevTools & Source Protection for Admin Portal
  useEffect(() => {
    // 1. Chặn menu chuột phải
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. Chặn các phím tắt DevTools (F12, Ctrl+Shift+I/C/J, Ctrl+U)
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Giám sát kích thước cửa sổ để phát hiện mở DevTools
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      if (widthDiff > threshold || heightDiff > threshold) {
        document.body.innerHTML = 
          "<div style='display:flex;align-items:center;justify-content:center;height:100vh;background-color:#07080d;color:#fafafa;font-family:sans-serif;text-align:center;padding:20px;'>" +
          "<div style='margin:auto;'>" +
          "<h1 style='font-size:24px;color:#ff5500;margin-bottom:10px;'>Cảnh báo bảo mật Admin!</h1>" +
          "<p style='font-size:14px;color:#a1a1aa;'>Phát hiện hành vi can thiệp hệ thống quản trị. Vui lòng đóng cửa sổ kiểm tra để tiếp tục làm việc.</p>" +
          "</div>" +
          "</div>";
      }
    };
    window.addEventListener("resize", checkDevTools);
    checkDevTools();

    // 4. Bẫy đóng băng DevTools bằng vòng lặp Debugger siêu tốc
    let debuggerInterval;
    const startDebuggerTrap = () => {
      debuggerInterval = setInterval(() => {
        (function() {}.constructor("debugger")());
      }, 100);
    };
    const timer = setTimeout(startDebuggerTrap, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", checkDevTools);
      clearInterval(debuggerInterval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Dark Mode initialization
    const isDark = localStorage.getItem("adminDarkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem("adminDarkMode", String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (session === null && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [session, isLoginPage, router]);

  if (isLoginPage) {
    return children;
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7] text-sm text-[#898781] gap-2.5 font-sans">
        <div className="w-5 h-5 border-2 border-[#e25010] border-t-transparent rounded-full animate-spin" />
        <span>Đang kiểm tra đăng nhập...</span>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const initials = (session.user.email || "AD").slice(0, 2).toUpperCase();

  return (
    <LandingProvider>
      <div className="min-h-screen bg-[#f9f9f7] flex font-sans selection:bg-orange-500 selection:text-white">
        {/* Mobile Navigation Backdrop */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={
            "w-64 shrink-0 border-r border-black/10 bg-white flex flex-col z-50 transition-transform duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 " +
            (mobileNavOpen ? "translate-x-0 shadow-2xl" : "max-lg:-translate-x-full")
          }
        >
          {/* Logo Header with Official Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-auto flex items-center justify-center py-1">
                <img src="/logo.png" alt="Flowmax Logo" className="h-full w-auto object-contain filter drop-shadow-xs" />
              </div>
              <div>
                <p className="text-sm font-black text-[#0b0b0b] leading-tight">Flowmax</p>
                <p className="text-[11px] text-[#898781] leading-tight font-medium">Admin</p>
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden text-[#898781] hover:text-[#0b0b0b] p-1"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links with Warm Login-Matching Palette */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={
                    "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 group " +
                    (active
                      ? "bg-gradient-to-r from-orange-500/10 to-red-500/5 text-[#e25010] font-bold border border-orange-500/20 shadow-2xs"
                      : "text-[#52514e] hover:bg-orange-50/60 hover:text-[#e25010] border border-transparent")
                  }
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-[#e25010] to-[#d0212a]" />
                  )}
                  <Icon className={active ? "text-[#e25010]" : "text-[#898781] group-hover:text-[#e25010] transition-colors"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>


        </aside>

        {/* Main Header & Body */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden text-[#52514e] hover:text-[#0b0b0b] p-2 rounded-lg bg-black/[0.04]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              <h1 className="text-base font-bold text-[#0b0b0b] tracking-tight">{title}</h1>
              <ActiveLandingBadge />
            </div>

            <div className="relative flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-[#52514e] hover:bg-black/[0.04] transition-colors cursor-pointer"
                title={darkMode ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-2xl border border-black/10 bg-white shadow-xl py-1.5 z-50">
                  <p className="px-4 py-2 text-xs font-semibold text-[#898781] truncate border-b border-black/[0.06] mb-1">
                    {session.user.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    <span>Đăng xuất hệ thống</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </LandingProvider>
  );
}
