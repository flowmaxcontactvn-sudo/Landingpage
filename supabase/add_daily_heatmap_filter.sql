-- ═══════════════════════════════════════════════════════════════
-- CHUYỂN ĐỔI BẢNG HEATMAP SANG THEO DÕI HÀNG NGÀY (DAILY STATS)
-- Phục vụ bộ lọc chọn thời gian trên trang Quản trị Heatmap
-- ═══════════════════════════════════════════════════════════════

-- 1. Cập nhật bảng heatmap_section
alter table heatmap_section add column if not exists ngay date not null default current_date;
alter table heatmap_section drop constraint if exists heatmap_section_landing_section_key_thiet_bi_key;
alter table heatmap_section drop constraint if exists heatmap_section_landing_section_key_thiet_bi_ngay_key;
alter table heatmap_section add constraint heatmap_section_landing_section_key_thiet_bi_ngay_key unique (landing, section_key, thiet_bi, ngay);

-- 2. Cập nhật bảng heatmap_thiet_bi
alter table heatmap_thiet_bi add column if not exists ngay date not null default current_date;
alter table heatmap_thiet_bi drop constraint if exists heatmap_thiet_bi_landing_thiet_bi_key;
alter table heatmap_thiet_bi drop constraint if exists heatmap_thiet_bi_landing_thiet_bi_ngay_key;
alter table heatmap_thiet_bi add constraint heatmap_thiet_bi_landing_thiet_bi_ngay_key unique (landing, thiet_bi, ngay);

-- 3. Cập nhật hàm ghi nhận Section theo ngày
create or replace function ghi_nhan_section(p_landing text, p_section_key text, p_thiet_bi text, p_giay numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_section (landing, section_key, thiet_bi, ngay, tong_giay, luot_ghi_nhan)
  values (p_landing, p_section_key, p_thiet_bi, current_date, greatest(p_giay, 0), 1)
  on conflict (landing, section_key, thiet_bi, ngay)
  do update set
    tong_giay = heatmap_section.tong_giay + greatest(excluded.tong_giay, 0),
    luot_ghi_nhan = heatmap_section.luot_ghi_nhan + 1,
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_section(text, text, text, numeric) to anon, authenticated;

-- 4. Cập nhật hàm ghi nhận di chuyển/click theo ngày
create or replace function ghi_nhan_di_chuyen(p_landing text, p_thiet_bi text, p_di_chuyen integer, p_click integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_thiet_bi (landing, thiet_bi, ngay, luot_di_chuyen, luot_click)
  values (p_landing, p_thiet_bi, current_date, greatest(p_di_chuyen, 0), greatest(p_click, 0))
  on conflict (landing, thiet_bi, ngay)
  do update set
    luot_di_chuyen = heatmap_thiet_bi.luot_di_chuyen + greatest(excluded.luot_di_chuyen, 0),
    luot_click = heatmap_thiet_bi.luot_click + greatest(excluded.luot_click, 0),
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_di_chuyen(text, text, integer, integer) to anon, authenticated;

-- 5. Cập nhật hàm ghi nhận phiên xem trang theo ngày
create or replace function ghi_nhan_phien(
  p_landing text,
  p_thiet_bi text,
  p_giay numeric,
  p_is_bounce boolean default false,
  p_max_scroll integer default 0,
  p_form_abandoned boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_thiet_bi (
    landing, thiet_bi, ngay, tong_giay_phien, so_phien, so_phien_thoat,
    so_phien_cuon_25, so_phien_cuon_50, so_phien_cuon_75, so_phien_cuon_100,
    so_phien_bo_form
  )
  values (
    p_landing,
    p_thiet_bi,
    current_date,
    greatest(p_giay, 0),
    1,
    case when (p_is_bounce or p_giay < 10) then 1 else 0 end,
    case when p_max_scroll >= 25 then 1 else 0 end,
    case when p_max_scroll >= 50 then 1 else 0 end,
    case when p_max_scroll >= 75 then 1 else 0 end,
    case when p_max_scroll >= 100 then 1 else 0 end,
    case when p_form_abandoned then 1 else 0 end
  )
  on conflict (landing, thiet_bi, ngay)
  do update set
    tong_giay_phien = heatmap_thiet_bi.tong_giay_phien + greatest(excluded.tong_giay_phien, 0),
    so_phien = heatmap_thiet_bi.so_phien + 1,
    so_phien_thoat = heatmap_thiet_bi.so_phien_thoat + excluded.so_phien_thoat,
    so_phien_cuon_25 = heatmap_thiet_bi.so_phien_cuon_25 + excluded.so_phien_cuon_25,
    so_phien_cuon_50 = heatmap_thiet_bi.so_phien_cuon_50 + excluded.so_phien_cuon_50,
    so_phien_cuon_75 = heatmap_thiet_bi.so_phien_cuon_75 + excluded.so_phien_cuon_75,
    so_phien_cuon_100 = heatmap_thiet_bi.so_phien_cuon_100 + excluded.so_phien_cuon_100,
    so_phien_bo_form = heatmap_thiet_bi.so_phien_bo_form + excluded.so_phien_bo_form,
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_phien(text, text, numeric, boolean, integer, boolean) to anon, authenticated;
