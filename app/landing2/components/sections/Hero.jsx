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
    <section id="hero" className="relative min-h-screen pt-28 pb-20 flex items-center bg-[#07080d] text-white overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Glow Blobs */}
      <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-radial from-red-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-radial from-blue-600/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4 relative text-center z-10 space-y-8">
        <h1 className="text-[clamp(32px,5.5vw,64px)] font-black leading-[1.1] font-montserrat tracking-tight uppercase max-w-[880px] mx-auto bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
          {heroData.title}
        </h1>

        <p className="text-[clamp(16px,2vw,22px)] text-white/80 max-w-[700px] mx-auto font-medium leading-relaxed">
          {heroData.subtitle}
        </p>

        <div className="pt-4">
          <Button onClick={handleScrollToRegister} className="px-12 py-4 text-[14px] md:text-[15.5px]">
            {heroData.ctaText}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 max-w-[680px] mx-auto pt-12 border-t border-white/5 max-[560px]:grid-cols-1">
          {heroData.stats.map((s, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-[36px] md:text-[44px] font-black text-[#e30a0a] font-montserrat leading-none">
                {s.value}
              </p>
              <p className="text-[13px] md:text-[14px] text-white/60 font-semibold tracking-wide uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
