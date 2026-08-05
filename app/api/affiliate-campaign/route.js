import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Được phmax.vn gọi khi 1 affiliate tự tạo link quảng cáo cho landing page
// thuonghieuchuyendoi — tạo (hoặc lấy lại nếu đã có) 1 dòng chien_dich thật
// với slug = mã affiliate, để cơ chế slug/tracking có sẵn của landing page
// tự động hoạt động, không cần sửa gì ở page.js.
export async function POST(req) {
  const secret = req.headers.get("x-affiliate-bridge-secret");
  if (!secret || secret !== process.env.AFFILIATE_BRIDGE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, name } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Thiếu code" }, { status: 400 });
  }

  const sb = adminSupabase();

  const { data: existing } = await sb
    .from("chien_dich")
    .select("id, slug")
    .eq("slug", code)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ slug: existing.slug, url: `https://7ngay.thuonghieuchuyendoi.com/${existing.slug}` });
  }

  const { data: created, error } = await sb
    .from("chien_dich")
    .insert({
      ten_chien_dich: name?.trim() || `Affiliate ${code}`,
      slug: code,
      landing: "/thuonghieuchuyendoi",
      nguon: "affiliate",
      affiliate_code: code,
    })
    .select("slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ slug: created.slug, url: `https://7ngay.thuonghieuchuyendoi.com/${created.slug}` });
}
