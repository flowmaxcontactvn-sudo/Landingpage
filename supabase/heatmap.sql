-- ═══════════════════════════════════════════════════════════════
-- CSDL CHO HEATMAP (chạy sau schema.sql + functions.sql)
-- Khớp đúng dữ liệu trang /admin/heatmap đang cần:
--   1. Điểm chú ý theo từng section (bản đồ heatmap dọc theo trang)
--   2. Số liệu theo thiết bị: lượt di chuyển/chạm, lượt click,
--      thời gian trung bình mỗi phiên
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. THỜI GIAN CHÚ Ý THEO SECTION
--    landing + section_key xác định 1 khối nội dung trên trang
--    (section_key khớp đúng thuộc tính data-section trong page.js,
--    vd 'hero', 'pricing-register'...).
--    Nhãn hiển thị (vd "Hero — Banner mở đầu") KHÔNG lưu ở đây —
--    đó là nội dung giao diện, để trong code frontend, tránh trùng
--    lặp/khó đồng bộ nếu sau này đổi chữ hiển thị.
-- ───────────────────────────────────────────────────────────────
create table heatmap_section (
  id bigint generated always as identity primary key,
  landing text not null,
  section_key text not null,
  tong_giay numeric(10, 1) not null default 0,
  luot_ghi_nhan integer not null default 0,
  cap_nhat_luc timestamptz not null default now(),
  unique (landing, section_key)
);

-- ───────────────────────────────────────────────────────────────
-- 2. HOẠT ĐỘNG THEO THIẾT BỊ (desktop / tablet / mobile)
--    trung_binh_giay_phien: cột tự tính (không lưu tay) từ
--    tong_giay_phien / so_phien — giống cách làm ty_le_chuyen_doi.
-- ───────────────────────────────────────────────────────────────
create table heatmap_thiet_bi (
  id bigint generated always as identity primary key,
  landing text not null,
  thiet_bi text not null check (thiet_bi in ('desktop', 'tablet', 'mobile')),
  luot_di_chuyen bigint not null default 0,
  luot_click bigint not null default 0,
  tong_giay_phien numeric(12, 1) not null default 0,
  so_phien integer not null default 0,
  trung_binh_giay_phien numeric(10, 1) generated always as (
    case when so_phien = 0 then 0 else round(tong_giay_phien / so_phien, 1) end
  ) stored,
  cap_nhat_luc timestamptz not null default now(),
  unique (landing, thiet_bi)
);

alter table heatmap_section enable row level security;
alter table heatmap_thiet_bi enable row level security;

-- Chỉ admin đọc được số liệu — không cho anon đọc trực tiếp 2 bảng này,
-- ghi dữ liệu chỉ được phép qua 2 hàm RPC bên dưới (không insert/update thẳng).
create policy "Admin xem điểm chú ý section"
  on heatmap_section for select
  to authenticated
  using (true);

create policy "Admin xem hoạt động thiết bị"
  on heatmap_thiet_bi for select
  to authenticated
  using (true);

-- ═══════════════════════════════════════════════════════════════
-- HÀM GHI NHẬN (gọi từ landing page — anon key, quyền nâng bên trong)
-- ═══════════════════════════════════════════════════════════════

-- Gọi định kỳ khi 1 section được xem đủ lâu trên màn hình,
-- cộng dồn số giây vào đúng landing + section đó (tự tạo dòng nếu chưa có).
create function ghi_nhan_section(p_landing text, p_section_key text, p_giay numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_section (landing, section_key, tong_giay, luot_ghi_nhan)
  values (p_landing, p_section_key, greatest(p_giay, 0), 1)
  on conflict (landing, section_key)
  do update set
    tong_giay = heatmap_section.tong_giay + greatest(excluded.tong_giay, 0),
    luot_ghi_nhan = heatmap_section.luot_ghi_nhan + 1,
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_section(text, text, numeric) to anon, authenticated;

-- Gọi định kỳ (vd mỗi 15s) để cộng dồn lượt di chuyển/chạm và lượt click
-- theo thiết bị — KHÔNG đụng tới thời gian phiên (xem hàm dưới).
create function ghi_nhan_di_chuyen(p_landing text, p_thiet_bi text, p_di_chuyen integer, p_click integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_thiet_bi (landing, thiet_bi, luot_di_chuyen, luot_click)
  values (p_landing, p_thiet_bi, greatest(p_di_chuyen, 0), greatest(p_click, 0))
  on conflict (landing, thiet_bi)
  do update set
    luot_di_chuyen = heatmap_thiet_bi.luot_di_chuyen + greatest(excluded.luot_di_chuyen, 0),
    luot_click = heatmap_thiet_bi.luot_click + greatest(excluded.luot_click, 0),
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_di_chuyen(text, text, integer, integer) to anon, authenticated;

-- Gọi ĐÚNG 1 LẦN khi kết thúc 1 phiên xem trang (vd lúc rời trang) —
-- tách riêng khỏi hàm di chuyển ở trên để không đếm trùng số phiên.
create function ghi_nhan_phien(p_landing text, p_thiet_bi text, p_giay numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_thiet_bi (landing, thiet_bi, tong_giay_phien, so_phien)
  values (p_landing, p_thiet_bi, greatest(p_giay, 0), 1)
  on conflict (landing, thiet_bi)
  do update set
    tong_giay_phien = heatmap_thiet_bi.tong_giay_phien + greatest(excluded.tong_giay_phien, 0),
    so_phien = heatmap_thiet_bi.so_phien + 1,
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_phien(text, text, numeric) to anon, authenticated;
