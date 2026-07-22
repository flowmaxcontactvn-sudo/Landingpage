"use client";

import { useEffect, useRef, useState } from "react";

// Chạy số từ giá trị cũ lên giá trị mới trong `duration`ms — để số liệu
// "tự nhảy" mỗi khi auto-refresh có dữ liệu mới thay vì đổi đột ngột.
// Lần đầu hiện luôn giá trị thật, không chạy từ 0 lên.
export default function useCountUp(target, duration = 700) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const firstRef = useRef(true);

  useEffect(() => {
    if (typeof target !== "number" || Number.isNaN(target)) {
      setDisplay(target);
      return;
    }

    if (firstRef.current) {
      firstRef.current = false;
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return display;
}
