"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useActiveLanding } from "./_lib/LandingContext";
import useAutoRefresh from "./_lib/useAutoRefresh";
import StatTile from "./_components/StatTile";
import LineChart from "./_components/LineChart";
import BarList from "./_components/BarList";
import DateRangeFilter from "./_components/DateRangeFilter";
import { SourceBadge } from "./_components/Badge";
import { IconUsers, IconTrendUp, IconPercent, IconMegaphone } from "./_components/icons";
import { sourceLabels, formatNumber } from "./_lib/mockData";

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKey(dateStr) {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 13);
  return toDateStr(d);
}

export default function AdminOverviewPage() {
  const { landing } = useActiveLanding();
  const [fromDate, setFromDate] = useState(defaultFrom());
  const [toDate, setToDate] = useState(toDateStr(new Date()));

  const [leads, setLeads] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [dailyVisits, setDailyVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const requestIdRef = useRef(0);

  const loadOverview = useCallback(({ silent } = {}) => {
    const requestId = ++requestIdRef.current;
    if (!silent) setLoading(true);

    let leadsQuery = supabase
      .from("khach_hang")
      .select("id, ho_ten, so_dien_thoai, nguon, thiet_bi, thoi_gian")
      .eq("landing", landing)
      .order("thoi_gian", { ascending: false });

    if (fromDate) leadsQuery = leadsQuery.gte("thoi_gian", `${fromDate}T00:00:00`);
    if (toDate) leadsQuery = leadsQuery.lte("thoi_gian", `${toDate}T23:59:59`);

    // Lượt truy cập theo ngày lấy từ heatmap_thiet_bi (so_phien) — đây là số
    // phiên thật vào landing page mỗi ngày, có mốc "ngay" nên lọc được đúng
    // theo khoảng đang chọn (khác với chi_tiet_chien_dich.luot_truy_cap chỉ
    // cộng dồn từ trước đến nay, không tách được theo ngày/khoảng thời gian).
    let visitsQuery = supabase.from("heatmap_thiet_bi").select("ngay, so_phien").eq("landing", landing);
    if (fromDate) visitsQuery = visitsQuery.gte("ngay", fromDate);
    if (toDate) visitsQuery = visitsQuery.lte("ngay", toDate);

    Promise.all([
      leadsQuery,
      supabase
        .from("khach_hang")
        .select("id, ho_ten, so_dien_thoai, nguon, thiet_bi, thoi_gian")
        .eq("landing", landing)
        .order("thoi_gian", { ascending: false })
        .limit(5),
      supabase
        .from("chien_dich")
        .select("id, ten_chien_dich, chi_tiet_chien_dich(luot_truy_cap, luot_dang_ky_thanh_cong)")
        .eq("landing", landing),
      visitsQuery,
    ]).then(([leadsRes, recentRes, campaignsRes, visitsRes]) => {
      if (requestIdRef.current !== requestId) return;
      const err = leadsRes.error || recentRes.error || campaignsRes.error || visitsRes.error;
      if (err) {
        setLoadError(err.message);
        setLoading(false);
        return;
      }
      setLoadError("");
      setLeads(leadsRes.data || []);
      setRecentLeads(recentRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setDailyVisits(visitsRes.data || []);
      setLoading(false);
    });
  }, [landing, fromDate, toDate]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useAutoRefresh(() => loadOverview({ silent: true }), 10000);

  const trend = useMemo(() => {
    // Toàn thời gian (không chọn ngày): lấy từ mốc cũ nhất (lead hoặc lượt
    // truy cập, cái nào có trước) tới hôm nay — để không cắt mất dữ liệu
    // lượt truy cập nếu nó có trước lead đầu tiên.
    let start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const end = toDate ? new Date(`${toDate}T00:00:00`) : new Date();

    if (!start) {
      const oldestLead = leads.length ? leads.reduce((min, l) => (l.thoi_gian < min ? l.thoi_gian : min), leads[0].thoi_gian).slice(0, 10) : null;
      const oldestVisit = dailyVisits.length ? dailyVisits.reduce((min, v) => (v.ngay < min ? v.ngay : min), dailyVisits[0].ngay) : null;
      const oldest = [oldestLead, oldestVisit].filter(Boolean).sort()[0];
      start = oldest ? new Date(`${oldest}T00:00:00`) : new Date();
    }

    const days = [];
    const cursor = new Date(start);
    // Chặn tối đa 90 điểm để biểu đồ không bị quá dài khi xem toàn thời gian.
    while (cursor <= end && days.length < 90) {
      const key = toDateStr(cursor);
      days.push({ date: dateKey(key), key, leads: 0, visits: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const byKey = {};
    days.forEach((d) => (byKey[d.key] = d));
    leads.forEach((lead) => {
      const key = lead.thoi_gian.slice(0, 10);
      if (byKey[key]) byKey[key].leads += 1;
    });
    dailyVisits.forEach((row) => {
      if (byKey[row.ngay]) byKey[row.ngay].visits += Number(row.so_phien || 0);
    });
    return days;
  }, [leads, dailyVisits, fromDate, toDate]);

  // Lượt truy cập + tỷ lệ chuyển đổi tính đúng theo khoảng ngày đang lọc
  // (tổng số phiên thật vào landing page trong khoảng đó), không phải số
  // cộng dồn từ trước đến nay như chi_tiet_chien_dich.
  const totalVisits = dailyVisits.reduce((sum, row) => sum + Number(row.so_phien || 0), 0);
  const conversion = totalVisits > 0 ? (leads.length / totalVisits) * 100 : 0;

  const topCampaigns = [...campaigns]
    .sort((a, b) => (b.chi_tiet_chien_dich?.luot_truy_cap || 0) - (a.chi_tiet_chien_dich?.luot_truy_cap || 0))
    .slice(0, 5)
    .map((c) => ({ key: c.id, label: c.ten_chien_dich, score: c.chi_tiet_chien_dich?.luot_truy_cap || 0 }));

  const sourceBreakdown = useMemo(() => {
    const counts = {};
    leads.forEach((lead) => {
      const key = lead.nguon || "Không xác định";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts)
      .map((key) => ({ key, label: sourceLabels[key]?.label ?? key, score: counts[key] }))
      .sort((a, b) => b.score - a.score);
  }, [leads]);

  const peakHoursBreakdown = useMemo(() => {
    const hours = {};
    leads.forEach((lead) => {
      if (!lead.thoi_gian) return;
      const h = new Date(lead.thoi_gian).getHours();
      const label = `${String(h).padStart(2, "0")}:00 - ${String(h).padStart(2, "0")}:59`;
      hours[label] = (hours[label] || 0) + 1;
    });
    return Object.keys(hours)
      .map((key) => ({ key, label: key, score: hours[key] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [leads]);

  const deviceBreakdown = useMemo(() => {
    const counts = { Mobile: 0, Desktop: 0, Tablet: 0 };
    leads.forEach((lead) => {
      const dev = lead.thiet_bi;
      if (dev === "mobile") counts.Mobile += 1;
      else if (dev === "desktop") counts.Desktop += 1;
      else if (dev === "tablet") counts.Tablet += 1;
    });
    return Object.keys(counts)
      .filter((k) => counts[k] > 0)
      .map((key) => ({ key, label: key, score: counts[key] }))
      .sort((a, b) => b.score - a.score);
  }, [leads]);

  return (
    <div className="space-y-6">
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
        onPreset={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
      />

      {loading ? (
        <p className="text-sm text-[#898781]">Đang tải dữ liệu...</p>
      ) : loadError ? (
        <p className="text-sm text-[#d03b3b]">Không tải được dữ liệu: {loadError}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Khách đăng ký (trong khoảng)" value={leads.length} formatValue={formatNumber} icon={IconUsers} accent="#eb6834" />
            <StatTile label="Lượt truy cập (trong khoảng)" value={totalVisits} formatValue={formatNumber} icon={IconTrendUp} accent="#2a78d6" />
            <StatTile label="Tỷ lệ chuyển đổi (trong khoảng)" value={conversion} formatValue={(n) => `${n.toFixed(1)}%`} icon={IconPercent} accent="#1baf7a" />
            <StatTile label="Số chiến dịch" value={campaigns.length} icon={IconMegaphone} accent="#4a3aa7" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <LineChart data={trend} valueKey="visits" label="Lượt truy cập theo ngày" color="#2a78d6" formatValue={formatNumber} />
            </div>
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <LineChart data={trend} valueKey="leads" label="Khách đăng ký theo ngày" color="#e25010" formatValue={formatNumber} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Nguồn khách hàng (trong khoảng)</p>
              {sourceBreakdown.length === 0 ? (
                <p className="text-sm text-[#898781]">Chưa có dữ liệu.</p>
              ) : (
                <BarList items={sourceBreakdown} />
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-[#0b0b0b]">Chiến dịch dẫn đầu (theo lượt truy cập)</p>
                <Link href="/admin/chien-dich" className="text-xs font-medium text-[#e25010] hover:underline">
                  Xem tất cả
                </Link>
              </div>
              {topCampaigns.length === 0 ? (
                <p className="text-sm text-[#898781]">Chưa có chiến dịch nào.</p>
              ) : (
                <BarList items={topCampaigns} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Khung giờ vàng đăng ký (nhiều nhất)</p>
              {peakHoursBreakdown.length === 0 ? (
                <p className="text-sm text-[#898781]">Chưa có dữ liệu đăng ký.</p>
              ) : (
                <BarList items={peakHoursBreakdown} />
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Đăng ký theo thiết bị</p>
              {deviceBreakdown.length === 0 ? (
                <p className="text-sm text-[#898781]">Chưa có dữ liệu thiết bị.</p>
              ) : (
                <BarList items={deviceBreakdown} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#0b0b0b]">Khách hàng mới nhất</p>
              <Link href="/admin/khach-hang" className="text-xs font-medium text-[#e25010] hover:underline">
                Xem tất cả
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-[#898781]">Chưa có khách hàng nào.</p>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0b0b0b] truncate">{lead.ho_ten}</p>
                      <p className="text-xs text-[#898781]">{lead.so_dien_thoai}</p>
                    </div>
                    <SourceBadge source={sourceLabels[lead.nguon]?.label ?? lead.nguon ?? "—"} color={sourceLabels[lead.nguon]?.color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
