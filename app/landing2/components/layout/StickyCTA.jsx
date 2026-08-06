import React, { useState, useEffect } from "react";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Chỉ hiện thanh CTA ghim khi người dùng cuộn qua Hero (khoảng 500px)
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById("registration-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#042638] border-t border-white/10 shadow-[0_-5px_25px_rgba(0,0,0,0.3)] transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-[1040px] mx-auto px-6 py-2.5 flex justify-between items-center gap-4">
        
        {/* Left: Brand Name */}
        <div className="text-left font-montserrat font-black text-[15px] md:text-[17px] tracking-wide uppercase shrink-0">
          <span className="text-[#ff1a40] block leading-none">THẦN SỐ HỌC</span>
          <span className="text-white block text-[12px] md:text-[13px] tracking-[0.15em] mt-0.5 leading-none">3 GỐC</span>
        </div>

        {/* Center: Class Date (Hanoi only) */}
        <div className="text-center font-sans">
          <span className="block text-[11px] md:text-[12px] font-bold text-white/50 uppercase tracking-widest leading-none">
            Hà Nội
          </span>
          <span className="text-[14px] md:text-[16px] font-black text-[#ff9800] font-montserrat mt-1 block leading-none">
            06/08/2026
          </span>
        </div>

        {/* Right: CTA Button */}
        <div className="shrink-0">
          <a 
            href="#registration-form"
            onClick={handleScrollToForm}
            className="inline-flex items-center justify-center bg-gradient-to-r from-[#cc0e48] to-[#ff1a40] text-white font-black text-[13px] md:text-[14px] font-montserrat uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md shadow-[#ff1a40]/25 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            ĐĂNG KÝ NGAY ➔
          </a>
        </div>

      </div>
    </div>
  );
}
