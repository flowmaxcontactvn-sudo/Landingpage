import React from "react";

export default function Benefits() {
  const listData = [
    {
      num: "1",
      title: "1. Thấu hiểu chính mình",
      subtitle: "Ứng dụng thực tế ngay tại lớp",
      items: [
        <span><strong>ĐỊNH VỊ CHÍNH XÁC</strong> về giá trị của bản thân bạn</span>,
        <span>Hiểu về <strong>SỨ MỆNH CỦA BẠN</strong></span>,
        <span>Thấu hiểu dòng chảy <strong>4 CHẶNG CUỘC ĐỜI</strong></span>,
        <span>Biết cách thiết lập tấm bản đồ của bạn</span>,
        <span>Phản biện đa chiều, <strong>TRÁNH MÊ TÍN THÁI QUÁ</strong></span>,
        <span>Hiểu rõ <strong>ĐIỂM YẾU CẦN CẢI THIỆN</strong></span>,
        <span>Hiểu rõ <strong>ĐIỂM MẠNH CẦN PHÁT HUY</strong></span>,
        <span>Phương pháp đúc kết đơn giản giúp bạn tự luận bản đồ cho bản thân ngay tại lớp</span>
      ]
    },
    {
      num: "2",
      title: "2. Thấu hiểu vợ chồng, con cái",
      subtitle: "Xây dựng tổ ấm – Làm bạn cùng con",
      items: [
        <span>Thấu hiểu và <strong>GẮN KẾT NGƯỜI THÂN</strong> gia đình</span>,
        <span>Hiểu con và <strong>LÀM BẠN VỚI CON DỄ DÀNG</strong></span>,
        <span>HIỂU <strong>XU HƯỚNG TÍNH CÁCH VỢ CHỒNG</strong> <span className="text-[#042638]/70">➔ Tương tác hài hòa, hâm nóng tình yêu</span></span>,
        <span>Biết rõ điểm yếu cần phải chấp nhận của vợ chồng</span>,
        <span>Biết điểm mạnh cần phát huy của <strong>TỪNG ĐỨA CON để ĐỊNH HƯỚNG</strong> đào tạo <strong>PHÁT TRIỂN LÂU DÀI</strong></span>
      ]
    },
    {
      num: "3",
      title: "3. Thấu hiểu nhân sự + sếp",
      subtitle: "Sắp xếp đội ngũ đúng cách sẽ mạnh gấp 2",
      items: [
        <span>Thấu hiểu xu hướng tính cách của Nhân sự & Sếp</span>,
        <span>Hiểu <strong>CẤU TRÚC TÍNH CÁCH TRONG ĐỘI NGŨ:</strong> Sắp xếp, bổ sung & đào tạo nâng tầm phù hợp với từng tố chất</span>,
        <span>Hỗ trợ <strong>TUYỂN DỤNG ĐÚNG NGƯỜI ĐÚNG CHỨC NĂNG</strong></span>,
        <span>Tìm kiếm <strong>THỦ LĨNH TIỀM NĂNG CHO TỔ CHỨC</strong></span>
      ]
    },
    {
      num: "4",
      title: "4. THẦN SỐ HỌC với bảng trọng số và các vector cuộc đời",
      subtitle: "",
      items: [
        <span>Thấu hiểu <strong>TẦM QUAN TRỌNG CÁC CON SỐ BẬC THẦY</strong></span>,
        <span>Thấu hiểu <strong>2 HÀNH TRÌNH LINH HỒN</strong>, từ đó nhận diện lại bản thân xem đã đi đúng đường chưa?</span>,
        <span><strong>ĐỂ ĐƯỢC SỐNG LÀ CHÍNH MÌNH</strong>, để bạn mỉm cười an nhiên tự tại giữa dòng đời vội vã</span>,
        <span>Hiểu con cái và người thân <span className="text-[#042638]/70">➔</span> <strong>TRÁNH ÁP ĐẶT, BIẾT PHÁT HUY THẾ MẠNH MỖI NGƯỜI</strong></span>,
        <span>Phương pháp luận đơn giản giúp bạn tự xem được cho chính mình & người thân</span>,
        <span>Đấu nối <strong>Nhân Tướng Học</strong> để kiểm chứng lại kết quả <strong>Thần Số Học</strong></span>
      ]
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-white text-[#042638] font-sans">
      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4">
        
        {/* SECTION HEADER (Căn trái) */}
        <div className="text-left mb-12">
          <h2 className="text-[26px] md:text-[34px] font-black font-montserrat uppercase leading-none text-[#ff1a40] tracking-wide">
            GIÁ TRỊ KHÓA HỌC
          </h2>
          <h3 className="text-[28px] md:text-[36px] font-black font-montserrat uppercase leading-tight text-[#042638] tracking-wider mt-1.5">
            MANG LẠI:
          </h3>
        </div>

        {/* 2-COLUMNS MASONRY/GRID OF BENEFIT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {listData.map((box, boxIdx) => (
            <div 
              key={boxIdx} 
              className="bg-white border-[1.5px] border-[#042638]/40 rounded-xl p-6 md:p-8 shadow-[0_8px_30px_rgba(4,38,56,0.04)] relative overflow-hidden h-auto md:h-[460px] flex flex-col justify-between"
            >
              {/* LARGE BACKGROUND WATERMARK NUMBER */}
              <span className="absolute right-4 bottom-[-16px] text-[150px] font-black text-[#042638]/5 select-none pointer-events-none z-0 leading-none">
                {box.num}
              </span>

              {/* CARD TITLE & SUBTITLE */}
              <div className="relative z-10 mb-6">
                <h4 className="text-[18px] md:text-[20px] font-extrabold text-[#042638] font-montserrat leading-snug">
                  {box.title}
                </h4>
                {box.subtitle && (
                  <p className="text-[14.5px] md:text-[15.5px] font-bold text-[#042638]/70 mt-1">
                    {box.subtitle}
                  </p>
                )}
                {/* Underline divider */}
                <div className="w-16 h-[2px] bg-[#042638] mt-3" />
              </div>

              {/* LIST ITEMS */}
              <ul className="relative z-10 space-y-3.5 flex-grow">
                {box.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 text-[14px] md:text-[15px] leading-relaxed text-[#042638]/80 font-medium">
                    {/* Small red circle dot icon matching BKE style */}
                    <span className="w-[18px] h-[18px] rounded-full bg-[#ff1a40] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-sm shadow-[#ff1a40]/20">
                      ✓
                    </span>
                    <span className="flex-grow">{item}</span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
