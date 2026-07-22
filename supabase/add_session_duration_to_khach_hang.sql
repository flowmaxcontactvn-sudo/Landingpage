-- ═══════════════════════════════════════════════════════════════
-- THÊM CỘT THỜI GIAN PHIÊN + THIẾT BỊ VÀO khach_hang
-- Phục vụ ô "Thời gian trung bình/phiên (đã đăng ký)" ở trang Heatmap —
-- cần biết người ĐÃ ĐĂNG KÝ THÀNH CÔNG ở lại trang bao lâu trước khi
-- gửi form, tách theo thiết bị giống các số liệu heatmap khác.
-- thoi_gian_phien_giay: tính từ lúc trang tải xong tới lúc gửi form.
-- Dữ liệu cũ (trước khi chạy file này) sẽ để NULL — bỏ qua khi tính
-- trung bình vì không có số liệu gốc.
-- ═══════════════════════════════════════════════════════════════

alter table khach_hang
  add column thoi_gian_phien_giay numeric(10, 1),
  add column thiet_bi text check (thiet_bi in ('desktop', 'tablet', 'mobile'));
