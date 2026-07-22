"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatTile from "../_components/StatTile";
import BarList from "../_components/BarList";
import PageHeatmap from "../_components/PageHeatmap";
import { IconClock, IconMonitor, IconTablet, IconPhone } from "../_components/icons";
import { sectionLabelsByLanding, formatDuration } from "../_lib/mockData";
import { useActiveLanding } from "../_lib/LandingContext";
import useAutoRefresh from "../_lib/useAutoRefresh";

const DEVICES = [
  { key: "desktop", label: "Desktop", icon: IconMonitor },
  { key: "tablet", label: "Tablet", icon: IconTablet },
  { key: "mobile", label: "Mobile", icon: IconPhone },
];

export default function HeatmapPage() {
  const { landing } = useActiveLanding();
  const [device, setDevice] = useState("mobile");
  const [sections, setSections] = useState([]);
  const [deviceStats, setDeviceStats] = useState({});
  const [registeredAvgSession, setRegisteredAvgSession] = useState("0m 0s");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const sectionLabels = sectionLabelsByLanding[landing] || {};
  const requestIdRef = useRef(0);

  const loadHeatmap = useCallback(({ silent } = {}) => {
    const requestId = ++requestIdRef.current;
    if (!silent) setLoading(true);

    Promise.all([
      supabase.from("heatmap_section").select("section_key, tong_giay").eq("landing", landing).eq("thiet_bi", device),
      supabase.from("heatmap_thiet_bi").select("thiet_bi, luot_di_chuyen, luot_click, trung_binh_giay_phien").eq("landing", landing),
      supabase
        .from("khach_hang")
        .select("thoi_gian_phien_giay")
        .eq("landing", landing)
        .eq("thiet_bi", device)
        .not("thoi_gian_phien_giay", "is", null),
    ]).then(([sectionRes, deviceRes, registeredRes]) => {
      if (requestIdRef.current !== requestId) return;

      if (sectionRes.error || deviceRes.error || registeredRes.error) {
        setLoadError((sectionRes.error || deviceRes.error || registeredRes.error).message);
        setLoading(false);
        return;
      }
      setLoadError("");

      const byKey = {};
      (sectionRes.data || []).forEach((row) => {
        byKey[row.section_key] = Number(row.tong_giay) || 0;
      });
      const maxGiay = Math.max(1, ...Object.values(byKey));

      const list = Object.keys(sectionLabelsByLanding[landing] || {}).map((key) => ({
        key,
        label: sectionLabelsByLanding[landing][key],
        giay: byKey[key] || 0,
        score: Math.round(((byKey[key] || 0) / maxGiay) * 100),
      }));
      setSections(list);

      const stats = {};
      (deviceRes.data || []).forEach((row) => {
        stats[row.thiet_bi] = {
          moves: row.luot_di_chuyen,
          clicks: row.luot_click,
          avgSession: formatDuration(row.trung_binh_giay_phien),
        };
      });
      setDeviceStats(stats);

      const registeredRows = registeredRes.data || [];
      const registeredAvg = registeredRows.length
        ? registeredRows.reduce((sum, row) => sum + Number(row.thoi_gian_phien_giay || 0), 0) / registeredRows.length
        : 0;
      setRegisteredAvgSession(formatDuration(registeredAvg));

      setLoading(false);
    });
  }, [landing, device]);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  useAutoRefresh(() => loadHeatmap({ silent: true }), 10000);

  const stats = deviceStats[device] || { moves: 0, clicks: 0, avgSession: "0m 0s" };
  const topSections = [...sections].sort((a, b) => b.score - a.score);

  if (loading) {
    return <p className="text-sm text-[#898781]">Đang tải dữ liệu...</p>;
  }

  if (loadError) {
    return <p className="text-sm text-[#d03b3b]">Không tải được dữ liệu: {loadError}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-white p-1 w-fit">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            const active = device === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDevice(d.key)}
                className={
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                  (active ? "bg-[#fdf0ea] text-[#e25010]" : "text-[#52514e] hover:bg-black/[0.04]")
                }
              >
                <Icon />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <StatTile label="Thời gian trung bình/phiên" value={stats.avgSession} icon={IconClock} accent="#1baf7a" />
        <StatTile label="TB/phiên (đã đăng ký)" value={registeredAvgSession} icon={IconClock} accent="#e25010" />
      </div>

      {Object.keys(sectionLabels).length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-8 text-center text-sm text-[#898781]">
          Landing page này chưa có nội dung/section nào để đo lường.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm font-semibold text-[#0b0b0b] mb-1">Bản đồ mức độ chú ý theo section</p>
            <p className="text-xs text-[#898781] mb-4">Xếp theo đúng thứ tự cuộn trang landing page — màu càng đậm, tương tác càng nhiều.</p>
            <PageHeatmap sections={sections} />
          </div>

          <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Xếp hạng section nổi bật</p>
            {topSections.some((s) => s.score > 0) ? (
              <BarList items={topSections} valueKey="giay" formatValue={formatDuration} />
            ) : (
              <p className="text-sm text-[#898781]">Chưa có dữ liệu — cần có lượt truy cập thật vào landing page trước.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
