-- ═══════════════════════════════════════════════════════════════
-- HÀM XỬ LÝ CHO TRANG LANDING PAGE (chạy sau schema.sql)
-- Landing page dùng anon key — không có quyền đọc trực tiếp
-- chien_dich / chi_tiet_chien_dich (RLS chỉ cho admin đọc).
-- Các hàm dưới đây chạy với quyền nâng (security definer) để làm
-- đúng 2 việc: tra id chiến dịch theo slug, và tăng bộ đếm —
-- không trả về số liệu nội bộ nào khác.
-- ═══════════════════════════════════════════════════════════════

-- Tra chien_dich_id từ slug trong URL (vd 7ngay.thuonghieuchuyendoi.com/thang8-uudai
-- → slug "thang8-uudai"). Trả về NULL nếu không khớp — khách "Trực tiếp"
-- không qua chiến dịch nào vẫn đăng ký được bình thường.
create function chien_dich_id_theo_slug(p_slug text)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select id from chien_dich where slug = p_slug limit 1;
$$;

grant execute on function chien_dich_id_theo_slug(text) to anon, authenticated;

-- Tăng lượt truy cập cho 1 chiến dịch. Gọi mỗi khi có người vào landing page
-- kèm slug chiến dịch. Không làm gì nếu slug không khớp chiến dịch nào.
create function tang_luot_truy_cap(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update chi_tiet_chien_dich
  set luot_truy_cap = luot_truy_cap + 1
  where chien_dich_id = (select id from chien_dich where slug = p_slug);
end;
$$;

grant execute on function tang_luot_truy_cap(text) to anon, authenticated;

-- Tự tăng "lượt đăng ký thành công" mỗi khi có khách hàng mới được gắn
-- vào 1 chiến dịch cụ thể — khỏi phải gọi thêm 1 lệnh riêng từ frontend,
-- tránh bị lệch nếu chỉ 1 trong 2 lệnh insert/update thành công.
create function tang_luot_dang_ky() returns trigger as $$
begin
  if new.chien_dich_id is not null then
    update chi_tiet_chien_dich
    set luot_dang_ky_thanh_cong = luot_dang_ky_thanh_cong + 1
    where chien_dich_id = new.chien_dich_id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_tang_luot_dang_ky
  after insert on khach_hang
  for each row execute function tang_luot_dang_ky();
