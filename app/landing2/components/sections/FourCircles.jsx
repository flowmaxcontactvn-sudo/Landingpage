import React from "react";

export default function FourCircles() {
  return (
    <section id="four-circles" className="relative py-24 bg-[#042638] text-white font-sans overflow-hidden border-t border-white/5">
      {/* Background Grayscale Event Image with Teal Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1400&h=700&fit=crop" 
          alt="People Walking Background" 
          className="w-full h-full object-cover grayscale brightness-[0.2] contrast-[1.15] opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#042638]/95 via-[#042638]/90 to-[#042638]/95" />
      </div>

      {/* Main Container */}
      <div className="max-w-[1080px] mx-auto px-6 max-[680px]:px-4 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-left mb-14 max-w-[600px]">
          <h2 className="text-[28px] md:text-[36px] font-black font-montserrat uppercase leading-none text-white tracking-wide">
            4 VÒNG TRÒN ĐÀO TẠO
          </h2>
          <p className="text-[14.5px] md:text-[16px] text-white/70 font-semibold mt-2.5 leading-relaxed">
            Sơ đồ khái quát Hành trình phát triển theo chiều sâu của một con người
          </p>
        </div>

        {/* THREE COLUMNS BUNDLE */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr_1.3fr] gap-8 items-center max-[1023px]:gap-12">
          
          {/* COLUMN 1: Dẫn dắt & Dẫn chứng */}
          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <h3 className="text-[18px] md:text-[21px] font-extrabold leading-snug text-white font-montserrat">
                Nếu bạn đang trăn trở về hướng đi, phát triển bản thân và sự nghiệp
              </h3>
              <div className="w-12 h-[2px] bg-[#ff1a40]" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-[15px] md:text-[16px] font-black text-[#ff1a40] uppercase tracking-wider font-montserrat shrink-0">
                4 VÒNG TRÒN ĐÀO TẠO ★
              </span>
              {/* Red arrow svg pointing right */}
              <svg className="w-5 h-5 text-[#ff1a40] animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            <p className="text-[13px] md:text-[14px] text-white/60 font-semibold leading-relaxed italic">
              (Tấm bản đồ quý giá đã giúp hàng nghìn người tìm được sợi chỉ đỏ cuộc đời)
            </p>
          </div>

          {/* COLUMN 2: Danh sách 4 tầng vòng tròn */}
          <div className="space-y-4 text-left relative">
            
            {/* Tag đặc biệt chỉ vào Vòng tròn số 2 */}
            <div className="absolute top-[28%] left-0 -translate-y-1/2 z-10 max-[480px]:relative max-[480px]:top-auto max-[480px]:left-auto max-[480px]:transform-none max-[480px]:mb-3">
              <span className="bg-[#ff1a40] text-white font-black text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-sm shadow-md shadow-[#ff1a40]/30 font-montserrat">
                Tập trung vòng tròn số 2
              </span>
            </div>

            {/* List Items */}
            <div className="space-y-3 pt-8 max-[480px]:pt-0">
              
              {/* Tầng 4 */}
              <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-lg p-3.5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-[14.5px] font-bold text-white leading-tight">Trưởng Thành &amp; Kiến thức</p>
                  <p className="text-[12px] font-medium text-white/50">và Kiến thức chuyên môn</p>
                </div>
                <span className="text-[20px] font-black text-white/30 font-montserrat ml-4">4</span>
              </div>

              {/* Tầng 3 */}
              <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-lg p-3.5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-[14.5px] font-bold text-white leading-tight">Các kỹ năng</p>
                  <p className="text-[12px] font-medium text-white/50">sự lành nghề, thực chiến</p>
                </div>
                <span className="text-[20px] font-black text-white/30 font-montserrat ml-4">3</span>
              </div>

              {/* Tầng 2 - Highlighted */}
              <div className="flex justify-between items-center bg-[#ff1a40]/10 border border-[#ff1a40]/30 rounded-lg p-3.5 shadow-md shadow-[#ff1a40]/5">
                <div className="space-y-0.5">
                  <p className="text-[15px] font-black text-white leading-tight flex items-center gap-1.5">
                    Xu hướng tính cách <span className="text-[#ff1a40] text-xs">●</span>
                  </p>
                  <p className="text-[12px] font-bold text-white/70">năng khiếu, đam mê...</p>
                </div>
                <span className="text-[22px] font-black text-[#ff1a40] font-montserrat ml-4">2</span>
              </div>

              {/* Tầng 1 */}
              <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-lg p-3.5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-[14.5px] font-bold text-white leading-tight">Nhân cách cốt lõi</p>
                  <p className="text-[12px] font-medium text-white/50">Hệ giá trị cốt lõi xuyên suốt cuộc đời</p>
                </div>
                <span className="text-[20px] font-black text-white/30 font-montserrat ml-4">1</span>
              </div>

            </div>
          </div>

          {/* COLUMN 3: Sơ đồ 4 vòng tròn đồng tâm bằng SVG/CSS */}
          <div className="flex flex-col items-center justify-center text-center">
            
            {/* Concentric Circles Box */}
            <div className="relative w-[340px] h-[340px] flex items-center justify-center select-none max-[375px]:scale-90 transition-transform">
              
              {/* Circle 4 (Outer: Yellowish) */}
              <div className="absolute w-[340px] h-[340px] rounded-full bg-[#fcdb82] border-2 border-[#042638] flex flex-col justify-start items-center pt-5 shadow-lg">
                <span className="text-[10px] font-black text-[#042638]/70 uppercase tracking-widest leading-none mb-0.5">Kiến thức</span>
                <span className="text-[9px] font-bold text-[#042638]/90 max-w-[200px] leading-tight">Tủ sách vĩ nhân, tinh hoa</span>
              </div>

              {/* Circle 3 (Teal) */}
              <div className="absolute w-[260px] h-[260px] rounded-full bg-[#2d8a75] border-2 border-[#042638] flex flex-col justify-start items-center pt-5 shadow-md">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-0.5">Kỹ năng gì cần</span>
                <span className="text-[9px] font-bold text-white/90 max-w-[150px] leading-tight">4 kỹ năng gì quan trọng?</span>
              </div>

              {/* Circle 2 (White) */}
              <div className="absolute w-[180px] h-[180px] rounded-full bg-white border-2 border-[#042638] flex flex-col justify-start items-center pt-4 shadow-sm text-[#042638]">
                <span className="text-[9.5px] font-black uppercase tracking-wider leading-none mb-0.5">Xu hướng tính cách</span>
                <span className="text-[8.5px] font-bold text-gray-500 max-w-[120px] leading-tight mb-1">(năng khiếu, đam mê)</span>
                <span className="text-[8px] font-bold text-[#042638]/70">DISC, STVT, 8 loại hình...</span>
              </div>

              {/* Circle 1 (Inner Center: Red) */}
              <div className="absolute w-[100px] h-[100px] rounded-full bg-[#ff1a40] border-2 border-white/80 flex flex-col justify-center items-center p-2 shadow-inner text-white text-center">
                <span className="text-[10px] font-black tracking-wider leading-tight">Trí tuệ</span>
                <span className="text-[10px] font-black tracking-wider leading-tight">Đạo đức</span>
                <span className="text-[10px] font-black tracking-wider leading-tight">Nghị lực</span>
                <span className="text-[7.5px] font-bold text-white/80 mt-1 uppercase tracking-widest">3 GỐC</span>
              </div>

              {/* 3 Red/Orange diagonal arrows piercing to center root (Simulating SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
                {/* Arrow 1 */}
                <line x1="12" y1="62" x2="38" y2="54" stroke="#ff1a40" strokeWidth="1.2" strokeDasharray="1.5 1" />
                <polygon points="38,54 33,52 35,57" fill="#ff1a40" />
                {/* Arrow 2 */}
                <line x1="88" y1="62" x2="62" y2="54" stroke="#ff1a40" strokeWidth="1.2" strokeDasharray="1.5 1" />
                <polygon points="62,54 67,57 65,52" fill="#ff1a40" />
                {/* Arrow 3 */}
                <line x1="50" y1="88" x2="50" y2="68" stroke="#ff1a40" strokeWidth="1.2" strokeDasharray="1.5 1" />
                <polygon points="50,68 47,73 53,73" fill="#ff1a40" />
              </svg>

            </div>

            {/* Circle Subtext Info */}
            <div className="mt-4 space-y-0.5">
              <p className="text-[14px] font-bold text-white tracking-wide">
                4 Vòng Tròn Đào Tạo
              </p>
              <p className="text-[11.5px] font-medium text-white/50 italic">
                Chỉ số hạnh phúc GNH.vn
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
