/**
 * Tiện ích ghép class CSS Tailwind
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
