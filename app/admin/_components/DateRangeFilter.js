function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr() {
  return toDateStr(new Date());
}

function daysAgoRange(n) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (n - 1));
  return [toDateStr(from), toDateStr(to)];
}

function thisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return [toDateStr(from), toDateStr(now)];
}

function lastMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return [toDateStr(from), toDateStr(to)];
}

const PRESETS = [
  { label: "7 ngày qua", range: () => daysAgoRange(7) },
  { label: "30 ngày qua", range: () => daysAgoRange(30) },
  { label: "Tháng này", range: () => thisMonthRange() },
  { label: "Tháng trước", range: () => lastMonthRange() },
];

export default function DateRangeFilter({ from, to, onFromChange, onToChange, onReset, onToday, onPreset }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-xs font-medium text-[#52514e] mb-1">Từ ngày</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border border-black/10 bg-white py-2 px-3 text-sm text-[#0b0b0b] outline-none focus:border-[#e25010]"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#52514e] mb-1">Đến ngày</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-black/10 bg-white py-2 px-3 text-sm text-[#0b0b0b] outline-none focus:border-[#e25010]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-2">
        <button type="button" onClick={onReset} className="flex items-center gap-1.5 text-sm font-medium text-[#e25010] hover:underline">
          ↺ Xem toàn thời gian
        </button>
        <button
          type="button"
          onClick={() => onToday(todayStr())}
          className="flex items-center gap-1.5 text-sm font-medium text-[#e25010] hover:underline"
        >
          🗓 Hôm nay
        </button>
        {onPreset &&
          PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                const [f, t] = p.range();
                onPreset(f, t);
              }}
              className="text-sm font-medium text-[#e25010] hover:underline"
            >
              {p.label}
            </button>
          ))}
      </div>
    </div>
  );
}
