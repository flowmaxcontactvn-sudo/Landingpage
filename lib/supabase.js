import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = typeof rawUrl === "string" && rawUrl.trim() ? rawUrl.trim() : "https://placeholder.supabase.co";
const supabaseAnonKey = typeof rawKey === "string" && rawKey.trim() ? rawKey.trim() : "placeholder-key";

// Nếu tab bị treo/máy ngủ lâu, access token có thể hết hạn trước khi
// timer tự làm mới của supabase-js kịp chạy — request tiếp theo sẽ bị
// PostgREST trả lỗi "JWT expired". Bắt đúng lỗi này, chủ động làm mới
// phiên rồi gửi lại request 1 lần, để các trang không cần tự xử lý.
const fetchWithAuthRetry = async (input, init = {}) => {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const body = await response.clone().text().catch(() => "");
  if (!body.includes("JWT expired")) return response;

  const { data } = await supabase.auth.refreshSession();
  const token = data.session?.access_token;
  if (!token) return response;

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithAuthRetry },
});
