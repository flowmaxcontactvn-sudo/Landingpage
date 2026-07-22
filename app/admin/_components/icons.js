// Bộ icon line-style tối giản, dùng chung cho sidebar và stat tile.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20c.7-3.4 3.2-5.4 6.2-5.4s5.5 2 6.2 5.4" />
      <circle cx="17.2" cy="8.6" r="2.4" />
      <path d="M15.5 14.9c2.3.2 4 2 4.6 4.7" />
    </svg>
  );
}

export function IconMegaphone(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l1 5h2l-1-5h2l9 4V6l-9 4H4a1 1 0 0 0-1 1v-1Z" />
      <path d="M18 9.5v5" />
    </svg>
  );
}

export function IconActivity(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M3 12h4l2.5 7L14 5l2.5 7H21" />
    </svg>
  );
}

export function IconFlame(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12 2.5c1.4 2.1 1 3.6.1 5-1 1.5-2.1 2.6-2.1 4.6a3.9 3.9 0 0 0 7.9.2c.4-2.6-.6-4-1.6-5.2.7 2.4-.5 3.4-1.2 3.6-1-1.8.4-3-.4-5.3-.4-1.2-1.4-2.2-2.7-2.9Z" />
      <path d="M8.5 13.8c-.3 1.7.1 3.1 1 4.2A5.6 5.6 0 0 0 12 20" />
    </svg>
  );
}

export function IconTrendUp(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M3 16.5 9.5 10l4 4L21 6.5" />
      <path d="M15.5 6.5H21v5.5" />
    </svg>
  );
}

export function IconPercent(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <circle cx="7" cy="7" r="2.3" />
      <circle cx="17" cy="17" r="2.3" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function IconCursorClick(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M6 3v3.2M3 6h3.2M4.6 4.6l2.3 2.3" />
      <path d="M10.5 8.5 20 12l-4 1.6L14.4 18Z" />
    </svg>
  );
}

export function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.6-4.6" />
    </svg>
  );
}

export function IconChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconMonitor(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M8.5 20h7M12 16.5V20" />
    </svg>
  );
}

export function IconTablet(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M11.7 18.3h.1" />
    </svg>
  );
}

export function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.5-2.4.7a7.6 7.6 0 0 0-1.7-1L15 3h-6l-.3 2.7a7.6 7.6 0 0 0-1.7 1l-2.4-.7-2 3.5L4.6 11a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.5 2.4-.7c.5.4 1.1.75 1.7 1L9 21h6l.3-2.7c.6-.25 1.2-.6 1.7-1l2.4.7 2-3.5Z" />
    </svg>
  );
}

export function IconPhone(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <rect x="7.5" y="2.5" width="9" height="19" rx="2" />
      <path d="M11.5 18.2h1" />
    </svg>
  );
}
