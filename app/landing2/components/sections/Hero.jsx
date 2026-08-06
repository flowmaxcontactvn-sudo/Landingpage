import React from "react";
import Button from "../ui/Button";
import { heroData } from "../../data/landingData";

export default function Hero() {
  const handleScrollToRegister = (e) => {
    e.preventDefault();
    const target = document.getElementById("register");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-16 flex flex-col justify-between bg-[#042638] text-white overflow-hidden font-sans">
      {/* Import Font viết tay Caveat độc lập chỉ cho Landing 2 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        .font-handwriting {
          font-family: 'Caveat', cursive;
        }
      `}</style>

      {/* TOP HEADER LOGOS */}
      <div className="absolute top-0 left-0 w-full z-20 py-6">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          {/* Logo Bách Khoa (Vàng nghệ) */}
          <div className="flex flex-col items-center select-none">
            <svg className="w-10 h-10 text-[#ffd043]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z"/>
              <circle cx="12" cy="14" r="2.5"/>
            </svg>
            <span className="text-[11px] font-black tracking-[0.15em] uppercase text-[#ffd043] mt-1 font-montserrat">
              bach khoa
            </span>
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-[#ffd043]/80 font-montserrat">
              education
            </span>
          </div>

          {/* Logo GNH (Hoa sen nhiều màu) */}
          <div className="flex flex-col items-center select-none">
            <div className="relative w-9 h-9 flex items-center justify-center bg-white/5 rounded-full p-1 border border-white/10">
              <svg className="w-7 h-7 text-[#00bcd4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.5c-1.35-1.22-4.14-3.75-6.14-6.14C3.86 12.96 3 11 3 9c0-3.31 2.69-6 6-6 1.84 0 3.5.83 4.6 2.1C14.7 3.83 16.36 3 18.2 3c3.31 0 6 2.69 6 6 0 2-.86 3.96-2.86 6.36-2 2.39-4.79 4.92-6.14 6.14z"/>
              </svg>
            </div>
            <span className="text-[11px] font-black tracking-[0.2em] text-[#00bcd4] mt-1 font-montserrat">
              GNH.VN
            </span>
          </div>
        </div>
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="max-w-[960px] mx-auto px-6 relative z-10 flex-grow flex flex-col justify-center items-center text-center mt-12">
        
        {/* Badge: Khóa học offline */}
        <div className="inline-block border-[1.5px] border-white rounded-sm px-5 py-1 mb-5">
          <span className="text-[13px] md:text-[15px] font-black tracking-[0.2em] text-white uppercase font-montserrat">
            {heroData.badge}
          </span>
        </div>

        {/* Title: Thần Số Học 3 Gốc */}
        <h1 className="text-[clamp(44px,6.8vw,80px)] font-black tracking-wide leading-[1.1] font-montserrat uppercase mb-6">
          <span className="text-[#ff1a40] drop-shadow-[0_4px_12px_rgba(255,26,64,0.3)] mr-4">
            {heroData.titleRed}
          </span>
          <span className="text-white">
            {heroData.titleWhite}
          </span>
        </h1>

        {/* Sub-headline Box */}
        <div className="inline-flex items-center gap-2.5 bg-[#051c2d] border border-white/10 rounded-full px-6 py-3 mb-8 shadow-md">
          <span className="text-[#f9c115] text-base">👉</span>
          <p className="text-[17px] md:text-[20px] font-bold tracking-wide font-sans">
            <span className="text-white mr-1.5">Khai sáng trí tuệ,</span>
            <span className="text-[#f9c115]">{heroData.subHeadline.split(",")[1]?.trim() || "định hướng cuộc đời"}</span>
          </p>
        </div>

        {/* Descriptions (Multi-line layout) */}
        <div className="space-y-3.5 text-[18px] md:text-[21px] text-white leading-relaxed font-sans max-w-[800px] mx-auto">
          {heroData.descriptions.map((desc, idx) => {
            if (desc.highlight) {
              return (
                <p key={idx} className="font-black text-[#f9c115] tracking-wide uppercase">
                  {desc.highlight}
                </p>
              );
            }
            return (
              <p key={idx} className={desc.italic ? "text-white/60 font-black tracking-wider italic text-[15px] md:text-[16.5px] mt-6" : "font-semibold"}>
                {desc.text}
              </p>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <a
            href="#register"
            onClick={handleScrollToRegister}
            className="inline-flex items-center justify-center bg-gradient-to-r from-[#cc0e48] to-[#ff1a40] hover:from-[#e61253] hover:to-[#ff3b5c] text-white font-black font-montserrat uppercase tracking-wider rounded-full shadow-[0_5px_35px_rgba(255,26,64,0.45)] hover:shadow-[0_8px_40px_rgba(255,26,64,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 px-16 py-4.5 text-[16px] md:text-[18px]"
          >
            {heroData.ctaText}
          </a>
        </div>
      </div>

      {/* BOTTOM INSTRUCTOR ROW */}
      <div className="w-full border-t border-white/5 bg-[#03111c]/60 backdrop-blur-sm pt-8 pb-4 mt-12">
        <div className="max-w-[820px] mx-auto px-6 flex items-end justify-between gap-8 max-[680px]:flex-col max-[680px]:items-center max-[680px]:text-center max-[680px]:gap-6">
          
          {/* Left: Placeholder for Thầy Trần Việt Quân Image */}
          <div className="relative shrink-0 max-[680px]:mt-2">
            <div className="w-[180px] h-[220px] bg-gradient-to-t from-[#062035] to-[#0d3454] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-4 shadow-lg overflow-hidden group">
              {/* Icon placeholder hoặc hình ảnh bóng nhân vật */}
              <svg className="w-14 h-14 text-white/30 mb-2 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-snug">
                Ảnh Nhân Vật<br />(Cung cấp sau)
              </span>
              
              {/* Hiệu ứng overlay phản chiếu */}
              <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </div>
          </div>

          {/* Right: Instructor Details */}
          <div className="flex-grow space-y-4 max-[680px]:flex max-[680px]:flex-col max-[680px]:items-center">
            <div className="space-y-1">
              <h3 className="text-[20px] md:text-[23px] font-black font-montserrat tracking-wide text-white">
                {heroData.instructor.name}
              </h3>
              
              {/* Bullet points with lotus-like or dot symbols */}
              <ul className="space-y-2 text-[13.5px] md:text-[14.5px] text-white/80 font-medium font-sans">
                {heroData.instructor.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 max-[680px]:justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffd043] shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature quote (Handwriting font) */}
            <div className="pt-2 border-t border-white/5 w-full max-[680px]:text-center">
              <p className="font-handwriting text-[#ffd043] text-[26px] md:text-[30px] leading-none py-1 rotate-[-2deg] inline-block">
                {heroData.instructor.quote}
              </p>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
