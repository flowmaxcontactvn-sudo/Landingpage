const STATUS = {
  good: { bg: "#e7f7e7", fg: "#0a6b0a", dot: "#0ca30c", label: "Đang chạy" },
  critical: { bg: "#fceaea", fg: "#a12e2e", dot: "#d03b3b", label: "Đã xoá" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}

export function SourceBadge({ source, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#0b0b0b]">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color || "#898781" }} />
      {source}
    </span>
  );
}
