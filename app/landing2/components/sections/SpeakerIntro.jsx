import React from "react";

export default function SpeakerIntro() {
  const speakerDetails = [
    "25 năm nghiên cứu về nhân tướng, nhân sự, quản trị, Phật giáo & triết học phương Đông",
    "Nhà sáng lập và cố vấn hệ thống trường liên cấp Tuệ Đức (Pathway)",
    "Nhà sáng lập Bách Khoa Education, đưa đạo lý 3 gốc Đạo đức – Trí tuệ - Nghị lực đi khắp Việt Nam",
    "Sáng lập viên câu lạc bộ \"Dạy con nên người\"",
    "Chia sẻ giá trị cốt lõi trong giáo dục cho Sở Giáo Dục các tỉnh"
  ];

  return (
    <section id="speaker-intro" className="relative py-12 md:py-16 bg-[#021420] bg-[url('/landing2/speaker-bg.jpg')] bg-cover bg-center text-white font-sans overflow-hidden border-t border-white/5">
      {/* Import Font viết tay Caveat độc lập đề phòng */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        .font-handwriting {
          font-family: 'Caveat', cursive;
        }
      `}</style>

      {/* Decorative Glow */}
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-radial from-blue-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-radial from-amber-500/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4 relative z-10">
        
        {/* ========================================================
            PART 1: TWO COLUMNS SHARING TEXT
           ======================================================== */}
        <div className="space-y-6 mb-16 text-left">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-[28px] md:text-[36px] font-black font-montserrat uppercase tracking-wide leading-none">
              Đôi điều chia sẻ về tôi
            </h2>
            <p className="text-[17px] md:text-[19px] font-bold italic text-white/80">
              Chào bạn!
            </p>
          </div>

          {/* Two columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[14.5px] md:text-[15.5px] leading-relaxed text-white/90 font-medium">
            
            {/* Left Column */}
            <div className="space-y-5">
              <p>
                Có bao giờ bạn thấy lạc lõng chênh vênh, lạc đường, mất định hướng? Có bao giờ bạn giận hờn vô cớ, cãi nhau với đồng nghiệp, gây gỗ với vợ/chồng, bất lực với con cái? Có bao giờ bạn tự hỏi giá trị sâu sắc nhất trong cuộc đời mình là gì? Chính tôi cũng từng trải qua những cảm giác đó. Và tôi đã đi tìm suốt 20 năm cho câu trả lời, bằng việc nghiên cứu, bằng kinh nghiệm qua nhiều doanh nghiệp với nhiều vị trí khác nhau, từ làm thuê, khởi nghiệp cho đến làm chủ.
              </p>
              <p>
                Tôi đã chia sẻ, gặp gỡ và tư vấn cho hàng nghìn con người... và cuối cùng tôi đã tìm thấy con đường thật sự để giải quyết tất cả những điều trên, giúp tôi tìm ra được ý nghĩa sâu sắc của cuộc đời mình.
              </p>
              <p>
                Khi bạn có được sự hiểu biết đúng đắn, rõ ràng và sâu sắc, cái hiểu chân chính và đa chiều. Đặc biệt sự hiểu biết dựa trên nền quy luật quyền năng nhất vũ trụ – Luật Nhân Quả và Duyên Khởi.
              </p>
            </div>

            {/* Right Column */}
            <div className="space-y-5 flex flex-col justify-between">
              <p>
                Khi đó bạn sẽ bạn hiểu rõ mình cần làm gì để vượt qua mọi cám dỗ của cuộc sống, và quan trọng nhất là chiến thắng chính bản thân mình. Dù chúng ta làm nghề gì đi chăng nữa thì chúng ta chỉ có một cuộc đời để sống.
              </p>

              {/* Quote box matching template (white thin border, transparent dark background) */}
              <div className="bg-[#031d2b]/40 border border-white/40 rounded-lg p-5 flex items-start gap-4 shadow-inner relative overflow-hidden">
                <p className="font-extrabold text-white text-[14px] md:text-[15px] leading-relaxed flex-grow relative z-10">
                  Chúng ta không được chọn hoàn cảnh khi sinh ra, nhưng được quyền tạo dựng một nhân cách sống.
                </p>
                <span className="text-[48px] font-black text-white/20 leading-none select-none font-montserrat shrink-0">
                  ”
                </span>
              </div>

              <p>
                Vậy bạn chọn sống một cuộc đời như thế nào là do bạn? Tôi mong muốn cống hiến và lan tỏa giá trị của con đường này đến nhiều người hơn nữa. Để mỗi ngày sống là một niềm vui và ý nghĩa.
              </p>
              <p>
                Bạn cùng tôi chung tay lan tỏa để chúng ta cùng xây dựng một gia đình lớn.
              </p>
              <p className="text-[#ff9800] font-black text-[15px] md:text-[16px] uppercase tracking-wide text-right">
                “Cộng đồng sống Tử Tế và cống hiến hết mình”
              </p>
            </div>

          </div>

        </div>

        {/* ========================================================
            PART 2: PORTRAIT & BIO WHITE CARD (Aligned Grid Overlay)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] items-end w-full pt-10 relative">
          
          {/* Left Side: Speaker Portrait Placeholder (Large size aligned left) */}
          <div className="relative w-full max-w-[280px] z-0 max-[767px]:mx-auto max-[767px]:mb-6">
            <div className="w-full h-[350px] bg-gradient-to-t from-[#062c45] to-[#0c446b] rounded-2xl border border-white/15 flex flex-col items-center justify-center text-center p-4 shadow-xl overflow-hidden group">
              <svg className="w-16 h-16 text-white/30 mb-2 group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[12px] font-black text-white/40 uppercase tracking-widest leading-snug">
                Ảnh Thầy Quân<br />(Cung cấp sau)
              </span>
              <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </div>
          </div>

          {/* Right Side: Bio White Card (Overlapping image on Desktop, extending to the right edge) */}
          <div className="w-full md:-ml-12 relative z-10 flex flex-col items-start gap-4 mb-4 text-left">
            
            {/* White card info box */}
            <div className="bg-white text-[#042638] rounded-xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 w-full">
              <h3 className="text-[20px] md:text-[23px] font-black font-montserrat tracking-wide mb-5">
                Thầy Trần Việt Quân
              </h3>

              <ul className="space-y-4">
                {speakerDetails.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[13.5px] md:text-[14px] leading-relaxed text-gray-700 font-semibold">
                    {/* Small orange circular plus icon */}
                    <span className="w-[18px] h-[18px] rounded-full bg-[#ff9800] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-sm">
                      +
                    </span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature quotes beneath the white card */}
            <div className="pt-2 w-full pl-6 max-[767px]:text-center">
              <p className="font-handwriting text-[#ff9800] text-[34px] md:text-[40px] leading-none py-1 rotate-[-2deg] inline-block font-bold">
                Hãy sống và lan tỏa điều tử tế!
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
