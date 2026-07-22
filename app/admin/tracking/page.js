"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "../_components/Modal";
import { useActiveLanding } from "../_lib/LandingContext";
import useAutoRefresh from "../_lib/useAutoRefresh";

const FIELDS = [
  { key: "facebook_pixel", label: "Facebook Pixel ID", placeholder: "Ví dụ: 2834126283617248" },
  { key: "tiktok_pixel", label: "TikTok Pixel ID", placeholder: "Ví dụ: CXXXXXXXXXXXXXXXXX" },
  { key: "google_tag", label: "Google Tag ID / Analytics ID", placeholder: "Ví dụ: G-XXXXXX hoặc GTM-XXXXXX" },
  { key: "youtube_ads", label: "YouTube Ads ID", placeholder: "Ví dụ: AW-XXXXXX" },
  { key: "conversion_label", label: "Conversion Label", placeholder: "Ví dụ: YYYY-ZZZZ" },
];

const TYPE_LABELS = {
  facebook_pixel: "Facebook Pixel",
  tiktok_pixel: "TikTok Pixel",
  google_tag: "Google Tag / Analytics",
  youtube_ads: "YouTube Ads",
  conversion_label: "Conversion Label",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function TrackingPage() {
  const { landing } = useActiveLanding();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const requestIdRef = useRef(0);

  const loadItems = useCallback(async ({ silent } = {}) => {
    const requestId = ++requestIdRef.current;
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from("cau_hinh_tracking")
      .select("id, loai_ma, ma, ngay_them")
      .eq("landing", landing)
      .order("ngay_them", { ascending: false });

    if (requestIdRef.current !== requestId) return;
    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError("");
      setItems(data || []);
    }
    setLoading(false);
  }, [landing]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useAutoRefresh(() => loadItems({ silent: true }), 10000);

  const handleSave = async (e) => {
    e.preventDefault();
    const rows = FIELDS.filter((f) => form[f.key]?.trim()).map((f) => ({
      landing,
      loai_ma: f.key,
      ma: form[f.key].trim(),
    }));

    if (rows.length === 0) {
      setFormError("Nhập ít nhất 1 mã.");
      return;
    }

    setSaving(true);
    setFormError("");

    const { error } = await supabase.from("cau_hinh_tracking").insert(rows);

    setSaving(false);
    if (error) {
      setFormError(error.message);
      return;
    }

    setForm({});
    setOpen(false);
    loadItems();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xoá mã "${TYPE_LABELS[item.loai_ma]}" — ${item.ma}?`)) return;
    const { error } = await supabase.from("cau_hinh_tracking").delete().eq("id", item.id);
    if (!error) loadItems();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          + Thêm mã Tracking
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nhập mã Pixel Tracking mới">
        <form onSubmit={handleSave} className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-1.5">{f.label}</label>
              <input
                type="text"
                value={form[f.key] || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] placeholder:text-[#898781] outline-none focus:border-[#e25010]"
              />
            </div>
          ))}

          {formError && <p className="text-xs text-[#d03b3b]">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {saving ? "Đang lưu..." : "Lưu mã Tracking"}
          </button>
        </form>
      </Modal>

      <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-black/10">
          <p className="text-sm font-semibold text-[#0b0b0b]">Danh sách mã Tracking đang hoạt động</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-[#f9f9f7]">
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Loại mã</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Mã</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Ngày thêm</th>
                <th className="text-right font-semibold text-[#52514e] px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#898781]">Đang tải dữ liệu...</td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#d03b3b]">Không tải được dữ liệu: {loadError}</td>
                </tr>
              )}
              {!loading && !loadError && items.map((item) => (
                <tr key={item.id} className="hover:bg-[#f9f9f7]">
                  <td className="px-4 py-3 font-medium text-[#0b0b0b] whitespace-nowrap">{TYPE_LABELS[item.loai_ma] ?? item.loai_ma}</td>
                  <td className="px-4 py-3 text-[#52514e] whitespace-nowrap tabular-nums">{item.ma}</td>
                  <td className="px-4 py-3 text-[#898781] whitespace-nowrap tabular-nums">{formatDate(item.ngay_them)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(item)} className="text-xs font-medium text-[#d03b3b] hover:text-[#a12e2e]">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !loadError && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#898781]">Chưa có mã tracking nào cho landing này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
