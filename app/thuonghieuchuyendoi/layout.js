import "./tailwind.css";

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
