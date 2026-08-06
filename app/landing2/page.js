"use client";

import React from "react";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import Benefits from "./components/sections/Benefits";
import TargetAudience from "./components/sections/TargetAudience";
import CourseIntro from "./components/sections/CourseIntro";
import FourCircles from "./components/sections/FourCircles";
import WhatIsNumerology from "./components/sections/WhatIsNumerology";
import Testimonials from "./components/sections/Testimonials";
import Registration from "./components/sections/Registration";
import SpeakerIntro from "./components/sections/SpeakerIntro";

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

        {/* Section 6: Thần số học là gì? Để làm gì? */}
        <WhatIsNumerology />

        {/* Section 7: Cảm nhận học viên */}
        <Testimonials />

        {/* Section 8: Đăng ký & Thông tin lịch học */}
        <Registration />

        {/* Section 8: Đôi điều chia sẻ về tôi (Speaker) */}
        <SpeakerIntro />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
