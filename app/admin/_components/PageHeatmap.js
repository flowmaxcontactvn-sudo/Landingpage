"use client";

import { formatDuration, sequentialRamp } from "../_lib/mockData";

function rampColor(score) {
  const idx = Math.min(sequentialRamp.length - 1, Math.round((score / 100) * (sequentialRamp.length - 1)));
  return { color: sequentialRamp[idx], light: idx < sequentialRamp.length - 3 };
}

export default function PageHeatmap({ sections }) {
  return (
    <div className="rounded-lg overflow-hidden border border-black/10">
      {sections.map((s) => {
        const { color, light } = rampColor(s.score);
        return (
          <div
            key={s.key}
            className="flex items-center justify-between px-4 h-11"
            style={{ backgroundColor: color }}
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
          </div>
        );
      })}
    </div>
  );
}
