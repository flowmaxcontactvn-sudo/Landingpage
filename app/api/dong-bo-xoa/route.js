import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }

  try {
    const res = await fetch("https://www.phmax.vn/api/landing-leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-landing-secret": process.env.LANDING_SYNC_SECRET },
      body: JSON.stringify({ external_id: id }),
    });
  } catch (err) {
    console.error("[PHMAX_DELETE_SYNC_ERROR]", err);
  }

  return NextResponse.json({ success: true });
}
