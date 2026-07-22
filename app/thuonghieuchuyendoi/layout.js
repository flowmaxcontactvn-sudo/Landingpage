import "./tailwind.css";

// Trang này đọc cấu hình/theo dõi Supabase theo thời gian thực (link Zalo,
// lượt truy cập chiến dịch...) — không prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "7 Ngày Xây Kênh Chuyển Đổi",
  description: "Chương trình 7 ngày dành cho người mới bắt đầu xây kênh online và tạo đơn hàng đầu tiên từ nội dung.",
};

export default function LandingLayout({ children }) {
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="/thuonghieuchuyendoi/images/favicon.svg" />
      {children}
    </>
  );
}
