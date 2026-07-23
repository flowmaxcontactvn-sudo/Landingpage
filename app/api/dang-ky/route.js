import { NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // KHÔNG dùng .select().single() sau insert: client ở đây chạy bằng anon key
  // (không có phiên đăng nhập), mà RLS chỉ cho anon INSERT chứ không cho SELECT
  // trên khach_hang — yêu cầu trả lại dòng vừa thêm khiến PostgREST rollback
  // luôn cả insert (lỗi RLS dù chính sách insert vẫn đúng). Vì vậy không lấy
  // được id vừa tạo ở đây; muốn có id cho phía phmax.vn cần client service-role
  // riêng ở server (bỏ qua RLS) thay vì client anon dùng chung với landing page.
  const { error } = await supabase.from("khach_hang").insert({
    ho_ten: fullname.trim(),
    so_dien_thoai: phone.trim(),
    email: email?.trim() || null,
    nguon,
    chien_dich_id: chienDichId,
    ghi_chu: ghiChu?.trim() || null,
    landing: "/thuonghieuchuyendoi",
    thiet_bi: thietBi,
    thoi_gian_phien_giay: thoiGianPhienGiay,
  });

  if (error) {
    console.warn("Lưu khách hàng thất bại:", error.message);
    return NextResponse.json({ ok: false, error: error.message });
  }

  // Đồng bộ sang phmax.vn để xử lý CRM ở đó — best-effort, không được làm chậm/gãy
  // phản hồi cho khách nếu phmax.vn đang lỗi/sập.
  const phmaxUrl = process.env.PHMAX_API_URL;
  const secret = process.env.LANDING_SYNC_SECRET;
  if (phmaxUrl && secret) {
    after(() =>
      fetch(`${phmaxUrl}/api/landing-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-landing-secret": secret },
        body: JSON.stringify({
          source_site: "thuonghieuchuyendoi",
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
