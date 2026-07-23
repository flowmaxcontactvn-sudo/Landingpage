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

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("Tất cả nguồn");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deletingId, setDeletingId] = useState(null);
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
                      <p className="tabular-nums">{lead.so_dien_thoai}</p>
                      <p className="text-xs text-[#898781]">{lead.email || "—"}</p>
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
