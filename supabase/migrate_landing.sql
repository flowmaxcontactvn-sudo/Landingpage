-- ═══════════════════════════════════════════════════════════════
-- THÊM CỘT landing VÀO khach_hang (chạy sau schema.sql)
-- Trước đây khach_hang chỉ biết landing qua chien_dich_id — khách
-- "Trực tiếp" (không qua chiến dịch nào) sẽ không xác định được
-- đến từ landing nào. Thêm cột landing độc lập để mọi khách hàng,
-- có chiến dịch hay không, đều gắn được đúng landing.
-- ═══════════════════════════════════════════════════════════════

alter table khach_hang add column landing text;

create index idx_khach_hang_landing on khach_hang (landing);
