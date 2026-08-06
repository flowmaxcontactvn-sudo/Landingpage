"use client";

import React from "react";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import Benefits from "./components/sections/Benefits";
import TargetAudience from "./components/sections/TargetAudience";
import CourseIntro from "./components/sections/CourseIntro";
import FourCircles from "./components/sections/FourCircles";

export default function Landing2Page() {
  return (
    <div className="min-h-screen bg-[#07080d] text-white flex flex-col selection:bg-[#e30a0a]/30 selection:text-white">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Giá trị khóa học mang lại */}
        <Benefits />

        {/* Section 3: Khóa học dành cho những ai */}
        <TargetAudience />

        {/* Section 4: Giới thiệu chuyên sâu Thần Số Học 3 Gốc */}
        <CourseIntro />

        {/* Section 5: 4 Vòng tròn đào tạo */}
        <FourCircles />

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
