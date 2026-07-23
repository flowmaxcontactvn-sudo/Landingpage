import "../globals.css";
import AdminShell from "./_components/AdminShell";

// Toàn bộ trang admin cần phiên đăng nhập + dữ liệu Supabase real-time —
// không cho Next.js tạo sẵn HTML tĩnh lúc build (build-time chưa có
// session/dữ liệu thật, gây lỗi hoặc dữ liệu cũ bị đóng băng).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản trị - Flowmax",
  description: "Trang quản trị hệ thống Landing Page",
  icons: {
    icon: "/logo.png",
  },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
