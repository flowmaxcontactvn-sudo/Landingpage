-- ═══════════════════════════════════════════════════════════════
-- CẤU HÌNH LANDING (chạy sau schema.sql)
-- Trước mắt chỉ có link Zalo (dùng tạo mã QR khi khách đăng ký
-- thành công) — admin chỉnh trong Cài đặt, landing page tự đọc.
-- landing là khoá chính vì mỗi landing chỉ có đúng 1 cấu hình.
-- ═══════════════════════════════════════════════════════════════

create table cau_hinh_landing (
  landing text primary key,
  zalo_link text not null default 'https://zalo.me/0989975498',
  cap_nhat_luc timestamptz not null default now()
);

alter table cau_hinh_landing enable row level security;

-- Link Zalo vốn đã hiển thị công khai cho khách trên landing page,
-- nên cho anon đọc thẳng — không phải dữ liệu nhạy cảm.
create policy "Ai cũng đọc được cấu hình landing"
  on cau_hinh_landing for select
  to anon, authenticated
  using (true);

-- Chỉ admin (đã đăng nhập) mới được tạo/sửa.
create policy "Chỉ admin sửa cấu hình landing"
  on cau_hinh_landing for all
  to authenticated
  using (true)
  with check (true);

-- Dùng lại hàm cap_nhat_thoi_gian() đã tạo ở schema.sql
create trigger trg_cap_nhat_cau_hinh_landing
  before update on cau_hinh_landing
  for each row execute function cap_nhat_thoi_gian();

-- Khởi tạo sẵn cho landing đang hoạt động, để landing page có ngay dữ liệu đọc.
insert into cau_hinh_landing (landing, zalo_link)
values ('/thuonghieuchuyendoi', 'https://zalo.me/0989975498');
