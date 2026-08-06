import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#042638] border-t border-white/10 py-16 text-white font-sans relative overflow-hidden">
      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4">
        
        {/* TWO COLUMNS BUNDLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pb-12 border-b border-white/10">
          
          {/* LEFT COLUMN: COMPANY DETAILS */}
          <div className="space-y-6 text-left">
            <h4 className="text-[#ffd043] font-black text-[18px] md:text-[20px] font-montserrat tracking-wide uppercase leading-tight">
              CÔNG TY CỔ PHẦN FLOWMAX GLOBAL
            </h4>
            
            <div className="space-y-4 text-[14px] md:text-[15px] text-white/90 leading-relaxed font-medium">
              
              {/* Address */}
              <div className="flex items-start gap-3">
                <span className="text-[18px] shrink-0 mt-0.5" role="img" aria-label="building">🏢</span>
                <span>
                  D01 – L39 An Vượng Villa, KĐT mới Dương Nội, Phường Dương Nội, TP Hà Nội
                </span>
              </div>

              {/* Tax Code */}
              <div className="flex items-start gap-3">
                <span className="text-[18px] shrink-0 mt-0.5" role="img" aria-label="document">📄</span>
                <span>
                  Mã số thuế: 0111301605 – do Sở Tài Chính TP Hà Nội cấp ngày 03/12/2025
                </span>
              </div>

              {/* Hotline */}
              <div className="flex items-start gap-3">
                <span className="text-[18px] shrink-0 mt-0.5" role="img" aria-label="phone">📞</span>
                <span>
                  Hotline: <a href="tel:0915217659" className="hover:text-[#ffd043] transition-colors">091 5217 659</a>
                </span>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <span className="text-[18px] shrink-0 mt-0.5" role="img" aria-label="email">✉️</span>
                <span>
                  Email: <a href="mailto:flowmax.contact.vn@gmail.com" className="hover:text-[#ffd043] transition-colors">flowmax.contact.vn@gmail.com</a>
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: GOOGLE MAPS EMBED */}
          <div className="w-full h-[220px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.2925132872323!2d105.74245907584488!3d20.980907280656824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134537794a085b7%3A0xb35a29a1b1836c84!2zQW4gVsaw4bujbmcgVmlsbGEsIETGsMahbmcgTuG7mWksIEjDoCDEkMO0bmcsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
              title="Google Map An Vượng Villa"
            />
            {/* Soft overlay gradient */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />
          </div>

        </div>

        {/* COPYRIGHT INFO */}
        <div className="pt-8 text-center text-white/50 text-[12.5px] font-semibold tracking-wide">
          <p>© 2026 CÔNG TY CỔ PHẦN FLOWMAX GLOBAL. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
