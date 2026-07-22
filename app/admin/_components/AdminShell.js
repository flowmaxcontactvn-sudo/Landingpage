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
    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#fdf0ea] text-[#e25010] text-xs font-semibold px-3 py-1.5 border border-[#f5d0bb]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e25010]" />
      {info?.name ?? landing}
    </span>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] || "Quản trị";
  const isLoginPage = pathname === "/admin/login";

  // undefined = đang kiểm tra, null = chưa đăng nhập, object = đã đăng nhập
  const [session, setSession] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));

    // Trình duyệt có thể tạm dừng bộ đếm tự làm mới token khi tab không active
    // lâu — mỗi lần quay lại tab, chủ động kiểm tra/làm mới phiên ngay.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7] text-sm text-[#898781]">
        Đang kiểm tra đăng nhập...
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
      <div className="min-h-screen bg-[#f9f9f7] flex">
        <aside className="w-64 shrink-0 border-r border-black/10 bg-white flex flex-col max-lg:hidden">
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-black/10">
            <div className="w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b0b0b] leading-tight">Flowmax</p>
              <p className="text-[11px] text-[#898781] leading-tight">Admin</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
                    (active
                      ? "bg-[#fdf0ea] text-[#e25010]"
                      : "text-[#52514e] hover:bg-black/[0.04] hover:text-[#0b0b0b]")
                  }
                >
                  <Icon className={active ? "text-[#e25010]" : "text-[#898781]"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-black/10">
            <button
              onClick={handleSignOut}
              className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-[#52514e] hover:bg-black/[0.04] hover:text-[#0b0b0b] transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-[#0b0b0b]">{title}</h1>
              <ActiveLandingBadge />
            </div>
            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-[#f0efec] flex items-center justify-center text-sm font-semibold text-[#52514e]"
              >
                {initials}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-lg border border-black/10 bg-white shadow-lg py-1.5 z-20">
                  <p className="px-3 py-1.5 text-xs text-[#898781] truncate border-b border-black/[0.06] mb-1">{session.user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-[#0b0b0b] hover:bg-black/[0.04]"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </LandingProvider>
  );
}
