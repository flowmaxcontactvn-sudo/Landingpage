import { NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req) {
  const body = await req.json();
  const { fullname, phone, email, nguon, utmCampaign, ghiChu, thietBi, thoiGianPhienGiay, maSoThue } = body;

  if (!fullname || !phone) {
    return NextResponse.json({ ok: false, error: "Thiếu họ tên/số điện thoại" }, { status: 400 });
  }

  let chienDichId = null;
  if (utmCampaign) {
    const { data } = await supabase.rpc("chien_dich_id_theo_slug", { p_slug: utmCampaign });
    chienDichId = data ?? null;
  }

  const finalGhiChu = [
    ghiChu?.trim() || "",
    maSoThue?.trim() ? `MST: ${maSoThue.trim()}` : ""
  ].filter(Boolean).join(" | ") || null;

  // Dùng service-role client (không phải anon) để insert kèm .select('id')
  // lấy lại được id vừa tạo — cần id này (external_id) để đồng bộ sang
  // phmax.vn cho đúng, tránh bị RLS chặn RETURNING như client anon.
  const { data: newLead, error } = await adminSupabase()
    .from("khach_hang")
    .insert({
      ho_ten: fullname.trim(),
      so_dien_thoai: phone.trim(),
      email: email?.trim() || null,
      nguon,
      chien_dich_id: chienDichId,
      ghi_chu: finalGhiChu,
      landing: "/thuonghieuchuyendoi",
      thiet_bi: thietBi,
      thoi_gian_phien_giay: thoiGianPhienGiay,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("Lưu khách hàng thất bại:", error.message);
    return NextResponse.json({ ok: false, error: error.message });
  }

  const phmaxUrl = process.env.PHMAX_API_URL;
  const secret = process.env.LANDING_SYNC_SECRET;
  if (phmaxUrl && secret) {
    after(() =>
      fetch(`${phmaxUrl}/api/landing-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-landing-secret": secret },
        body: JSON.stringify({
          source_site: "thuonghieuchuyendoi",
          external_id: newLead.id,
          name: fullname.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          source: nguon ?? null,
          campaign_slug: utmCampaign ?? null,
          note: finalGhiChu,
        }),
      }).catch((err) => console.warn("[PHMAX_SYNC_ERROR]", err))
    );
  }

  return NextResponse.json({ ok: true });
}
