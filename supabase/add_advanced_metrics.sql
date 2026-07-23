-- ═══════════════════════════════════════════════════════════════
-- BỔ SUNG CÁC CỘT ĐO LƯỜNG NÂNG CAO VÀO heatmap_thiet_bi
-- Độ sâu cuộn (25%, 50%, 75%, 100%) và Tỷ lệ bỏ dở Form
-- ═══════════════════════════════════════════════════════════════

alter table heatmap_thiet_bi
  add column if not exists so_phien_cuon_25 integer not null default 0,
  add column if not exists so_phien_cuon_50 integer not null default 0,
  add column if not exists so_phien_cuon_75 integer not null default 0,
  add column if not exists so_phien_cuon_100 integer not null default 0,
  add column if not exists so_phien_bo_form integer not null default 0;

drop function if exists ghi_nhan_phien(text, text, numeric);
drop function if exists ghi_nhan_phien(text, text, numeric, boolean);
drop function if exists ghi_nhan_phien(text, text, numeric, boolean, integer, boolean);

create function ghi_nhan_phien(
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
    landing, thiet_bi, tong_giay_phien, so_phien, so_phien_thoat,
    so_phien_cuon_25, so_phien_cuon_50, so_phien_cuon_75, so_phien_cuon_100,
    so_phien_bo_form
  )
  values (
    p_landing,
    p_thiet_bi,
    greatest(p_giay, 0),
    1,
    case when (p_is_bounce or p_giay < 10) then 1 else 0 end,
    case when p_max_scroll >= 25 then 1 else 0 end,
    case when p_max_scroll >= 50 then 1 else 0 end,
    case when p_max_scroll >= 75 then 1 else 0 end,
    case when p_max_scroll >= 100 then 1 else 0 end,
    case when p_form_abandoned then 1 else 0 end
  )
  on conflict (landing, thiet_bi)
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
