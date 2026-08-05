import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Trả về số liệu (lượt xem/đăng ký) + danh sách lead cụ thể cho 1 affiliate,
// để phmax.vn hiển thị trong trang /affiliate của khách.
export async function GET(req) {
  const secret = req.headers.get("x-affiliate-bridge-secret");
  if (!secret || secret !== process.env.AFFILIATE_BRIDGE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Thiếu code" }, { status: 400 });
  }

  const sb = adminSupabase();

  const { data: campaign } = await sb
    .from("chien_dich")
    .select("id, chi_tiet_chien_dich(luot_truy_cap, luot_dang_ky_thanh_cong)")
    .eq("affiliate_code", code)
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json({ visits: 0, registrations: 0, leads: [] });
  }

  const { data: leads } = await sb
    .from("khach_hang")
    .select("ho_ten, so_dien_thoai, email, thoi_gian")
    .eq("chien_dich_id", campaign.id)
    .order("thoi_gian", { ascending: false });

  const detail = Array.isArray(campaign.chi_tiet_chien_dich) ? campaign.chi_tiet_chien_dich[0] : campaign.chi_tiet_chien_dich;

  return NextResponse.json({
    visits: detail?.luot_truy_cap ?? 0,
    registrations: detail?.luot_dang_ky_thanh_cong ?? 0,
    leads: leads ?? [],
  });
}
