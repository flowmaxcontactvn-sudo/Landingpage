"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Sai email hoặc mật khẩu.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] flex items-center justify-center text-white font-bold text-base">
            F
          </div>
          <div>
            <p className="text-sm font-bold text-[#0b0b0b] leading-tight">Flowmax</p>
            <p className="text-[11px] text-[#898781] leading-tight">Admin</p>
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6">
          <p className="text-base font-semibold text-[#0b0b0b] mb-1">Đăng nhập quản trị</p>
          <p className="text-xs text-[#898781] mb-5">Chỉ tài khoản được cấp quyền mới truy cập được.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] outline-none focus:border-[#e25010]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] outline-none focus:border-[#e25010]"
              />
            </div>

            {error && <p className="text-xs text-[#d03b3b]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
