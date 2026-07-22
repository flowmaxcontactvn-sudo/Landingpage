import { NextResponse } from 'next/server';

export function proxy(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Ánh xạ tên miền -> thư mục con tương ứng
  const domainMapping = {
    'thuonghieuchuyendoi.com': '/admin',
    'www.thuonghieuchuyendoi.com': '/admin',
    '7ngay.thuonghieuchuyendoi.com': '/thuonghieuchuyendoi',
    'landing2.com': '/landing2',
    'www.landing2.com': '/landing2',
  };

  // Nếu là môi trường phát triển local (localhost/127.0.0.1)
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Cho phép truy cập trực tiếp bằng đường dẫn con để kiểm thử
    return NextResponse.next();
  }

  // Lấy đường dẫn đích ứng với tên miền truy cập
  const targetPath = domainMapping[hostname];
  if (targetPath) {
    // Điều hướng ngầm (rewrite) không thay đổi URL trên trình duyệt của người dùng
    url.pathname = `${targetPath}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Chỉ chạy proxy này trên các đường dẫn động, bỏ qua các tệp tĩnh (hình ảnh, video, css...)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)',
  ],
};
