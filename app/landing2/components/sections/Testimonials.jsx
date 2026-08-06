import React, { useState } from "react";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(1);

  const videoTestimonials = [
    {
      name: "Anh Tuấn Anh",
      desc: "Khóa học vô cùng thực tế, giúp tôi thấu hiểu sâu sắc bản thân và định hình được định hướng nghề nghiệp tương lai dựa trên 3 gốc rễ cốt lõi.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      fallbackText: "Học Viên 1"
    },
    {
      name: "Chị Thủy Tiên",
      desc: "Em đã hiểu sâu sắc hơn về bộ môn thần số học. Trước đây mình chỉ biết mình gặt những quả gì sau khi xem TSH, nhưng nay mình biết cần làm gì để vun bồi những quả đó trổ nhanh hơn, nhiều hơn.",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=250&fit=crop",
      fallbackText: "Chị Thủy Tiên"
    },
    {
      name: "Chị Mai Phương",
      desc: "Tìm ra được sứ mệnh cuộc đời, thấu hiểu chồng con để từ đó giao tiếp và đồng hành cùng gia đình một cách hòa hợp, thấu hiểu và hạnh phúc hơn.",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=250&fit=crop",
      fallbackText: "Học Viên 3"
    }
  ];

  const feedbackList = [
    // Column 1
    [
      {
        name: "Ngọc Diệp Phan",
        time: "1 tháng trước",
        avatar: "N",
        color: "bg-blue-500",
        content: (
          <span>
            Khóa học cung cấp một bức tranh tổng quát về các công cụ thông dụng và hữu ích để có thể đánh giá tương đối chính xác bất cứ ai. Nhưng đánh giá không phải là để phán xét họ, mà là để hiểu (những điểm mạnh, điểm yếu) để rồi thương họ và đối xử với họ theo cách mà họ mong muốn. Điều tuyệt vời là các kiến thức học được rất thực tế, mình có thể áp dụng và luyện tập các công cụ này mọi nơi, mọi lúc. Trước tiên là với chính mình để thấu hiểu bản thân trước, rèn mình theo hướng tăng cường 3 gốc, loại bỏ dần 3 độc, rồi tiếp đến cho những người thân trong gia đình, với đồng nghiệp, kể cả với bất kỳ ai mình gặp trên đường. Các mối quan hệ của mình được cải thiện rõ rệt, khả năng kết nối cao hơn, tâm trí an nhiên hơn. Vô cùng biết ơn thầy Trần Việt Quân và đội ngũ BTC đã trao đi thật nhiều giá trị cho các học viên ạ!
          </span>
        )
      },
      {
        name: "Vũ diện",
        time: "1 tuần trước",
        avatar: "V",
        color: "bg-orange-400",
        content: (
          <span>
            Khóa học giúp mình hiểu hơn bản thân mình mà không dính mắc. Biết cách đọc vị mà hướng theo 3 gốc. Tâm bình an hơn cảm nhận được sự tâm huyết của thầy và ban tổ chức. Cảm thấy kết nối, sẻ chia.
          </span>
        )
      },
      {
        name: "Thiện",
        time: "1 tháng trước",
        avatar: "T",
        color: "bg-teal-500",
        content: (
          <span>
            Cám ơn Thầy Quân và BTC rất nhiều, một khóa học thật nhiều giá trị!
          </span>
        )
      }
    ],
    // Column 2
    [
      {
        name: "Tuyết Lê",
        time: "3 tuần trước",
        avatar: "T",
        color: "bg-amber-500",
        content: (
          <span>
            Ước gì tôi có thể biết đến khoá học này sớm hơn! Biết ơn Thầy và BTC đã giúp tôi hiểu được mình, hiểu được mọi người.
          </span>
        )
      },
      {
        name: "Nhung",
        time: "2 tuần trước",
        avatar: "N",
        color: "bg-pink-500",
        content: (
          <span>
            Điều quan trọng nhất là phải hiểu để sửa chính mình thay vì cứ đi sửa người khác. Khoá học đọc vị giúp tôi hiểu được 3 bộ công cụ quyền năng nên bên ngoài: thần số học, DISC và nhân tướng học. Nhờ 3 công cụ này mà tôi thấu hiểu được tính cách của chính mình, những ưu điểm, nhược điểm để lên kế hoạch rèn luyện. <u>Tôi không còn hoang mang, mê tín chạy theo những thứ bên ngoài. Tôi cũng hiểu được mọi người xung quanh, đặc biệt hiểu con để định hướng và phát huy tiềm năng của con.</u> Biết ơn thầy và BTC đã tổ chức khoá học tuyệt vời này.
          </span>
        )
      },
      {
        name: "Ngân",
        time: "1 tháng trước",
        avatar: "N",
        color: "bg-purple-500",
        content: (
          <span>
            Khóa học ý nghĩa nhiều giá trị, <u>công cụ tuyệt vời giúp thấu hiểu bản thân và áp dụng rất giá trị trong cuộc sống và công việc.</u>
          </span>
        )
      },
      {
        name: "Ngô Thanh",
        time: "2 tháng trước",
        avatar: "N",
        color: "bg-indigo-500",
        content: (
          <span>
            Khóa học là Đọc vị bất kỳ ai, nhưng sau khi học xong thì là <u>Đọc vị bản thân là một điều hết sức thú vị!</u> Cám ơn BKE rất nhiều!
          </span>
        )
      }
    ],
    // Column 3
    [
      {
        name: "TranLinh",
        time: "1 tháng trước",
        avatar: "T",
        color: "bg-[#1a7f92]",
        content: (
          <span>
            Những công cụ tuyệt vời giúp đọc vị bản thân và người khác. Cam kết xây dựng cộng đồng đọc vị 3 gốc. Biết ơn thầy và BTC
          </span>
        )
      },
      {
        name: "Xuân Hồng",
        time: "3 tuần trước",
        avatar: "X",
        color: "bg-emerald-600",
        content: (
          <span>
            Đọc Vị Bất Kỳ Ai, <u>một khóa học cực kỳ giá trị để phát triển bản thân theo chiều sâu.</u>
          </span>
        )
      },
      {
        name: "Huyền quan sát",
        time: "1 tháng trước",
        avatar: "H",
        color: "bg-amber-600",
        content: (
          <span>
            Khóa học thực sự rất giá trị, mình đã hiểu được 3 độc, 3 gốc để <u>hiểu mình, hiểu người</u> sâu sắc hơn. Biết ơn Thầy Trần Việt Quân và BTC đã tạo ra khoá học tuyệt vời với này!
          </span>
        )
      },
      {
        name: "Huyền Trang",
        time: "1 tháng trước",
        avatar: "H",
        color: "bg-[#ff6600]",
        content: (
          <span>
            Khoá học đã mang lại nhiều giá trị sâu sắc cho bản thân, hiểu về mình, hiểu người mà không dính mắc. Biết ơn Thầy và BTC rất nhiều ạ!
          </span>
        )
      },
      {
        name: "Mạnh",
        time: "2 tuần trước",
        avatar: "M",
        color: "bg-rose-500",
        content: (
          <span>
            sau khi học bộ môn Đọc Vị Bất Kỳ Ai, có công cụ Thần Số Học, DISC, Nhân Tướng học <u>mình đã hiểu được mình hơn, đọc được vị của người khác</u>, thật giá trị và nhiều lợi lạc. Cám ơn thầy và BTC đã tạo ra khoá học vô cùng ý nghĩa 💖
          </span>
        )
      }
    ]
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % videoTestimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-white text-[#042638] font-sans border-t border-[#eee] relative">
      <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4">
        
        {/* HEADER SECTION */}
        <div className="text-center flex flex-col items-center mb-16">
          <div className="inline-block border-[1.5px] border-[#042638] rounded-sm px-4 py-1 mb-4 select-none">
            <span className="text-[12px] md:text-[13px] font-black tracking-[0.2em] text-[#042638] uppercase font-montserrat">
              CẢM NHẬN
            </span>
          </div>
          <h2 className="text-[clamp(28px,4.5vw,48px)] font-black tracking-wide leading-none font-montserrat uppercase">
            <span className="text-[#ff1a40] mr-3">HỌC VIÊN</span>
            <span className="text-[#042638]">TỪ CÁC KHÓA ONLINE</span>
          </h2>
        </div>

        {/* PART 1: VIDEO CAROUSEL */}
        <div className="relative w-full max-w-[800px] mx-auto mb-20">
          
          <div className="flex justify-between items-center gap-6 overflow-hidden py-6">
            
            {/* Left Prev Card (Half Visible on desktop) */}
            <div 
              className="w-[180px] shrink-0 opacity-40 blur-[1px] rounded-2xl overflow-hidden shadow-sm aspect-video hidden md:block cursor-pointer transform hover:scale-[1.02] transition-all"
              onClick={handlePrev}
            >
              <img 
                src={videoTestimonials[(activeIndex - 1 + videoTestimonials.length) % videoTestimonials.length].img} 
                alt="Prev Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center Active Card */}
            <div className="flex-grow max-w-[420px] mx-auto aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-250 relative group bg-black">
              <img 
                src={videoTestimonials[activeIndex].img} 
                alt={videoTestimonials[activeIndex].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.src = `https://placehold.co/400x250/fff3f3/e30a0a?text=${videoTestimonials[activeIndex].fallbackText}`;
                }}
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-colors">
                <div className="w-14 h-14 rounded-full bg-[#ff1a40] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Next Card (Half Visible on desktop) */}
            <div 
              className="w-[180px] shrink-0 opacity-40 blur-[1px] rounded-2xl overflow-hidden shadow-sm aspect-video hidden md:block cursor-pointer transform hover:scale-[1.02] transition-all"
              onClick={handleNext}
            >
              <img 
                src={videoTestimonials[(activeIndex + 1) % videoTestimonials.length].img} 
                alt="Next Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>

          </div>

          {/* Left Arrow Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-[-16px] md:left-[-32px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-[#042638] border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-transform cursor-pointer z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button 
            onClick={handleNext}
            className="absolute right-[-16px] md:right-[-32px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-[#042638] border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-transform cursor-pointer z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Description of Active Video testimonial */}
          <div className="text-center mt-6 max-w-[600px] mx-auto space-y-2">
            <h4 className="text-[19px] md:text-[21px] font-black font-montserrat text-[#042638] border-b-2 border-[#ff1a40] inline-block pb-1">
              {videoTestimonials[activeIndex].name}
            </h4>
            <p className="text-[14.5px] md:text-[15.5px] font-semibold text-gray-700 leading-relaxed font-sans pt-2">
              {videoTestimonials[activeIndex].desc}
            </p>
          </div>

        </div>

        {/* PART 2: CHAT/FACEBOOK SCREENSHOTS GRID (3 Columns Masonry layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {feedbackList.map((col, colIdx) => (
            <div key={colIdx} className="space-y-6">
              {col.map((card, cardIdx) => (
                <div 
                  key={cardIdx} 
                  className="bg-white border border-[#042638]/10 rounded-xl p-5 shadow-[0_5px_20px_rgba(4,38,56,0.03)] hover:shadow-[0_8px_30px_rgba(4,38,56,0.06)] hover:border-[#042638]/20 transition-all text-left space-y-4"
                >
                  
                  {/* User Profile Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full ${card.color} text-white font-black text-[14px] flex items-center justify-center shadow-inner`}>
                        {card.avatar}
                      </div>
                      <div className="leading-none space-y-0.5">
                        <span className="font-extrabold text-[14.5px] text-[#042638] font-montserrat">{card.name}</span>
                        <span className="block text-[11px] font-semibold text-gray-400">{card.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-[13px] md:text-[13.5px] text-gray-600 leading-relaxed font-medium font-sans">
                    {card.content}
                  </p>

                  {/* Actions Bar like Facebook */}
                  <div className="pt-2 border-t border-gray-100 flex gap-4 text-[11.5px] font-bold text-gray-400 select-none">
                    <button className="hover:text-[#ff1a40] transition-colors cursor-pointer">Trả lời</button>
                    <button className="hover:text-[#ff1a40] transition-colors cursor-pointer">Chia sẻ</button>
                  </div>

                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
