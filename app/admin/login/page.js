"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mouse position tracking for interactive cursor spotlight glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <div className="relative min-h-screen bg-[#07080d] text-white flex items-center justify-center px-4 py-12 overflow-hidden selection:bg-orange-500 selection:text-white font-sans">
      {/* Interactive Mouse Spotlight Glow Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300 opacity-90"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.22), transparent 45%)`,
        }}
      />

      {/* Dynamic Ambient Glowing Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-orange-600/50 via-red-600/35 to-purple-700/45 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-blue-600/35 blur-[140px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-600/40 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[25%] w-[450px] h-[450px] rounded-full bg-amber-500/20 blur-[120px] animate-pulse" />

        {/* Floating Particles background simulation */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-12 left-[15%] w-2 h-2 rounded-full bg-orange-500 blur-[1px] animate-pulse" />
          <div className="absolute top-1/4 right-[20%] w-3 h-3 rounded-full bg-amber-400 blur-[2px] animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute top-1/3 left-[40%] w-1.5 h-1.5 rounded-full bg-red-400 blur-[1px] animate-pulse" />
          <div className="absolute bottom-[35%] left-[10%] w-2.5 h-2.5 rounded-full bg-orange-400 blur-[1.5px] animate-ping" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-[20%] right-[30%] w-2 h-2 rounded-full bg-amber-300 blur-[1px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[45%] w-3 h-3 rounded-full bg-rose-500 blur-[2px] animate-ping" style={{ animationDuration: "5s" }} />
          <div className="absolute top-[45%] right-[10%] w-1.5 h-1.5 rounded-full bg-purple-400 blur-[1px] animate-pulse" />
          <div className="absolute top-[10%] right-[45%] w-2 h-2 rounded-full bg-blue-400 blur-[1px] animate-pulse" />
        </div>

        {/* Fine Cyberpunk Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff09_1px,transparent_1px),linear-gradient(to_bottom,#ffffff09_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_75%,transparent_100%)]" />
      </div>

      <div className="relative w-full max-w-md z-20">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-5 group cursor-pointer animate-pulse">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 opacity-70 blur-2xl group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative h-20 px-8 py-3.5 rounded-2xl bg-[#0d0f18]/90 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="Flowmax Logo" className="h-full w-auto object-contain filter drop-shadow-[0_0_18px_rgba(249,115,22,0.85)]" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Flowmax Admin</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5">Hệ thống quản trị Landing Page & Khách hàng hợp nhất</p>
        </div>

        {/* Animated Neon Rotating Border Wrapper (Pure Tailwind Arbitrary Animation) */}
        <div className="relative rounded-3xl p-[1.5px] overflow-hidden group shadow-[0_25px_60px_rgba(0,0,0,0.8)] transition-all duration-300 hover:shadow-[0_30px_70px_rgba(249,115,22,0.25)]">
          {/* Animated Spinning Neon Gradient Border */}
          <div className="absolute -inset-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,#ff5500_0deg,#e25010_90deg,#9333ea_180deg,#3b82f6_270deg,#ff5500_360deg)] animate-[spin_12s_linear_infinite] opacity-85 group-hover:opacity-100 transition-opacity" />

          {/* Glassmorphic Inner Card Container */}
          <div className="relative rounded-3xl bg-[#0e101a]/90 backdrop-blur-2xl p-8">
            {/* Top glowing hairline accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-90" />

            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Đăng nhập hệ thống</h2>
              <p className="text-xs text-zinc-400 mt-1">Chỉ tài khoản được cấp quyền mới có thể truy cập.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Email quản trị
                </label>
                <div className="relative group/input">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@flowmax.vn"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 px-4 pl-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:bg-white/[0.07] transition-all duration-200"
                  />
                  <svg className="w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="relative group/input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 px-4 pl-11 pr-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:bg-white/[0.07] transition-all duration-200"
                  />
                  <svg className="w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>

                  {/* Toggle Show/Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-400 p-1 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274-4.057 5.064-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-center gap-2.5 text-xs text-rose-400">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button with Shimmer Effect */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold text-sm py-3.5 px-4 shadow-[0_0_25px_rgba(238,82,31,0.4)] hover:shadow-[0_0_40px_rgba(238,82,31,0.7)] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group/btn before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-1000"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận đăng nhập</span>
                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Card Footer */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-[11px] text-zinc-500">
                Bảo mật hệ thống Flowmax Global Engine © 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
