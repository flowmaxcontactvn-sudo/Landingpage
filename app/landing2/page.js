"use client";

import React from "react";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";

export default function Landing2Page() {
  return (
    <div className="min-h-screen bg-[#07080d] text-white flex flex-col selection:bg-[#e30a0a]/30 selection:text-white">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Trống/placeholder chờ bổ sung thêm */}
        <section id="benefits" className="py-24 border-t border-white/5 relative bg-[#090a10]">
          <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4 text-center space-y-4">
            <h2 className="text-[clamp(28px,3.8vw,44px)] font-black uppercase font-montserrat text-[#e30a0a]">
              Lợi Ích Đột Phá
            </h2>
            <p className="text-white/60 max-w-[600px] mx-auto font-sans leading-relaxed">
              Các giá trị thực tế mà bạn sẽ nhận được khi tham gia chương trình đào tạo chuyên sâu.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              <div className="bg-white/5 border border-white/5 p-8 rounded-2xl space-y-3 text-left">
                <h3 className="text-xl font-bold text-white font-montserrat">Tự Động Hóa</h3>
                <p className="text-white/60 text-sm leading-relaxed">Xây dựng quy trình tìm kiếm và tiếp cận khách hàng tiềm năng 100% tự động qua video ngắn.</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-8 rounded-2xl space-y-3 text-left">
                <h3 className="text-xl font-bold text-white font-montserrat">Thương Hiệu</h3>
                <p className="text-white/60 text-sm leading-relaxed">Định vị bản thân là chuyên gia đầu ngành trong lĩnh vực của bạn một cách nhanh chóng.</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-8 rounded-2xl space-y-3 text-left">
                <h3 className="text-xl font-bold text-white font-montserrat">Chuyển Đổi</h3>
                <p className="text-white/60 text-sm leading-relaxed">Tối ưu hóa các chỉ số tương tác, chuyển hóa người xem trung lập thành đơn hàng thực tế.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Đăng ký */}
        <section id="register" className="py-24 border-t border-white/5 bg-[#07080d]">
          <div className="max-w-[600px] mx-auto px-6 max-[680px]:px-4 text-center space-y-8">
            <h2 className="text-[clamp(28px,3.8vw,44px)] font-black uppercase font-montserrat text-[#e30a0a]">
              Giữ Chỗ Của Bạn
            </h2>
            <p className="text-white/70 font-sans leading-relaxed">
              Đăng ký ngay hôm nay để nhận được ưu đãi giảm 50% học phí và bộ quà tặng tài liệu xây kênh trị giá 2.000.000đ.
            </p>
            <form className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">Họ và tên</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e30a0a] transition-colors" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">Số điện thoại</label>
                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e30a0a] transition-colors" placeholder="0987654321" />
              </div>
              <button type="submit" className="w-full bg-[#e30a0a] hover:bg-[#ff1e1e] text-white font-extrabold uppercase py-4 rounded-lg shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all cursor-pointer">
                XÁC NHẬN ĐĂNG KÝ
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
