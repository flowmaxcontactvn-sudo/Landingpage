export const metadata = {
  title: "Flowmax Landing Pages",
  description: "Hệ thống quản trị Landing Page hợp nhất",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
