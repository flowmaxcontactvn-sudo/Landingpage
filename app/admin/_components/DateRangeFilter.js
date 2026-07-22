function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DateRangeFilter({ from, to, onFromChange, onToChange, onReset, onToday }) {
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
      <div className="flex items-center gap-4 pb-2">
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
      </div>
    </div>
  );
}
