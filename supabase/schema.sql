-- ═══════════════════════════════════════════════════════════════
-- SCHEMA CSDL — Flowmax Landing Pages / Admin
-- Chạy 1 lần trong Supabase SQL Editor (project mới).
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────────
-- 1. TÀI KHOẢN (admin đăng nhập trang quản trị)
--    Không tự lưu mật khẩu — gắn vào auth.users của Supabase Auth
--    (Supabase Auth đã lo việc hash mật khẩu, reset mật khẩu, v.v.
--    Tự làm lại phần đó dễ sai và mất an toàn).
--    Bảng này chỉ lưu thông tin hồ sơ + vai trò của tài khoản đó.
-- ───────────────────────────────────────────────────────────────
create table tai_khoan (
  id uuid primary key references auth.users (id) on delete cascade,
  ho_ten text not null,
  vai_tro text not null default 'admin' check (vai_tro in ('admin', 'nhan_vien')),
  created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────────
-- 2. CHIẾN DỊCH
--    landing: đường dẫn landing page được chọn, vd '/thuonghieuchuyendoi'
--    slug: định danh URL của chiến dịch (vd 'thang8-khuyenmai'),
--          dùng để tạo link đầy đủ domain/slug — bắt buộc phải có
--          để chiến dịch thực sự tạo ra được 1 đường link riêng.
-- ───────────────────────────────────────────────────────────────
create table chien_dich (
  id bigint generated always as identity primary key,
  ten_chien_dich text not null,
  slug text not null unique,
  landing text not null,
  nguon text not null,
  ngay_tao timestamptz not null default now()
);

create index idx_chien_dich_slug on chien_dich (slug);

-- ───────────────────────────────────────────────────────────────
-- 3. CHI TIẾT CHIẾN DỊCH (số liệu, tách riêng khỏi bảng định nghĩa
--    ở trên để sau này có thể cập nhật số liệu liên tục mà không
--    đụng tới thông tin gốc của chiến dịch)
--    Quan hệ 1-1 với chien_dich: chien_dich_id vừa là khoá chính
--    vừa là khoá ngoại.
--    ty_le_chuyen_doi: KHÔNG lưu tay — để Postgres tự tính từ 2 cột
--    kia (generated column), tránh trường hợp số liệu bị lệch nhau.
-- ───────────────────────────────────────────────────────────────
create table chi_tiet_chien_dich (
  chien_dich_id bigint primary key references chien_dich (id) on delete cascade,
  luot_truy_cap integer not null default 0,
  luot_dang_ky_thanh_cong integer not null default 0,
  ty_le_chuyen_doi numeric(6, 2) generated always as (
    case
      when luot_truy_cap = 0 then 0
      else round((luot_dang_ky_thanh_cong::numeric / luot_truy_cap) * 100, 2)
    end
  ) stored,
  cap_nhat_luc timestamptz not null default now()
);

-- Tự tạo dòng chi_tiet_chien_dich (số liệu = 0) mỗi khi có chiến dịch mới,
-- để admin không phải tạo tay 2 lần cho 1 chiến dịch.
create function tao_chi_tiet_chien_dich() returns trigger as $$
begin
  insert into chi_tiet_chien_dich (chien_dich_id) values (new.id);
  return new;
end;
$$ language plpgsql;

create trigger trg_tao_chi_tiet_chien_dich
  after insert on chien_dich
  for each row execute function tao_chi_tiet_chien_dich();

-- Tự cập nhật cap_nhat_luc mỗi khi số liệu thay đổi.
create function cap_nhat_thoi_gian() returns trigger as $$
begin
  new.cap_nhat_luc = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_cap_nhat_chi_tiet_chien_dich
  before update on chi_tiet_chien_dich
  for each row execute function cap_nhat_thoi_gian();

-- ───────────────────────────────────────────────────────────────
-- 4. KHÁCH HÀNG (người đăng ký qua landing page)
--    Đổi tên "user" → "khach_hang": USER là từ khoá dành riêng của
--    Postgres, đặt tên bảng là user sẽ phải escape ở mọi câu lệnh
--    sau này — đổi tên cho đỡ phiền, ý nghĩa vẫn vậy.
--    chien_dich_id: cho phép NULL vì khách vào "Trực tiếp" (không
--    qua chiến dịch nào) vẫn hợp lệ.
--    on delete set null: xoá chiến dịch không được xoá luôn lịch sử
--    khách hàng đã đăng ký qua chiến dịch đó.
-- ───────────────────────────────────────────────────────────────
create table khach_hang (
  id bigint generated always as identity primary key,
  ho_ten text not null,
  so_dien_thoai text not null,
  email text,
  nguon text,
  chien_dich_id bigint references chien_dich (id) on delete set null,
  thoi_gian timestamptz not null default now(),
  ghi_chu text
);

create index idx_khach_hang_chien_dich on khach_hang (chien_dich_id);
create index idx_khach_hang_thoi_gian on khach_hang (thoi_gian desc);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Bắt buộc phải bật — nếu không, ai cầm anon key (lộ công khai
-- trong code frontend) cũng đọc/sửa/xoá được toàn bộ dữ liệu,
-- kể cả số điện thoại khách hàng.
-- ═══════════════════════════════════════════════════════════════
alter table tai_khoan enable row level security;
alter table chien_dich enable row level security;
alter table chi_tiet_chien_dich enable row level security;
alter table khach_hang enable row level security;

-- tai_khoan: mỗi người chỉ xem được hồ sơ của chính mình
create policy "Xem hồ sơ của chính mình"
  on tai_khoan for select
  using (auth.uid() = id);

-- chien_dich / chi_tiet_chien_dich: chỉ tài khoản đã đăng nhập (admin) mới xem/sửa
create policy "Admin toàn quyền chiến dịch"
  on chien_dich for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin toàn quyền chi tiết chiến dịch"
  on chi_tiet_chien_dich for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- khach_hang: ai cũng được TẠO mới (form đăng ký công khai trên landing page),
-- nhưng chỉ admin mới được XEM/SỬA/XOÁ (bảo vệ số điện thoại khách hàng)
create policy "Bất kỳ ai cũng đăng ký được"
  on khach_hang for insert
  with check (true);

create policy "Chỉ admin xem được danh sách khách hàng"
  on khach_hang for select
  using (auth.role() = 'authenticated');

create policy "Chỉ admin sửa/xoá khách hàng"
  on khach_hang for update
  using (auth.role() = 'authenticated');

create policy "Chỉ admin xoá khách hàng"
  on khach_hang for delete
  using (auth.role() = 'authenticated');
