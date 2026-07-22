import { IconTrendUp } from "./icons";
import useCountUp from "../_lib/useCountUp";

export default function StatTile({ label, value, formatValue, delta, deltaGood = true, icon: Icon, accent = "#2a78d6" }) {
  const isUp = typeof delta === "number" ? delta >= 0 : true;
  const deltaColor = isUp === deltaGood ? "#006300" : "#d03b3b";

  const isNumeric = typeof value === "number" && !Number.isNaN(value);
  const animated = useCountUp(isNumeric ? value : 0);
  const display = isNumeric
    ? formatValue
      ? formatValue(animated)
      : Math.round(animated).toLocaleString("vi-VN")
    : value;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#52514e]">{label}</p>
        {Icon && (
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: accent + "1a", color: accent }}
          >
            <Icon />
          </span>
        )}
      </div>
      <p className="mt-3 text-[28px] font-semibold text-[#0b0b0b] leading-none tabular-nums">{display}</p>
      {typeof delta === "number" && (
        <p className="mt-2.5 flex items-center gap-1 text-xs font-medium" style={{ color: deltaColor }}>
          <IconTrendUp width={13} height={13} style={{ transform: isUp ? "none" : "scaleY(-1)" }} />
          {isUp ? "+" : ""}
          {delta}% so với kỳ trước
        </p>
      )}
    </div>
  );
}
