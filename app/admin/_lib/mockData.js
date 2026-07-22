// Dữ liệu demo — chưa nối Supabase. Thay bằng dữ liệu thật khi có backend.

export const visitsTrend = [
  { date: "08/07", visits: 210, leads: 12 },
  { date: "09/07", visits: 248, leads: 15 },
  { date: "10/07", visits: 231, leads: 11 },
  { date: "11/07", visits: 302, leads: 19 },
  { date: "12/07", visits: 356, leads: 24 },
  { date: "13/07", visits: 289, leads: 17 },
  { date: "14/07", visits: 264, leads: 14 },
  { date: "15/07", visits: 318, leads: 21 },
  { date: "16/07", visits: 402, leads: 29 },
  { date: "17/07", visits: 388, leads: 27 },
  { date: "18/07", visits: 344, leads: 22 },
  { date: "19/07", visits: 296, leads: 18 },
  { date: "20/07", visits: 361, leads: 25 },
  { date: "21/07", visits: 415, leads: 31 },
];

export const leads = [
  { id: 1, name: "Nguyễn Thị Hương", phone: "0912 345 678", email: "huong.nt@gmail.com", source: "facebook", campaign: "thang7-uudai", createdAt: "21/07/2026 09:12" },
  { id: 2, name: "Trần Văn Minh", phone: "0987 654 321", email: "minh.tran@gmail.com", source: "zalo", campaign: "thang7-uudai", createdAt: "21/07/2026 08:47" },
  { id: 3, name: "Lê Thị Lan", phone: "0909 111 222", email: "lan.le@yahoo.com", source: "tiktok", campaign: "tiktok-ads-01", createdAt: "20/07/2026 21:35" },
  { id: 4, name: "Phạm Văn Đức", phone: "0933 222 444", email: "duc.pham@gmail.com", source: "google", campaign: "google-search", createdAt: "20/07/2026 19:02" },
  { id: 5, name: "Hoàng Thị Mai", phone: "0977 888 999", email: "mai.hoang@gmail.com", source: "facebook", campaign: "thang7-uudai", createdAt: "20/07/2026 14:18" },
  { id: 6, name: "Vũ Văn Tùng", phone: "0966 333 555", email: "tung.vu@outlook.com", source: "Trực tiếp", campaign: null, createdAt: "20/07/2026 11:44" },
  { id: 7, name: "Đặng Thị Thu", phone: "0918 777 000", email: "thu.dang@gmail.com", source: "tiktok", campaign: "tiktok-ads-01", createdAt: "19/07/2026 22:10" },
  { id: 8, name: "Bùi Văn Hải", phone: "0944 555 666", email: "hai.bui@gmail.com", source: "zalo", campaign: "zalo-oa", createdAt: "19/07/2026 20:03" },
  { id: 9, name: "Ngô Thị Ngọc", phone: "0922 111 333", email: "ngoc.ngo@gmail.com", source: "facebook", campaign: "thang7-uudai", createdAt: "19/07/2026 16:27" },
  { id: 10, name: "Đỗ Văn Long", phone: "0988 222 111", email: "long.do@gmail.com", source: "google", campaign: "google-search", createdAt: "19/07/2026 10:51" },
  { id: 11, name: "Phạm Minh Tuấn", phone: "0913 444 888", email: "tuan.pham@gmail.com", source: "facebook", campaign: "thang7-uudai", createdAt: "18/07/2026 15:33" },
  { id: 12, name: "Nguyễn Thanh Hằng", phone: "0908 666 777", email: "hang.nt@gmail.com", source: "Trực tiếp", campaign: null, createdAt: "18/07/2026 09:20" },
];

export const campaigns = [
  { id: 1, name: "Tháng 7 ưu đãi", slug: "thang7-uudai", visits: 4820, leads: 312, status: "active", createdAt: "01/07/2026" },
  { id: 2, name: "TikTok Ads đợt 1", slug: "tiktok-ads-01", visits: 2310, leads: 148, status: "active", createdAt: "05/07/2026" },
  { id: 3, name: "Google Search", slug: "google-search", visits: 1875, leads: 96, status: "active", createdAt: "03/07/2026" },
  { id: 4, name: "Zalo OA", slug: "zalo-oa", visits: 940, leads: 61, status: "active", createdAt: "10/07/2026" },
  { id: 5, name: "Livestream tháng 6", slug: "livestream-t6", visits: 1520, leads: 84, status: "deleted", createdAt: "15/06/2026" },
  { id: 6, name: "Affiliate Shopee", slug: "affiliate-shopee", visits: 610, leads: 29, status: "active", createdAt: "12/07/2026" },
];

// Nhãn hiển thị cho từng section, theo TỪNG landing page — vì mỗi landing
// có cấu trúc section khác nhau. Đúng thứ tự cuộn trang thật trong
// app/thuonghieuchuyendoi/page.js (thứ tự các data-section trong DOM).
// Điểm số/giây thực tế lấy từ bảng heatmap_section, không lưu ở đây.
// landing2/landing3 chưa có nội dung nên để rỗng, thêm khi có trang thật.
export const sectionLabelsByLanding = {
  "/thuonghieuchuyendoi": {
    hero: "Hero — Banner mở đầu",
    "pain-points": "Vấn đề của người mới",
    truth: "Sự thật bạn cần biết",
    "audience-fit": "Dành cho ai",
    "theory-practice": "20% lý thuyết – 80% thực hành",
    steps: "3 bước vận hành",
    roadmap: "Lộ trình 7 ngày",
    outcomes: "Sau 7 ngày bạn có",
    instructor: "Giảng viên & mentor",
    testimonials: "Học viên thành công",
    urgency: "Đừng tiếp tục trì hoãn",
    "fit-checklist": "Phù hợp với ai",
    "pricing-register": "Đăng ký tham gia",
    "next-steps": "Sau 7 ngày, đi xa hơn",
    "final-cta": "CTA cuối trang",
  },
  "/landing2": {},
  "/landing3": {},
};

export const sourceLabels = {
  facebook: { label: "Facebook", color: "#2a78d6" },
  zalo: { label: "Zalo", color: "#1baf7a" },
  tiktok: { label: "TikTok", color: "#0b0b0b" },
  google: { label: "Google", color: "#eda100" },
  "Trực tiếp": { label: "Trực tiếp", color: "#898781" },
};

// Các landing page hiện có trong hệ thống (khớp thư mục app/)
export const landingPages = [
  { path: "/thuonghieuchuyendoi", domain: "7ngay.thuonghieuchuyendoi.com", name: "7 Ngày Xây Kênh Chuyển Đổi", live: true },
  { path: "/landing2", domain: "landing2.com", name: "Landing 2", live: false },
  { path: "/landing3", domain: "landing3.com", name: "Landing 3", live: false },
];

// Thang màu sequential (từ trắng tới cam #F97316 ở giá trị cao nhất)
// dùng cho so sánh độ lớn (heatmap, xếp hạng...).
export const sequentialRamp = [
  "#ffffff", "#feeee2", "#fedcc5", "#fdcba8", "#fcb98b",
  "#fba86d", "#fb9650", "#fa8533", "#f97316",
];

export function formatNumber(n) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

// Tổng số giây (cộng dồn từ mọi lượt truy cập) -> chuỗi dễ đọc, vd "2h 15m", "6m 40s", "12s".
export function formatDuration(seconds) {
  const total = Math.round(seconds || 0);
  if (total < 60) return `${total}s`;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
