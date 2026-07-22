"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Tabs from "../_components/Tabs";
import BarList from "../_components/BarList";
import Modal from "../_components/Modal";
import { SourceBadge } from "../_components/Badge";
import { useActiveLanding } from "../_lib/LandingContext";
import { landingPages, sourceLabels, slugify, formatNumber } from "../_lib/mockData";

const TABS = [
  { key: "list", label: "Tạo chiến dịch" },
  { key: "details", label: "Chi tiết chiến dịch" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function CampaignsPage() {
  const { landing } = useActiveLanding();
  const landingInfo = landingPages.find((l) => l.path === landing);

  const [tab, setTab] = useState("list");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [source, setSource] = useState(Object.keys(sourceLabels)[0]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const slug = slugify(name || "");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chien_dich")
      .select("id, ten_chien_dich, slug, landing, nguon, ngay_tao, chi_tiet_chien_dich(luot_truy_cap, luot_dang_ky_thanh_cong, ty_le_chuyen_doi)")
      .eq("landing", landing)
      .order("ngay_tao", { ascending: false });

    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError("");
      setCampaigns(data || []);
    }
    setLoading(false);
  }, [landing]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setFormError("");

    const { error } = await supabase.from("chien_dich").insert({
      ten_chien_dich: name.trim(),
      slug: slug || `chien-dich-${Date.now()}`,
      landing,
      nguon: source,
    });

    setSaving(false);
    if (error) {
      setFormError(error.code === "23505" ? "Đường dẫn chiến dịch này đã tồn tại, đổi tên khác." : error.message);
      return;
    }

    setName("");
    setCreateOpen(false);
    loadCampaigns();
  };

  const handleCopyLink = async (campaign) => {
    const link = `https://${landingInfo?.domain}/${campaign.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(campaign.id);
      setTimeout(() => setCopiedId((id) => (id === campaign.id ? null : id)), 1500);
    } catch (err) {
      console.warn("Không sao chép được:", err);
    }
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Xoá chiến dịch "${campaign.ten_chien_dich}"? Không thể hoàn tác.`)) return;
    const { error } = await supabase.from("chien_dich").delete().eq("id", campaign.id);
    if (!error) loadCampaigns();
  };

  const detailRanking = useMemo(
    () =>
      [...campaigns]
        .sort((a, b) => (b.chi_tiet_chien_dich?.luot_truy_cap || 0) - (a.chi_tiet_chien_dich?.luot_truy_cap || 0))
        .map((c) => ({ key: c.id, label: c.ten_chien_dich, score: c.chi_tiet_chien_dich?.luot_truy_cap || 0 })),
    [campaigns]
  );

  const registeredRanking = useMemo(
    () =>
      [...campaigns]
        .sort((a, b) => (b.chi_tiet_chien_dich?.luot_dang_ky_thanh_cong || 0) - (a.chi_tiet_chien_dich?.luot_dang_ky_thanh_cong || 0))
        .map((c) => ({ key: c.id, label: c.ten_chien_dich, score: c.chi_tiet_chien_dich?.luot_dang_ky_thanh_cong || 0 })),
    [campaigns]
  );

  const conversionRanking = useMemo(
    () =>
      [...campaigns]
        .filter((c) => (c.chi_tiet_chien_dich?.luot_truy_cap || 0) > 0)
        .sort((a, b) => (b.chi_tiet_chien_dich?.ty_le_chuyen_doi || 0) - (a.chi_tiet_chien_dich?.ty_le_chuyen_doi || 0))
        .map((c) => ({ key: c.id, label: c.ten_chien_dich, score: Number(c.chi_tiet_chien_dich?.ty_le_chuyen_doi || 0) })),
    [campaigns]
  );

  return (
    <div className="space-y-5">
      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
            >
              + Tạo chiến dịch mới
            </button>
          </div>

          <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo chiến dịch mới">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="rounded-lg bg-[#f9f9f7] border border-black/10 px-3.5 py-2.5">
                <p className="text-[11px] font-semibold text-[#898781] uppercase tracking-wide">Landing page</p>
                <p className="text-[13px] text-[#0b0b0b] mt-1">{landingInfo?.name} — {landingInfo?.domain}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0b0b] mb-1.5">Tên chiến dịch</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Tháng 8 khuyến mãi"
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] placeholder:text-[#898781] outline-none focus:border-[#e25010]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0b0b] mb-1.5">Chọn nguồn</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 px-3 text-sm text-[#0b0b0b] outline-none focus:border-[#e25010]"
                >
                  {Object.keys(sourceLabels).map((key) => (
                    <option key={key} value={key}>
                      {sourceLabels[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg bg-[#f9f9f7] border border-black/10 px-3.5 py-2.5">
                <p className="text-[11px] font-semibold text-[#898781] uppercase tracking-wide">Đường dẫn chiến dịch</p>
                <p className="text-[13px] text-[#0b0b0b] mt-1 tabular-nums break-all">
                  {landingInfo?.domain}/{slug || "ten-chien-dich"}
                </p>
              </div>

              {formError && <p className="text-xs text-[#d03b3b]">{formError}</p>}

              <button
                type="submit"
                disabled={!name.trim() || saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {saving ? "Đang tạo..." : "Tạo chiến dịch"}
              </button>
            </form>
          </Modal>

          <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10">
              <p className="text-sm font-semibold text-[#0b0b0b]">Danh sách chiến dịch</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 bg-[#f9f9f7]">
                    <th className="text-left font-semibold text-[#52514e] px-4 py-3">Chiến dịch</th>
                    <th className="text-left font-semibold text-[#52514e] px-4 py-3">Slug</th>
                    <th className="text-left font-semibold text-[#52514e] px-4 py-3">Nguồn</th>
                    <th className="text-left font-semibold text-[#52514e] px-4 py-3">Ngày tạo</th>
                    <th className="text-right font-semibold text-[#52514e] px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#898781]">Đang tải dữ liệu...</td>
                    </tr>
                  )}
                  {!loading && loadError && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#d03b3b]">Không tải được dữ liệu: {loadError}</td>
                    </tr>
                  )}
                  {!loading && !loadError && campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f9f9f7]">
                      <td className="px-4 py-3 font-medium text-[#0b0b0b] whitespace-nowrap">{c.ten_chien_dich}</td>
                      <td className="px-4 py-3 text-[#898781] whitespace-nowrap">/{c.slug}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <SourceBadge source={sourceLabels[c.nguon]?.label ?? c.nguon} color={sourceLabels[c.nguon]?.color} />
                      </td>
                      <td className="px-4 py-3 text-[#898781] whitespace-nowrap tabular-nums">{formatDate(c.ngay_tao)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button onClick={() => handleCopyLink(c)} className="text-xs font-medium text-[#52514e] hover:text-[#0b0b0b] mr-4">
                          {copiedId === c.id ? "Đã sao chép!" : "Sao chép link"}
                        </button>
                        <button onClick={() => handleDelete(c)} className="text-xs font-medium text-[#d03b3b] hover:text-[#a12e2e]">
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && !loadError && campaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#898781]">Chưa có chiến dịch nào cho landing này.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "details" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Theo lượt truy cập</p>
              {detailRanking.length > 0 ? (
                <BarList items={detailRanking} />
              ) : (
                <p className="text-sm text-[#898781]">Chưa có dữ liệu.</p>
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Theo lượt đăng ký thành công</p>
              {registeredRanking.length > 0 ? (
                <BarList items={registeredRanking} />
              ) : (
                <p className="text-sm text-[#898781]">Chưa có dữ liệu.</p>
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b0b0b] mb-4">Theo tỷ lệ chuyển đổi</p>
              {conversionRanking.length > 0 ? (
                <BarList items={conversionRanking} suffix="%" />
              ) : (
                <p className="text-sm text-[#898781]">Chưa có lượt truy cập nào để tính tỷ lệ.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 bg-[#f9f9f7]">
                    <th className="text-left font-semibold text-[#52514e] px-4 py-3">Chiến dịch</th>
                    <th className="text-left font-semibold text-[#52514e] px-4 py-3">Slug</th>
                    <th className="text-right font-semibold text-[#52514e] px-4 py-3">Lượt truy cập</th>
                    <th className="text-right font-semibold text-[#52514e] px-4 py-3">Đăng ký thành công</th>
                    <th className="text-right font-semibold text-[#52514e] px-4 py-3">Tỷ lệ chuyển đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {!loading && !loadError && campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f9f9f7]">
                      <td className="px-4 py-3 font-medium text-[#0b0b0b] whitespace-nowrap">{c.ten_chien_dich}</td>
                      <td className="px-4 py-3 text-[#898781] whitespace-nowrap">/{c.slug}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#0b0b0b] whitespace-nowrap">
                        {formatNumber(c.chi_tiet_chien_dich?.luot_truy_cap || 0)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#0b0b0b] whitespace-nowrap">
                        {formatNumber(c.chi_tiet_chien_dich?.luot_dang_ky_thanh_cong || 0)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#0b0b0b] whitespace-nowrap">
                        {c.chi_tiet_chien_dich?.ty_le_chuyen_doi ?? 0}%
                      </td>
                    </tr>
                  ))}
                  {!loading && !loadError && campaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#898781]">Chưa có chiến dịch nào cho landing này.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
