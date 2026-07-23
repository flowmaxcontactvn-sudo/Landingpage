-- ═══════════════════════════════════════════════════════════════
-- THÊM CỘT SỐ PHIÊN THOÁT VÀO heatmap_thiet_bi
-- Phục vụ ô "Tỷ lệ thoát trang" ở trang Heatmap (/admin/heatmap)
-- ═══════════════════════════════════════════════════════════════

alter table heatmap_thiet_bi
  add column if not exists so_phien_thoat integer not null default 0;

drop function if exists ghi_nhan_phien(text, text, numeric);
drop function if exists ghi_nhan_phien(text, text, numeric, boolean);

create function ghi_nhan_phien(
  p_landing text,
  p_thiet_bi text,
  p_giay numeric,
  p_is_bounce boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into heatmap_thiet_bi (landing, thiet_bi, tong_giay_phien, so_phien, so_phien_thoat)
  values (
    p_landing,
    p_thiet_bi,
    greatest(p_giay, 0),
    1,
    case when (p_is_bounce or p_giay < 10) then 1 else 0 end
  )
  on conflict (landing, thiet_bi)
  do update set
    tong_giay_phien = heatmap_thiet_bi.tong_giay_phien + greatest(excluded.tong_giay_phien, 0),
    so_phien = heatmap_thiet_bi.so_phien + 1,
    so_phien_thoat = heatmap_thiet_bi.so_phien_thoat + case when (p_is_bounce or excluded.tong_giay_phien < 10) then 1 else 0 end,
    cap_nhat_luc = now();
end;
$$;

grant execute on function ghi_nhan_phien(text, text, numeric, boolean) to anon, authenticated;
