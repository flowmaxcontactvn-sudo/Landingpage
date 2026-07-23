import { NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Client quyền nâng — chỉ dùng ở server, KHÔNG lộ ra browser. Cần dùng cái
// này thay vì client anon (dùng chung với landing page) vì RLS chỉ cho anon
// INSERT vào khach_hang chứ không cho SELECT lại — insert().select() bằng
// anon key sẽ báo lỗi RLS dù chính sách insert vẫn đúng. Dùng service role
// để insert xong lấy lại được id, phục vụ đồng bộ external_id sang phmax.vn.
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req) {
  const body = await req.json();
  const { fullname, phone, email, nguon, utmCampaign, ghiChu, thietBi, thoiGianPhienGiay } = body;

  if (!fullname || !phone) {
    return NextResponse.json({ ok: false, error: "Thiếu họ tên/số điện thoại" }, { status: 400 });
  }

  let chienDichId = null;
  if (utmCampaign) {
    const { data } = await supabase.rpc("chien_dich_id_theo_slug", { p_slug: utmCampaign });
    chienDichId = data ?? null;
  }

  const { data: inserted, error } = await adminSupabase()
    .from("khach_hang")
    .insert({
      ho_ten: fullname.trim(),
      so_dien_thoai: phone.trim(),
      email: email?.trim() || null,
      nguon,
      chien_dich_id: chienDichId,
      ghi_chu: ghiChu?.trim() || null,
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

  // Đồng bộ sang phmax.vn để xử lý CRM ở đó — best-effort, không được làm chậm/gãy
  // phản hồi cho khách nếu phmax.vn đang lỗi/sập.
  const phmaxUrl = process.env.PHMAX_API_URL;
  const secret = process.env.LANDING_SYNC_SECRET;
  if (phmaxUrl && secret && inserted?.id) {
    after(() =>
      fetch(`${phmaxUrl}/api/landing-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-landing-secret": secret },
        body: JSON.stringify({
          source_site: "thuonghieuchuyendoi",
          external_id: inserted.id,
          name: fullname.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          source: nguon ?? null,
          campaign_slug: utmCampaign ?? null,
          note: ghiChu?.trim() || null,
        }),
      }).catch(err => console.warn("[PHMAX_SYNC_ERROR]", err))
    );
  }

  return NextResponse.json({ ok: true });
}
