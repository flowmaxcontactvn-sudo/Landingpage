"use client";

import { useState } from "react";
import { sequentialRamp } from "../_lib/mockData";

function rampColor(ratio) {
  const idx = Math.min(sequentialRamp.length - 1, Math.floor(ratio * sequentialRamp.length));
  return sequentialRamp[idx];
}

export default function BarList({ items, valueKey = "score", labelKey = "label", suffix = "", formatValue }) {
  const [hoverId, setHoverId] = useState(null);
  const max = Math.max(1, ...items.map((i) => i[valueKey]));

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const ratio = item[valueKey] / max;
        return (
          <div
            key={item.key ?? i}
            className="group cursor-default"
            onPointerEnter={() => setHoverId(item.key ?? i)}
            onPointerLeave={() => setHoverId(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-[#0b0b0b] truncate pr-3">{item[labelKey]}</span>
              <span className="text-[13px] font-semibold text-[#0b0b0b] tabular-nums shrink-0">
                {formatValue ? formatValue(item[valueKey]) : `${item[valueKey]}${suffix}`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#f0efec] overflow-hidden relative">
              <div
                className="h-full rounded-full transition-[filter] duration-150"
                style={{
                  width: `${ratio * 100}%`,
                  backgroundColor: rampColor(ratio),
                  filter: (hoverId === (item.key ?? i)) ? "brightness(0.92)" : "none",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
