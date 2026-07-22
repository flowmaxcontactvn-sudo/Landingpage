"use client";

import { useEffect, useRef } from "react";

// Gọi lại callback mỗi intervalMs để dữ liệu tự cập nhật mà không cần
// tải lại trang. Tạm dừng khi tab đang ẩn (đỡ tốn request vô ích), tự
// chạy lại ngay khi quay lại tab. Dùng ref cho callback để không phải
// bọc callback bằng useCallback ở nơi gọi.
export default function useAutoRefresh(callback, intervalMs = 10000) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") callbackRef.current();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
}
