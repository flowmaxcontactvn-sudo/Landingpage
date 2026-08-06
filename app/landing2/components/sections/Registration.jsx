import React, { useState, useEffect } from "react";

export default function Registration() {
  // State cho số lượng vé
  const [ticketCount, setTicketCount] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invoiceInfo, setInvoiceInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Countdown timer cho TP.HCM (Khai giảng 18/08/2026)
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 12,
    minutes: 39,
    seconds: 27
  });

  useEffect(() => {
    const targetDate = new Date("2026-08-12T13:30:00");
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Tính toán giá vé dựa trên số lượng
  let pricePerTicket = 499000;
  let activeTier = 1; // 1: 499k, 2: 449k, 3: 399k

  if (ticketCount >= 5) {
    pricePerTicket = 399000;
    activeTier = 3;
  } else if (ticketCount >= 3) {
    pricePerTicket = 449000;
    activeTier = 2;
  }

  const totalPrice = ticketCount * pricePerTicket;

  const handleIncrement = () => {
    setTicketCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };

  const formatPrice = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Vui lòng nhập Họ tên và Số điện thoại!");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch("/api/dang-ky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          location: "Hà Nội",
          ticketCount,
          totalPrice,
          invoiceInfo,
          campaignId: typeof window !== "undefined" ? window.location.search : ""
        })
      });

      if (res.ok) {
        setSubmitMessage("Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
        setName("");
        setEmail("");
        setPhone("");
        setInvoiceInfo("");
        setTicketCount(1);
      } else {
        setSubmitMessage("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setSubmitMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const padZero = (num) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <section id="register" className="relative pt-6 pb-12 md:pt-8 md:pb-16 bg-[#042638] text-white font-sans border-t border-white/5">
      
      {/* MINI TOP BAR HEADER */}
      <div className="w-full border-b border-white/10 pb-3 mb-5">
        <div className="max-w-[1040px] mx-auto px-6 flex justify-between items-center max-[640px]:flex-col max-[640px]:gap-4">
          {/* Left: Brand */}
          <div className="text-left font-montserrat font-black text-[15px] md:text-[17px] tracking-wide uppercase">
            <span className="text-[#ff1a40] drop-shadow-[0_2px_8px_rgba(255,26,64,0.2)]">THẦN SỐ HỌC</span> <span className="text-white">3 GỐC</span>
          </div>
          
          {/* Middle: Schedule (Hanoi only) */}
          <div className="text-center flex flex-col items-center">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest leading-none">Hà Nội</span>
            <span className="text-[14px] md:text-[15.5px] font-black text-[#ff9800] font-montserrat mt-1 block">06/08/2026</span>
          </div>

          {/* Right: CTA Button */}
          <div>
            <a 
              href="#registration-form"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById("registration-form");
                if (target) target.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#cc0e48] to-[#ff1a40] text-white font-black text-[12.5px] md:text-[13.5px] font-montserrat uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md shadow-[#ff1a40]/25 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              ĐĂNG KÝ NGAY ➔
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[780px] mx-auto px-6 max-[680px]:px-4 flex flex-col items-center">
        
        {/* HEADER SECTION */}
        <div className="text-center flex flex-col items-center mb-10">
          <div className="inline-block bg-[#042638] border border-white rounded-sm px-4 py-1 mb-4">
            <span className="text-[12px] md:text-[13px] font-black tracking-[0.2em] text-white uppercase font-montserrat">
              KHÓA HỌC
            </span>
          </div>
          <h2 className="text-[clamp(32px,5.2vw,56px)] font-black tracking-wide leading-tight font-montserrat uppercase mb-3 text-center">
            <span className="text-[#ff1a40] mr-3">THẦN SỐ HỌC</span>
            <span className="text-white">3 GỐC</span>
          </h2>
          <div className="inline-flex items-center gap-1.5 bg-white border border-white rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-[11.5px] md:text-[12.5px] font-black text-[#042638] uppercase font-montserrat">
              Phiên bản OFFLINE
            </span>
          </div>
        </div>

        {/* SUB HEADER BOX */}
        <div className="w-full max-w-[620px] border border-white/30 bg-[#031d2b]/60 rounded-lg p-5 mb-10 text-center">
          <p className="text-[15.5px] md:text-[18px] font-bold leading-relaxed">
            Ứng dụng và xem thực tế ngay tại lớp <br />
            cùng thầy Trần Việt Quân
          </p>
        </div>

        {/* LOCATION CARD - HANOI ONLY */}
        <div className="w-full max-w-[460px] bg-[#fff9e6] text-[#042638] rounded-2xl p-6 md:p-8 shadow-xl border border-[#ffb300]/20 flex flex-col items-center text-center relative mb-12">
          
          {/* Tag: Tại Hà Nội */}
          <div className="bg-[#ff9800] text-white font-black text-[17px] md:text-[18.5px] tracking-wide uppercase px-6 py-2.5 rounded-sm shadow-md font-montserrat absolute top-0 -translate-y-1/2">
            Tại HÀ NỘI
          </div>

          <div className="space-y-6 w-full pt-4">
            {/* Address */}
            <div className="flex items-start gap-3 text-left">
              <svg className="w-5.5 h-5.5 text-[#ff9800] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[15.5px] md:text-[17px] font-black leading-snug text-[#042638]">Viện đào tạo bách khoa HN, KĐT Thanh Hà, Cự Khê, Thanh Oai, Hà Nội</span>
            </div>

            {/* Time & Khai Giảng */}
            <div className="flex items-start gap-3 text-left">
              <svg className="w-5.5 h-5.5 text-[#ff9800] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-[16px] md:text-[17px] font-black text-[#042638] space-y-0.5">
                <p>13h30 - 21h00</p>
                <p>Khai giảng: <span className="text-[#ff1a40] font-black tracking-wide">06/08/2026</span></p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex justify-center gap-3.5 py-1">
              {[
                { label: "Ngày", val: timeLeft.days },
                { label: "Giờ", val: timeLeft.hours },
                { label: "Phút", val: timeLeft.minutes },
                { label: "Giây", val: timeLeft.seconds }
              ].map((t, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-[58px] h-[52px] rounded-lg bg-[#ff9800] text-white font-black text-[24px] md:text-[26px] font-montserrat flex items-center justify-center shadow-md">
                    {padZero(t.val)}
                  </div>
                  <span className="text-[11px] md:text-[12px] font-black text-[#042638]/80 mt-1 uppercase tracking-wider">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 justify-center border-t border-[#ff9800]/20 pt-5">
              <svg className="w-5.5 h-5.5 text-[#ff9800] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-left leading-none">
                <span className="text-[13px] md:text-[14px] font-black text-gray-500 block uppercase tracking-wider">Học phí:</span>
                <span className="text-[32px] md:text-[36px] font-black text-[#ff9800] font-montserrat tracking-wide">{formatPrice(499000)}</span>
              </div>
            </div>

            {/* Card CTA */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById("registration-form");
                if (target) target.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full bg-[#ff9800] hover:bg-[#e65100] text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-[#ff9800]/20 active:scale-[0.98] transition-all cursor-pointer text-[16px] md:text-[17.5px] tracking-wider"
            >
              ĐĂNG KÝ NGAY ➔
            </button>
          </div>

        </div>

        {/* PROMO GROUPS OF TICKETS */}
        <div className="w-full max-w-[700px] grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16 select-none">
          {/* Combo 3 Vé */}
          <div className="bg-gradient-to-r from-[#0d47a1] to-[#1976d2] rounded-xl border border-blue-400/30 p-5 flex flex-col items-center justify-between text-center shadow-lg relative group overflow-hidden">
            <div className="space-y-1">
              <span className="text-[38px] md:text-[44px] font-black text-white font-montserrat leading-none">3 VÉ</span>
              <p className="text-[12px] font-extrabold text-blue-150 uppercase tracking-widest border-t border-b border-white/20 py-1">CHỈ CÒN</p>
            </div>
            <div className="bg-[#d50000] text-white font-black text-[22px] md:text-[26px] tracking-wide px-5 py-2.5 rounded-full shadow-inner mt-4 font-montserrat">
              449K/VÉ
            </div>
          </div>

          {/* Combo 5 Vé */}
          <div className="bg-[#051c2c] rounded-xl border-2 border-[#ffd043] p-5 flex flex-col items-center justify-between text-center shadow-lg relative group overflow-hidden">
            {/* Gold Tag Ribon */}
            <div className="absolute top-0 right-0 bg-[#ffd043] text-[#051c2c] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider rotate-[35deg] translate-x-[20px] translate-y-[8px]">
              HOT ★
            </div>
            <div className="space-y-1">
              <span className="text-[38px] md:text-[44px] font-black text-[#ffd043] font-montserrat leading-none">5 VÉ</span>
              <p className="text-[12px] font-extrabold text-[#ffd043]/70 uppercase tracking-widest border-t border-b border-[#ffd043]/20 py-1">CHỈ CÒN</p>
            </div>
            <div className="bg-gradient-to-r from-[#e65100] to-[#ffd043] text-white font-black text-[22px] md:text-[26px] tracking-wide px-5 py-2.5 rounded-full shadow-inner mt-4 font-montserrat border border-[#ffd043]/30">
              399K/VÉ
            </div>
          </div>
        </div>

        {/* ========================================================
            REGISTRATION FORM
           ======================================================== */}
        <div id="registration-form" className="w-full max-w-[620px] bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative">
          
          <h3 className="text-[26px] md:text-[30px] font-black font-montserrat uppercase tracking-wider text-center text-[#ff1a40] mb-8">
            ĐĂNG KÝ SỚM
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-5 text-left text-white/90">
            {/* Input Name */}
            <div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white text-gray-800 rounded-lg px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ff1a40] shadow-inner placeholder:text-gray-400"
                placeholder="Nhập Tên của bạn" 
              />
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-gray-800 rounded-lg px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ff1a40] shadow-inner placeholder:text-gray-400"
                placeholder="Nhập email của bạn" 
              />
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-white text-gray-800 rounded-lg px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ff1a40] shadow-inner placeholder:text-gray-400"
                placeholder="Nhập số điện thoại của bạn" 
              />
            </div>

            {/* Fixed Location: Hà Nội */}
            <div className="space-y-2">
              <span className="block text-[13px] font-bold text-white/60 uppercase tracking-wider">Địa điểm:</span>
              <div className="bg-white text-gray-800 rounded-lg p-4 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border-4 border-[#ff9800] bg-[#ff9800] shrink-0" />
                <span className="text-[15px] font-bold">Tôi tham dự ở Hà Nội</span>
              </div>
            </div>

            {/* Ticket Counter */}
            <div className="space-y-2">
              <span className="block text-[13px] font-bold text-white/60 uppercase tracking-wider">Số lượng vé (áp dụng tính tiền):</span>
              <div className="flex items-center bg-white text-gray-800 rounded-lg overflow-hidden border border-gray-200">
                <button 
                  type="button" 
                  onClick={handleDecrement}
                  className="w-14 h-12 flex items-center justify-center font-black text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors text-[20px] cursor-pointer"
                >
                  -
                </button>
                <span className="flex-grow text-center font-black text-[17px] text-[#042638]">
                  {ticketCount}
                </span>
                <button 
                  type="button" 
                  onClick={handleIncrement}
                  className="w-14 h-12 flex items-center justify-center font-black text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors text-[20px] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pricing tiers list indicator */}
            <div className="bg-white text-gray-850 rounded-lg overflow-hidden text-[13.5px] font-semibold divide-y divide-gray-100 border border-gray-100">
              <div className={`flex justify-between px-4 py-3 ${activeTier === 1 ? "bg-[#ff1a40]/10 text-[#ff1a40] font-black border-l-4 border-[#ff1a40]" : "text-gray-700"}`}>
                <span>1-2 vé</span>
                <span>499.000đ/vé</span>
              </div>
              <div className={`flex justify-between px-4 py-3 ${activeTier === 2 ? "bg-[#ff1a40]/10 text-[#ff1a40] font-black border-l-4 border-[#ff1a40]" : "text-gray-700"}`}>
                <span>Từ 3 vé</span>
                <span>449.000đ/vé</span>
              </div>
              <div className={`flex justify-between px-4 py-3 ${activeTier === 3 ? "bg-[#ff1a40]/10 text-[#ff1a40] font-black border-l-4 border-[#ff1a40]" : "text-gray-700"}`}>
                <span>Từ 5 vé</span>
                <span>399.000đ/vé</span>
              </div>
            </div>

            {/* Total calculation row */}
            <div className="bg-[#c01828] text-white rounded-lg px-5 py-4 flex justify-between items-center font-black text-[15.5px] md:text-[17px] tracking-wide shadow-md">
              <span>{ticketCount} vé × {formatPrice(pricePerTicket)}</span>
              <span className="text-[20px] md:text-[23px] font-montserrat">{formatPrice(totalPrice)}</span>
            </div>

            {/* Invoice Info Textarea */}
            <div>
              <textarea 
                value={invoiceInfo}
                onChange={(e) => setInvoiceInfo(e.target.value)}
                rows={2}
                className="w-full bg-white text-gray-800 rounded-lg px-4 py-3 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#ff1a40] shadow-inner placeholder:text-gray-400"
                placeholder="Thông tin xuất hoá đơn (nếu có)"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#c01828] hover:bg-[#a0121d] disabled:bg-gray-500 text-white font-black font-montserrat uppercase tracking-wider py-4.5 rounded-full shadow-lg shadow-[#c01828]/20 active:scale-[0.98] transition-all cursor-pointer text-[15.5px] md:text-[17px]"
              >
                {isSubmitting ? "Đang xử lý..." : "ĐĂNG KÝ NGAY"}
              </button>
            </div>

            {/* API feedback message */}
            {submitMessage && (
              <div className={`text-center font-bold text-[15px] p-3 rounded-lg ${submitMessage.includes("thành công") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                {submitMessage}
              </div>
            )}

          </form>

        </div>

      </div>
    </section>
  );
}
