import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-[#0b0c1e]/90 backdrop-blur-md border-b border-white/5 py-4 fixed top-0 left-0 z-50">
      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-montserrat font-black text-[20px] tracking-wider uppercase">
            PH<span className="text-[#e30a0a]">MAX</span>
          </span>
        </div>
        <nav className="flex items-center gap-6 text-[14px] font-semibold text-white/80">
          <a href="#hero" className="hover:text-white transition-colors">Trang Chủ</a>
          <a href="#benefits" className="hover:text-white transition-colors">Lợi Ích</a>
          <a href="#register" className="hover:text-white transition-colors">Đăng Ký</a>
        </nav>
      </div>
    </header>
  );
}
