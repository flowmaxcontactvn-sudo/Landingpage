import React from "react";

export default function TargetAudience() {
  const audienceList = [
    {
      num: "1.",
      text: (
        <span>
          Muốn <strong>thấu hiểu chính mình &amp; đọc vị những người xung quanh</strong> (người thân - bạn bè - đối tác...)
        </span>
      ),
      img: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=250&fit=crop",
      fallbackText: "Lonely Góc Tối"
    },
    {
      num: "2.",
      text: (
        <span>
          <strong>Chọn đúng nghề nghiệp</strong> - Tránh chọn nhầm, <strong>bế tắc, hoang mang</strong> trong cuộc sống
        </span>
      ),
      img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=250&fit=crop",
      fallbackText: "Stress Công Việc"
    },
    {
      num: "3.",
      text: (
        <span>
          Hay <strong>nóng giận, bị cảm xúc giật dây, mất kết nối</strong> trong các mối quan hệ mà không hiểu tại sao
        </span>
      ),
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=250&fit=crop",
      fallbackText: "Mất Kết Nối"
    },
    {
      num: "4.",
      text: (
        <span>
          Muốn <strong>học tập nâng tầm bản thân</strong>, trở thành phiên bản tốt nhất của chính mình
        </span>
      ),
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      fallbackText: "Nâng Tầm Bản Thân"
    },
    {
      num: "5.",
      text: (
        <span>
          Chưa hiểu <strong>xu hướng, tính cách điểm mạnh - điểm yếu - đam mê</strong> của bản thân
        </span>
      ),
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
      fallbackText: "Chưa Hiểu Bản Thân"
    },
    {
      num: "6.",
      text: (
        <span>
          Muốn <strong>thấu hiểu nhân sự, có giải pháp</strong> đột phá để xây dựng đội ngũ gắn kết &amp; <strong>đúng người - đúng vị trí</strong>. Muốn <strong>thấu hiểu chính mình &amp; đọc vị</strong> những người xung quanh
        </span>
      ),
      img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop",
      fallbackText: "Xây Dựng Đội Ngũ"
    }
  ];

  return (
    <section id="target-audience" className="pt-12 pb-16 bg-white text-[#042638] font-sans border-t border-[#eee]">
      <div className="max-w-[780px] mx-auto px-6 max-[680px]:px-4">
        
        {/* HEADER (Căn trái) */}
        <div className="text-left mb-10">
          <h2 className="text-[26px] md:text-[34px] font-black font-montserrat uppercase leading-none text-[#042638] tracking-wide">
            KHÓA HỌC
          </h2>
          <h3 className="text-[28px] md:text-[36px] font-black font-montserrat uppercase leading-tight text-[#ff1a40] tracking-wider mt-1.5">
            DÀNH CHO NHỮNG AI:
          </h3>
        </div>

        {/* LIST OF ROWS */}
        <div className="divide-y divide-[#042638]/10 border-t border-b border-[#042638]/10">
          {audienceList.map((item, idx) => (
            <div 
              key={idx} 
              className="py-6 flex items-center justify-between gap-8 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-4"
            >
              {/* Left Column: Number & Text Content */}
              <div className="flex items-start gap-4 flex-grow">
                <span className="text-[36px] md:text-[44px] font-black text-[#ff1a40] font-montserrat leading-none shrink-0 min-w-[45px]">
                  {item.num}
                </span>
                <p className="text-[15px] md:text-[16.5px] leading-relaxed text-[#042638]/90 font-medium pt-1 font-sans text-left">
                  {item.text}
                </p>
              </div>

              {/* Right Column: Image */}
              <div className="w-[180px] h-[110px] shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-[680px]:w-full max-[680px]:h-[160px]">
                <img 
                  src={item.img} 
                  alt={`Dành cho đối tượng ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/400x250/fff3f3/e30a0a?text=${item.fallbackText}`;
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CALLOUT BOX */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white border-[1.5px] border-[#042638] px-8 py-3.5 rounded-sm shadow-[4px_4px_0px_0px_#042638] font-bold text-[15px] md:text-[17px] text-[#042638] font-montserrat tracking-wide select-none">
            Chìa khóa để tháo gỡ những vấn đề trên 👇
          </div>
        </div>

      </div>
    </section>
  );
}
