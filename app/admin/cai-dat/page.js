"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useActiveLanding } from "../_lib/LandingContext";
import { landingPages } from "../_lib/mockData";

export default function SettingsPage() {
  const { landing, setLanding } = useActiveLanding();

  const [zaloLink, setZaloLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSaved(false);
    setError("");

    supabase
      .from("cau_hinh_landing")
      .select("zalo_link")
      .eq("landing", landing)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        setZaloLink(data?.zalo_link || "");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [landing]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const { error } = await supabase
      .from("cau_hinh_landing")
      .upsert({ landing, zalo_link: zaloLink.trim() });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="rounded-xl border border-black/10 bg-white p-5 lg:p-6">
        <p className="text-sm font-semibold text-[#0b0b0b] mb-1">Landing đang quản lý</p>
        <p className="text-xs text-[#898781] mb-5">
          Chọn 1 landing page — toàn bộ dữ liệu trong các trang Tổng quan, Khách hàng, Chiến dịch, Heatmap sẽ tự động lọc theo landing này.
        </p>

        <select
          value={landing}
          onChange={(e) => setLanding(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm font-medium text-[#0b0b0b] outline-none focus:border-[#e25010]"
        >
          {landingPages.map((l) => (
            <option key={l.path} value={l.path}>
              {l.name} — {l.domain}
              {!l.live ? " (chưa có nội dung)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-5 lg:p-6">
        <p className="text-sm font-semibold text-[#0b0b0b] mb-1">Link Zalo</p>
        <p className="text-xs text-[#898781] mb-5">
          Dùng để tạo mã QR hiển thị cho khách sau khi đăng ký thành công trên landing đang quản lý ở trên.
        </p>

        {loading ? (
          <p className="text-sm text-[#898781]">Đang tải...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <input
              type="url"
              value={zaloLink}
              onChange={(e) => setZaloLink(e.target.value)}
              placeholder="https://zalo.me/..."
              required
              className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] placeholder:text-[#898781] outline-none focus:border-[#e25010]"
            />

            {error && <p className="text-xs text-[#d03b3b]">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || !zaloLink.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              {saved && <p className="text-xs text-[#0a6b0a]">Đã lưu.</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
