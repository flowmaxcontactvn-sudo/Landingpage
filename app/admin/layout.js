import "../globals.css";
import AdminShell from "./_components/AdminShell";

export const metadata = {
  title: "Quản trị - Flowmax",
  description: "Trang quản trị hệ thống Landing Page",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
