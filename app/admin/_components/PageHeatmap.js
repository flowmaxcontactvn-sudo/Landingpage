"use client";

import { useState } from "react";
import { formatDuration, formatNumber, sequentialRamp } from "../_lib/mockData";

function rampColor(score) {
  const idx = Math.min(sequentialRamp.length - 1, Math.round((score / 100) * (sequentialRamp.length - 1)));
  return { color: sequentialRamp[idx], light: idx < sequentialRamp.length - 3 };
}

export default function PageHeatmap({ sections }) {
  const [hoverKey, setHoverKey] = useState(null);

  return (
    <div className="rounded-lg overflow-hidden border border-black/10">
      {sections.map((s) => {
        const { color, light } = rampColor(s.score);
        const hovered = hoverKey === s.key;
        return (
          <div
            key={s.key}
            onPointerEnter={() => setHoverKey(s.key)}
            onPointerLeave={() => setHoverKey(null)}
            className="relative flex items-center justify-between px-4 h-11 transition-[filter] duration-150"
            style={{ backgroundColor: color, filter: hovered ? "brightness(1.06)" : "none" }}
          >
            <span
              className="text-[13px] font-medium truncate pr-3"
              style={{ color: light ? "#0b0b0b" : "#ffffff" }}
            >
              {s.label}
            </span>
            <span
              className="text-[13px] font-semibold tabular-nums shrink-0"
              style={{ color: light ? "#0b0b0b" : "#ffffff" }}
            >
              {formatDuration(s.giay)}
            </span>
            {hovered && (
              <div className="absolute right-4 -top-9 rounded-md border border-black/10 bg-white px-2.5 py-1.5 shadow-sm text-xs z-10 whitespace-nowrap">
                <span className="text-[#898781]">Tổng thời gian khách ở lại: </span>
                <span className="font-semibold text-[#0b0b0b]">{formatNumber(Math.round(s.giay || 0))} giây</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
