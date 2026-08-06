import React from "react";

export default function CourseIntro() {
  const handleScrollToRegister = (e) => {
    e.preventDefault();
    const target = document.getElementById("register");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="course-intro" className="relative py-12 md:py-16 bg-[#042638] text-white font-sans overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-radial from-blue-500/10 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-radial from-[#ff1a40]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-[780px] mx-auto px-6 max-[680px]:px-4 relative z-10 text-center flex flex-col items-center">
        
        {/* Badge: Khóa học */}
        <div className="inline-block bg-[#042638] border border-white rounded-sm px-4 py-1 mb-4">
          <span className="text-[12px] md:text-[13px] font-black tracking-[0.2em] text-white uppercase font-montserrat">
            KHÓA HỌC
          </span>
        </div>

        {/* Title: Thần Số Học 3 Gốc */}
        <h2 className="text-[clamp(32px,5.2vw,56px)] font-black tracking-wide leading-tight font-montserrat uppercase mb-3">
          <span className="text-[#ff1a40] drop-shadow-[0_2px_10px_rgba(255,26,64,0.25)] mr-3.5">
            THẦN SỐ HỌC
          </span>
          <span className="text-white">
            3 GỐC
          </span>
        </h2>

        {/* Mini Badge: Phiên bản Offline */}
        <div className="inline-flex items-center gap-1.5 bg-white border border-white rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <svg className="w-4 h-4 text-[#042638]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="text-[11.5px] md:text-[12.5px] font-black text-[#042638] uppercase font-montserrat">
            Phiên bản OFFLINE
          </span>
        </div>

        {/* Headline callout box (Viền trắng, nền xanh thẫm) */}
        <div className="w-full max-w-[620px] border border-white/30 bg-[#031d2b]/60 rounded-lg p-5 mb-8 shadow-inner">
          <p className="text-[16px] md:text-[19px] font-bold leading-relaxed font-sans">
            Ứng dụng và <span className="text-[#ff1a40]">xem thực tế</span> ngay tại lớp <br />
            cùng thầy Trần Việt Quân
          </p>
        </div>

        {/* Descriptions text */}
        <p className="text-[15px] md:text-[16.5px] text-white/90 leading-relaxed font-sans max-w-[700px] mx-auto mb-8 text-center">
          Khám phá tiềm năng trong bạn qua công cụ <span className="text-[#ff1a40] font-bold">Thần Số Học và những Đúc Kết giải pháp trên nền tảng 3 GỐC.</span> Được thầy Trần Việt Quân đúc kết cốt lõi &amp; ứng dụng trong công việc &amp; cuộc sống
        </p>

        {/* Pythagoras Card */}
        <div className="w-full max-w-[420px] bg-[#f4f6f8] text-[#042638] rounded-xl p-5 mb-10 flex items-center gap-4 shadow-lg border border-white/10 text-left relative overflow-hidden group">
          <div className="w-[80px] h-[80px] shrink-0 rounded-full overflow-hidden bg-white border border-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&h=120&fit=crop" 
              alt="Pythagoras Sketch" 
              className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "https://placehold.co/100x100/eeeeee/666666?text=Pythagoras";
              }}
            />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[16.5px] font-black font-montserrat tracking-wide uppercase">
              THẦN SỐ HỌC
            </h4>
            <p className="text-[12px] font-bold text-gray-500 italic">
              - Pythagoras -
            </p>
            <p className="text-[13px] md:text-[13.5px] font-semibold text-gray-700 leading-snug">
              Có được tấm bản đồ về hành trình cuộc đời
            </p>
          </div>
          {/* Subtle light effect */}
          <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>

        {/* CTA Button */}
        <div className="mb-14">
          <a
            href="#register"
            onClick={handleScrollToRegister}
            className="inline-flex items-center justify-center bg-gradient-to-r from-[#cc0e48] to-[#ff1a40] hover:from-[#e61253] hover:to-[#ff3b5c] text-white font-black font-montserrat uppercase tracking-wider rounded-full shadow-[0_5px_35px_rgba(255,26,64,0.45)] hover:shadow-[0_8px_40px_rgba(255,26,64,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 px-16 py-4.5 text-[16px] md:text-[18px]"
          >
            ĐĂNG KÝ NGAY ➔
          </a>
        </div>

        {/* Double-bordered Stats Box */}
        <div className="w-full max-w-[660px] border-[5px] border-double border-white rounded-xl p-6 md:p-8 bg-[#042638] text-left relative z-10 mb-16 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-6 items-center pb-6 border-b border-white/20">
            {/* Left Stat */}
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:align-start">
              <span className="text-[52px] md:text-[64px] font-black text-[#ff1a40] font-montserrat leading-none tracking-tight">
                20
              </span>
              <p className="text-[13px] md:text-[14px] font-bold text-white leading-snug">
                Khóa học Online<br />
                <span className="text-[#ff1a40]">(Đọc Vị Bất Kỳ Ai)</span> đã<br />
                được tổ chức
              </p>
            </div>
            
            {/* Right Stat */}
            <div className="flex items-center gap-4 sm:border-l sm:border-white/20 sm:pl-6 max-[480px]:flex-col max-[480px]:align-start">
              <span className="text-[52px] md:text-[64px] font-black text-[#ff1a40] font-montserrat leading-none tracking-tight">
                &gt;19.310
              </span>
              <p className="text-[13px] md:text-[14px] font-bold text-white leading-snug">
                Học viên tham gia<br />
                lớp học trực tuyến<br />
                qua Zoom
              </p>
            </div>
          </div>

          {/* Under-stat special announcement */}
          <div className="pt-6 space-y-2 text-center sm:text-left">
            <p className="text-[#ff1a40] text-[15px] md:text-[16px] font-black uppercase tracking-wider">
              PHIÊN BẢN ĐẶC BIỆT!!! Lần đầu tiên được tổ chức Offline 1 ngày
            </p>
            <p className="text-white text-[14px] md:text-[15px] font-bold">
              Ứng dụng và <span className="text-[#ff1a40] font-black">Xem trực tiếp ngay tại lớp</span> cùng thầy Trần Việt Quân
            </p>
          </div>
        </div>

      </div>

      {/* OVERLAY CLASSROOM CROWDED BACKGROUND AT THE BOTTOM */}
      <div className="absolute bottom-0 left-0 w-full h-[400px] z-0 select-none pointer-events-none overflow-hidden">
        {/* Grayscale overlay image with teal tint */}
        <img 
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop" 
          alt="Classroom Crowd" 
          className="w-full h-full object-cover grayscale brightness-[0.25] contrast-[1.1] opacity-35"
        />
        {/* Top fading gradient overlay to blend seamlessly */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#042638] to-transparent" />
      </div>

      {/* Quote card positioned on top of the crowd background */}
      <div className="max-w-[700px] mx-auto px-6 relative z-10 mt-6">
        <div className="bg-white rounded-xl p-5 md:p-6 shadow-xl border border-gray-100 text-left relative overflow-hidden flex gap-4 max-[480px]:flex-col">
          {/* Quote symbol mark */}
          <span className="text-[64px] font-black text-[#ff1a40]/10 leading-none shrink-0 select-none font-montserrat">
            “
          </span>
          <p className="text-[13.5px] md:text-[14.5px] font-semibold text-gray-700 italic leading-relaxed pt-1.5">
            Rất nhiều người đã tìm thấy được chính mình, đánh thức quá trình học hỏi, rèn luyện và có được những sự chuyển hoá sâu sắc, mạnh mẽ.
          </p>
        </div>
      </div>

    </section>
  );
}
