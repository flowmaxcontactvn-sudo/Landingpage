export default function Tabs({ items, active, onChange }) {
  return (
    <div className="flex items-center gap-6 border-b border-black/10">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={
              "relative pb-3 text-sm font-medium transition-colors -mb-px " +
              (isActive ? "text-[#0b0b0b]" : "text-[#898781] hover:text-[#52514e]")
            }
          >
            {item.label}
            {isActive && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#e25010] rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}
