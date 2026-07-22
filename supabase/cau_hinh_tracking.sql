-- ═══════════════════════════════════════════════════════════════
-- CẤU HÌNH PIXEL TRACKING (chạy sau schema.sql)
-- Mỗi dòng là 1 mã tracking (Facebook Pixel, TikTok Pixel, Google
-- Tag, YouTube Ads, Conversion Label), gắn theo landing. Cho phép
-- nhiều dòng cùng loại (vd 2 Facebook Pixel ID) — xoá độc lập từng dòng.
-- ═══════════════════════════════════════════════════════════════

create table cau_hinh_tracking (
  id bigint generated always as identity primary key,
  landing text not null,
  loai_ma text not null check (
    loai_ma in ('facebook_pixel', 'tiktok_pixel', 'google_tag', 'youtube_ads', 'conversion_label')
  ),
  ma text not null,
  ngay_them timestamptz not null default now()
);

create index idx_cau_hinh_tracking_landing on cau_hinh_tracking (landing);

alter table cau_hinh_tracking enable row level security;

-- Landing page (anon) cần đọc để tự khởi tạo pixel — mã tracking
-- vốn đã lộ công khai qua network request của trình duyệt bất kỳ ai,
-- không phải dữ liệu nhạy cảm.
create policy "Ai cũng đọc được mã tracking"
  on cau_hinh_tracking for select
  to anon, authenticated
  using (true);

-- Chỉ admin (đã đăng nhập) mới được thêm/xoá.
create policy "Chỉ admin thêm xoá mã tracking"
  on cau_hinh_tracking for all
  to authenticated
  using (true)
  with check (true);
