"use client";

import { useMemo, useState } from "react";

const W = 560;
const H = 220;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;

export default function LineChart({ data, valueKey, xKey = "date", color = "#2a78d6", label, formatValue = (v) => v }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const { points, yTicks, path, areaPath } = useMemo(() => {
    if (data.length === 0) return { points: [], yTicks: [0, 0, 0], path: "", areaPath: "" };

    const values = data.map((d) => d[valueKey]);
    const max = Math.max(...values);
    const min = Math.min(0, Math.min(...values));
    const upper = Math.ceil((max * 1.15) / 10) * 10;
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;

    const xFor = (i) => (data.length <= 1 ? PAD_L + innerW / 2 : PAD_L + (innerW * i) / (data.length - 1));
    const yFor = (v) => PAD_T + innerH - (innerH * (v - min)) / (upper - min || 1);

    const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d[valueKey]), raw: d }));
    const linePath = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
    const area = `${linePath} L${pts[pts.length - 1].x},${PAD_T + innerH} L${pts[0].x},${PAD_T + innerH} Z`;

    const ticks = [0, 0.5, 1].map((f) => Math.round(upper - f * (upper - min)));

    return { points: pts, yTicks: ticks, path: linePath, areaPath: area };
  }, [data, valueKey]);

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative">
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
          <p className="text-sm font-medium text-[#52514e]">{label}</p>
        </div>
      )}
      {points.length === 0 ? (
        <p className="text-sm text-[#898781] py-8 text-center">Không có dữ liệu trong khoảng đã chọn.</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto touch-none"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * W;
            const innerW = W - PAD_L - PAD_R;
            const idx = Math.round(((relX - PAD_L) / innerW) * (data.length - 1));
            setHoverIdx(Math.min(data.length - 1, Math.max(0, idx)));
          }}
          onPointerLeave={() => setHoverIdx(null)}
        >
          {yTicks.map((t, i) => {
            const y = PAD_T + (i / (yTicks.length - 1)) * (H - PAD_T - PAD_B);
            return (
              <g key={i}>
                <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#e1e0d9" strokeWidth="1" />
                <text x={PAD_L - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#898781">
                  {formatValue(t)}
                </text>
              </g>
            );
          })}

          <path className="animate-fade-area" d={areaPath} fill={color} opacity="0.1" />
          <path className="animate-draw-line" d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) =>
            i === points.length - 1 ? (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={color}
                stroke="#fff"
                strokeWidth="2"
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                className="animate-pop-circle"
              />
            ) : null
          )}

          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#898781"
              style={{ display: i % 2 === 0 ? "block" : "none" }}
            >
              {p.raw[xKey]}
            </text>
          ))}

          <text x={points[points.length - 1].x} y={points[points.length - 1].y - 10} textAnchor="end" fontSize="11" fontWeight="600" fill="#0b0b0b">
            {formatValue(points[points.length - 1].raw[valueKey])}
          </text>

          {hovered && (
            <>
              <line x1={hovered.x} x2={hovered.x} y1={PAD_T} y2={H - PAD_B} stroke="#c3c2b7" strokeWidth="1" />
              <circle cx={hovered.x} cy={hovered.y} r="5" fill={color} stroke="#fff" strokeWidth="2" />
            </>
          )}
        </svg>
      )}

      {hovered && (
        <div
          className="absolute top-1 -translate-x-1/2 rounded-md border border-black/10 bg-white px-2.5 py-1.5 shadow-sm pointer-events-none text-xs"
          style={{ left: `${(hovered.x / W) * 100}%` }}
        >
          <p className="text-[#898781]">{hovered.raw[xKey]}</p>
          <p className="font-semibold text-[#0b0b0b]">{formatValue(hovered.raw[valueKey])}</p>
        </div>
      )}
    </div>
  );
}
