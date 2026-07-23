"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SourceBadge } from "../_components/Badge";
import { IconSearch } from "../_components/icons";
import DateRangeFilter from "../_components/DateRangeFilter";
import { sourceLabels } from "../_lib/mockData";
import { useActiveLanding } from "../_lib/LandingContext";
import useAutoRefresh from "../_lib/useAutoRefresh";

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskPhone(phone) {
  if (!phone) return "—";
  const clean = phone.trim();
  if (clean.length < 7) return clean;
  return clean.slice(0, 3) + "****" + clean.slice(-3);
}

function maskEmail(email) {
  if (!email) return "—";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return name[0] + "***@" + domain;
  return name.slice(0, 2) + "***@" + domain;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("Tất cả nguồn");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [unveiledIds, setUnveiledIds] = useState(new Set());
  const { landing } = useActiveLanding();

  const requestIdRef = useRef(0);

  const loadLeads = useCallback(({ silent } = {}) => {
    const requestId = ++requestIdRef.current;
    if (!silent) setLoading(true);

    supabase
      .from("khach_hang")
      .select("id, ho_ten, so_dien_thoai, email, nguon, ghi_chu, thoi_gian, landing, chien_dich(ten_chien_dich, slug)")
      .eq("landing", landing)
      .order("thoi_gian", { ascending: false })
      .then(({ data, error }) => {
        if (requestIdRef.current !== requestId) return;
        if (error) {
          setLoadError(error.message);
        } else {
          setLoadError("");
          setLeads(data || []);
        }
        setLoading(false);
      });
  }, [landing]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useAutoRefresh(() => loadLeads({ silent: true }), 10000);

  const handleDelete = async (lead) => {
    if (!window.confirm(`Xoá khách hàng "${lead.ho_ten}"? Không thể hoàn tác.`)) return;
    setDeletingId(lead.id);
    const { error } = await supabase.from("khach_hang").delete().eq("id", lead.id);
    if (error) {
      setDeletingId(null);
      window.alert("Xoá thất bại: " + error.message);
      return;
    }

    // Đồng bộ xoá sang phmax.vn (best-effort, không chặn UX nếu lỗi)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      fetch("/api/dong-bo-xoa", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: lead.id }),
      }).catch((err) => console.warn("[PHMAX_SYNC_DELETE_ERROR]", err));
    }

    setDeletingId(null);
    loadLeads({ silent: true });
  };

  const sourceOptions = useMemo(() => {
    const distinct = [...new Set(leads.map((l) => l.nguon).filter(Boolean))];
    return ["Tất cả nguồn", ...distinct];
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !q ||
        lead.ho_ten?.toLowerCase().includes(q) ||
        lead.so_dien_thoai?.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        lead.email?.toLowerCase().includes(q);
      const matchesSource = source === "Tất cả nguồn" || lead.nguon === source;
      const leadDate = lead.thoi_gian?.slice(0, 10);
      const matchesFrom = !fromDate || (leadDate && leadDate >= fromDate);
      const matchesTo = !toDate || (leadDate && leadDate <= toDate);
      return matchesQuery && matchesSource && matchesFrom && matchesTo;
    });
  }, [leads, query, source, fromDate, toDate]);

  return (
    <div className="space-y-4">
      <DateRangeFilter
        from={fromDate}
        to={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onReset={() => {
          setFromDate("");
          setToDate("");
        }}
        onToday={(today) => {
          setFromDate(today);
          setToDate(today);
        }}
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#898781]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, email..."
            className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0b0b0b] placeholder:text-[#898781] outline-none focus:border-[#e25010]"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] outline-none focus:border-[#e25010] sm:w-48"
        >
          {sourceOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "Tất cả nguồn" ? opt : sourceLabels[opt]?.label ?? opt}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-[#f9f9f7]">
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Khách hàng</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Liên hệ</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Nguồn</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Chiến dịch</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Ghi chú</th>
                <th className="text-left font-semibold text-[#52514e] px-4 py-3">Thời gian</th>
                <th className="text-right font-semibold text-[#52514e] px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#898781]">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && loadError && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#d03b3b]">
                    Không tải được dữ liệu: {loadError}
                  </td>
                </tr>
              )}

              {!loading && !loadError &&
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#f9f9f7]">
                    <td className="px-4 py-3 font-medium text-[#0b0b0b] whitespace-nowrap">{lead.ho_ten}</td>
                    <td className="px-4 py-3 text-[#52514e] whitespace-nowrap">
                      <div className="flex items-center justify-between gap-3 min-w-[190px]">
                        <div>
                          <p className="tabular-nums font-semibold tracking-wide text-[#0b0b0b]">
                            {unveiledIds.has(lead.id) ? lead.so_dien_thoai : maskPhone(lead.so_dien_thoai)}
                          </p>
                          <p className="text-xs text-[#898781]">
                            {unveiledIds.has(lead.id) ? (lead.email || "—") : maskEmail(lead.email)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUnveiledIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(lead.id)) {
                                next.delete(lead.id);
                              } else {
                                next.add(lead.id);
                              }
                              return next;
                            });
                          }}
                          className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-[#898781] hover:text-[#e25010] transition-colors cursor-pointer"
                          title={unveiledIds.has(lead.id) ? "Ẩn thông tin liên hệ" : "Hiển thị thông tin liên hệ"}
                        >
                          {unveiledIds.has(lead.id) ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SourceBadge source={sourceLabels[lead.nguon]?.label ?? lead.nguon ?? "—"} color={sourceLabels[lead.nguon]?.color} />
                    </td>
                    <td className="px-4 py-3 text-[#52514e] whitespace-nowrap">{lead.chien_dich?.ten_chien_dich ?? "—"}</td>
                    <td className="px-4 py-3 text-[#52514e] max-w-[220px] truncate" title={lead.ghi_chu || ""}>
                      {lead.ghi_chu || "—"}
                    </td>
                    <td className="px-4 py-3 text-[#898781] whitespace-nowrap tabular-nums">{formatDateTime(lead.thoi_gian)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(lead)}
                        disabled={deletingId === lead.id}
                        className="text-xs font-medium text-[#d03b3b] hover:text-[#a12e2e] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {deletingId === lead.id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </td>
                  </tr>
                ))}

              {!loading && !loadError && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#898781]">
                    {leads.length === 0 ? "Chưa có khách hàng nào đăng ký." : "Không tìm thấy khách hàng phù hợp."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !loadError && (
        <p className="text-xs text-[#898781]">
          Hiển thị {filtered.length} / {leads.length} khách hàng.
        </p>
      )}
    </div>
  );
}
