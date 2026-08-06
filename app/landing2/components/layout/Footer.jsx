import React from "react";
import { footerData } from "../../data/landingData";

export default function Footer() {
  return (
    <footer className="w-full bg-[#07080d] border-t border-white/5 py-12 text-center text-white/50 text-[13.5px] font-sans">
      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4 space-y-3">
        <p className="text-white/80 font-semibold">{footerData.company}</p>
        <p>{footerData.copyright}</p>
      </div>
    </footer>
  );
}
