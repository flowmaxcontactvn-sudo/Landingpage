-- ═══════════════════════════════════════════════════════════════
-- TÁCH heatmap_section THEO THIẾT BỊ (chạy sau heatmap.sql + fix_heatmap_admin_rls.sql)
-- Trước đây bản đồ heatmap + xếp hạng section gộp chung mọi thiết bị,
-- nên nút Desktop/Tablet/Mobile ở trang /admin/heatmap không đổi được
-- 2 khối này. Thêm cột thiet_bi để tách riêng, giống heatmap_thiet_bi.
-- LƯU Ý: dữ liệu cũ (trước khi chạy file này) sẽ được gán mặc định
-- là "desktop" — không tách lại được vì gốc không lưu thiết bị.
-- ═══════════════════════════════════════════════════════════════

alter table heatmap_section
  add column thiet_bi text not null default 'desktop'
  check (thiet_bi in ('desktop', 'tablet', 'mobile'));

alter table heatmap_section
  drop constraint if exists heatmap_section_landing_section_key_key;

alter table heatmap_section
  add constraint heatmap_section_landing_section_key_thiet_bi_key
  unique (landing, section_key, thiet_bi);

drop function if exists ghi_nhan_section(text, text, numeric);

create function ghi_nhan_section(p_landing text, p_section_key text, p_thiet_bi text, p_giay numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_section (landing, section_key, thiet_bi, tong_giay, luot_ghi_nhan)
  values (p_landing, p_section_key, p_thiet_bi, greatest(p_giay, 0), 1)
  on conflict (landing, section_key, thiet_bi)
  do update set
    tong_giay = heatmap_section.tong_giay + greatest(excluded.tong_giay, 0),
    luot_ghi_nhan = heatmap_section.luot_ghi_nhan + 1,
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_section(text, text, text, numeric) to anon, authenticated;
