-- ═══════════════════════════════════════════════════════════════
-- BỔ SUNG QUYỀN XOÁ/SỬA CHO ADMIN TRÊN BẢNG HEATMAP (chạy sau heatmap.sql)
-- Trước đây chỉ có quyền SELECT cho authenticated — thiếu DELETE/UPDATE
-- nên admin không xoá/sửa được số liệu dù thao tác báo "thành công".
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "Admin xem điểm chú ý section" on heatmap_section;
drop policy if exists "Admin xem hoạt động thiết bị" on heatmap_thiet_bi;

create policy "Admin toàn quyền điểm chú ý section"
  on heatmap_section for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin toàn quyền hoạt động thiết bị"
  on heatmap_thiet_bi for all
  to authenticated
  using (true)
  with check (true);
