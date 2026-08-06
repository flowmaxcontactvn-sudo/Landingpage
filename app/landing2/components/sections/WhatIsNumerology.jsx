import React from "react";

export default function WhatIsNumerology() {
  const pitagoDetails = [
    { label: "Khoa học", desc: "có tính logic" },
    { label: "Triết gia", desc: "đi vào chiều sâu" },
    { label: "Giáo dục", desc: "phát triển con người" },
    { label: "Tâm linh", desc: "Linh hồn trưởng thành" }
  ];

  const mapDetails = [
    { label: "Hiểu mình, hiểu người" },
    { label: "Trở thành phiên bản tốt nhất của chính mình" },
    { label: "Vượt thoát chính mình" }
  ];

  return (
    <section id="what-is-numerology" className="py-24 bg-white text-[#042638] font-sans border-t border-[#eee]">
      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4 space-y-24">
        
        {/* ========================================================
            PHẦN 1: THẦN SỐ HỌC TRƯỜNG PHÁI PITAGO
           ======================================================== */}
        <div className="space-y-12">
          
          {/* Header */}
          <div className="flex items-center gap-4 text-left max-[480px]:flex-wrap">
            <div className="space-y-1">
              <h2 className="text-[28px] md:text-[36px] font-black font-montserrat uppercase leading-none text-[#042638] tracking-wide">
                THẦN SỐ HỌC
              </h2>
              <h3 className="text-[26px] md:text-[34px] font-black font-montserrat uppercase leading-none text-[#042638] tracking-wide mt-1">
                TRƯỜNG PHÁI
              </h3>
            </div>
            {/* Orange Badge */}
            <div className="bg-[#ff6600] text-white font-black text-[22px] md:text-[28px] tracking-[0.1em] px-5 py-2.5 rounded-sm shadow-md shadow-[#ff6600]/25 font-montserrat select-none">
              PITAGO
            </div>
          </div>

          {/* 2 Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Portrait & 4 features */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              
              {/* Pythagoras Sketch Wrapper */}
              <div className="w-[180px] h-[220px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=250&h=300&fit=crop" 
                  alt="Pythagoras Portrait"
                  className="w-full h-full object-cover grayscale brightness-95 contrast-105"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/250x300/fcfcfc/666666?text=Pythagoras";
                  }}
                />
              </div>

              {/* List details */}
              <div className="space-y-4 w-full max-w-[360px]">
                <h4 className="text-[17px] md:text-[18px] font-extrabold text-[#042638] font-montserrat">
                  4 đặc điểm của ông <span className="text-[#ff6600] font-black">PITAGO</span>
                </h4>
                
                <ul className="space-y-3">
                  {pitagoDetails.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[14.5px] text-[#042638] font-medium text-left">
                      {/* Orange circular plus icon */}
                      <span className="w-5 h-5 rounded-full bg-[#ff6600] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm shadow-[#ff6600]/20">
                        +
                      </span>
                      <span>
                        <strong>{item.label}</strong>: {item.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Column: House Diagram & Flow */}
            <div className="flex flex-col items-center justify-center relative w-full max-w-[420px] mx-auto">
              
              {/* Horizontal transition arrow from left (Desktop only) */}
              <div className="absolute left-[-60px] top-[30%] -translate-y-1/2 hidden lg:block">
                <svg className="w-10 h-10 text-[#ff6600]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              {/* MÁI NHÀ (Orange Triangle) */}
              <div 
                className="w-full bg-[#ff6600] text-white font-extrabold text-[14px] md:text-[15.5px] py-4 text-center shadow-lg uppercase tracking-wide font-montserrat"
                style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", height: "70px", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "10px" }}
              >
                Tính cách, đặc điểm, năng lượng
              </div>

              {/* THÂN NHÀ (White Rect with Black Border) */}
              <div className="w-full bg-white border-2 border-[#042638] py-5 text-center shadow-md relative z-10 font-bold text-[15px] md:text-[16.5px] tracking-wide text-[#042638]">
                Đi vào chiều sâu, phát triển Linh hồn
              </div>

              {/* BÊN TRONG (Dark Blue circle beneath the house) */}
              <div className="w-[120px] h-[120px] rounded-full bg-[#042638] border-2 border-white flex items-center justify-center text-center shadow-lg mt-6 relative z-10">
                <span className="text-[#ff6600] font-black text-[14px] md:text-[15px] uppercase tracking-wider font-montserrat">
                  BÊN TRONG
                </span>
              </div>

              {/* Two branch directions below the circle */}
              <div className="w-full grid grid-cols-2 gap-4 mt-6 text-center text-[13px] md:text-[14px] font-sans">
                
                {/* Left Branch: HƯỚNG RA */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="font-extrabold text-[#042638] tracking-wider uppercase flex items-center gap-1">
                    HƯỚNG RA
                    <svg className="w-3.5 h-3.5 text-[#ff6600] rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="text-[#042638]/80 font-medium">
                    <p>Dễ vỗ đoán</p>
                    <p>Phục vụ Mưu sinh</p>
                  </div>
                </div>

                {/* Right Branch: QUAY VÀO */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="font-extrabold text-[#042638] tracking-wider uppercase flex items-center gap-1">
                    QUAY VÀO
                    <svg className="w-3.5 h-3.5 text-[#ff6600] rotate-[-45deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="text-[#042638]/80 font-medium">
                    <p>Kiểu người tương</p>
                    <p>ứng các con số</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================================
            PHẦN 2: THẦN SỐ HỌC LÀ GÌ? ĐỂ LÀM GÌ?
           ======================================================== */}
        <div className="space-y-12 border-t border-gray-150 pt-20">
          
          {/* Header */}
          <div className="text-left">
            <h2 className="text-[28px] md:text-[36px] font-black font-montserrat uppercase leading-none text-[#042638] tracking-wide">
              THẦN SỐ HỌC LÀ GÌ?
            </h2>
            <h3 className="text-[26px] md:text-[34px] font-black font-montserrat uppercase leading-none text-[#042638] tracking-wide mt-1.5">
              ĐỂ LÀM GÌ?
            </h3>
          </div>

          {/* 3 Columns Layout (Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            
            {/* Column 1: Earth & Vibration */}
            <div className="flex flex-col items-center text-center space-y-5">
              <p className="text-[14.5px] md:text-[15.5px] text-[#042638] leading-relaxed font-semibold">
                <span className="text-[#ff6600] font-black">VẠN VẬT</span> là sóng rung, <br />
                tần số năng lượng.
              </p>
              
              {/* Earth Image Frame */}
              <div className="w-[170px] h-[170px] rounded-full overflow-hidden bg-gradient-to-b from-[#e3f2fd] to-[#bbdefb] border border-blue-100 flex items-center justify-center p-1.5 shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&h=160&fit=crop" 
                  alt="Vibration Earth"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/150x150/e0f7fa/006064?text=Earth";
                  }}
                />
              </div>

              <div className="text-[13px] md:text-[14px] text-[#042638] font-medium leading-relaxed">
                <p>Sự có mặt – Thiếu – Kết hợp</p>
                <p>các con số</p>
                <p className="text-[#ff6600] font-bold mt-1">(NGÀY SINH + HỌ TÊN)</p>
              </div>
            </div>

            {/* Column 2: GPS Map & Discovery */}
            <div className="flex flex-col items-center text-center space-y-6 pt-4">
              <div className="space-y-1">
                <p className="text-[15.5px] md:text-[16.5px] font-black tracking-wide uppercase text-[#042638] font-montserrat">
                  TẤM BẢN ĐỒ GPS
                </p>
                <p className="text-[12px] font-bold text-gray-500">
                  (Góc nhìn của TSH)
                </p>
              </div>

              {/* Horizontal Arrow */}
              <svg className="w-8 h-8 text-[#ff6600]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              <div className="text-[13.5px] md:text-[14.5px] text-[#042638] font-medium leading-relaxed space-y-1">
                <p>Khám phá: Ưu – Nhược</p>
                <p>Xu hướng phát triển</p>
                <p className="text-[#ff6600] font-black tracking-wide uppercase mt-1">
                  ĐAM MÊ, SỞ TRƯỜNG,<br />SỢI CHỈ ĐỎ
                </p>
              </div>
            </div>

            {/* Column 3: Inner Growth & Shadow box */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="space-y-1">
                <p className="text-[15px] md:text-[16px] font-black text-[#042638]">
                  Trưởng thành từ bên trong
                </p>
                <p className="text-[15.5px] md:text-[17.5px] font-black text-[#ff6600] uppercase tracking-wide font-montserrat">
                  SỐNG CÓ GIÁ TRỊ - Ý NGHĨA
                </p>
              </div>

              {/* Arrow pointing up */}
              <svg className="w-6 h-6 text-[#ff6600] -rotate-90 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              {/* Orange Bordered Box with Shadow */}
              <div className="w-full max-w-[280px] bg-white border border-[#ff6600]/80 rounded-sm p-5 shadow-[4px_4px_0px_0px_#ff6600] text-left">
                <ul className="space-y-3.5">
                  {mapDetails.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[13px] md:text-[13.5px] text-[#042638] font-semibold leading-snug">
                      <span className="w-4 h-4 rounded-full bg-[#ff6600] text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 shadow-sm">
                        +
                      </span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
