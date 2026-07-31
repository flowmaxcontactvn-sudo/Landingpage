"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

function getDeviceBucket() {
  const w = window.innerWidth;
  if (w <= 680) return "mobile";
  if (w <= 860) return "tablet";
  return "desktop";
}

export default function ThuongHieuChuyenDoiPage() {
  // Mốc thời gian trang tải xong — dùng để tính thời gian phiên của
  // người đăng ký thành công (Date.now() lúc gửi form - mốc này).
  const pageLoadTimeRef = useRef(Date.now());
  const formTouchedRef = useRef(false);
  const formSubmittedRef = useRef(false);

  // Countdown state (7 giờ, theo nội dung Section CTA "7:00:00")
  const [remaining, setRemaining] = useState(7 * 60 * 60);

  // Social proof toast state
  const [toast, setToast] = useState({
    visible: false,
    name: "",
    time: "",
    initials: "",
    color: "#d0212a",
  });
  const [toastDismissed, setToastDismissed] = useState(false);

  // Zalo state & ref
  const [zaloLink, setZaloLink] = useState("https://zalo.me/0989975498");
  const zaloQrCanvasRef = useRef(null);

  // Lead Form state
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [maSoThue, setMaSoThue] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [playingTestimonial, setPlayingTestimonial] = useState(null);

  // UTM tracking variables
  const [utmSource, setUtmSource] = useState(null);
  const [utmMedium, setUtmMedium] = useState(null);
  const [utmCampaign, setUtmCampaign] = useState(null);
  const [detectedSource, setDetectedSource] = useState("Trực tiếp");

  // Trạng thái kiểm tra slug chiến dịch trên URL — "checking" trong lúc
  // tra Supabase, "invalid" nếu slug không khớp chiến dịch nào (chặn
  // không cho vào landing page), "valid" nếu khớp hoặc không có slug.
  const [campaignStatus, setCampaignStatus] = useState("valid");

  // Mã pixel tracking (Facebook/TikTok/Google/YouTube) do admin cấu hình ở
  // /admin/tracking — lấy trực tiếp từ Supabase, KHÔNG qua localStorage vì
  // không có nơi nào ghi vào đó cả (bug cũ khiến pixel không bao giờ chạy).
  const [trackingCodes, setTrackingCodes] = useState([]);
  const pickTrackingCodes = (type) => trackingCodes.filter((r) => r.loai_ma === type).map((r) => r.ma);

  // Sticky CTA state
  const [stickyVisible, setStickyVisible] = useState(false);

  // Scroll-to-top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 1. Detect UTM and referrers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const src = urlParams.get("utm_source");
      const med = urlParams.get("utm_medium");
      let camp = urlParams.get("utm_campaign");

      setUtmSource(src);
      setUtmMedium(med);

      // Extract campaign from path slug (like in main.js)
      const pathSlug = window.location.pathname.replace(/^\/+|\/+$/g, "");
      const reservedPaths = ["", "index.html", "login.html", "adphmax.html", "login", "adphmax", "thuonghieuchuyendoi"];
      if (pathSlug && !reservedPaths.includes(pathSlug) && !pathSlug.startsWith("assets/")) {
        camp = decodeURIComponent(pathSlug);
        setCampaignStatus("checking");
        supabase.rpc("chien_dich_id_theo_slug", { p_slug: camp }).then(({ data, error }) => {
          setCampaignStatus(error ? "valid" : data ? "valid" : "invalid");
        }, () => setCampaignStatus("valid"));
      }
      setUtmCampaign(camp);

      // Detect Source
      const ua = navigator.userAgent || "";
      let source = "Trực tiếp";
      if (/FBAN|FBAV|FB_IAB/i.test(ua)) source = "facebook";
      else if (/Zalo/i.test(ua)) source = "zalo";
      else if (/Instagram/i.test(ua)) source = "instagram";
      else if (/Line\//i.test(ua)) source = "line";
      else if (src) source = src.toLowerCase();
      else {
        const ref = document.referrer;
        if (ref) {
          try {
            const host = new URL(ref).hostname.toLowerCase().replace(/^www\./, "");
            if (/(^|\.)facebook\.com$|(^|\.)fb\.com$/.test(host)) source = "facebook";
            else if (/(^|\.)zalo\.me$|(^|\.)zaloapp\.com$/.test(host)) source = "zalo";
            else if (/(^|\.)tiktok\.com$/.test(host)) source = "tiktok";
            else if (/(^|\.)google\./.test(host)) source = "google";
            else if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host)) source = "youtube";
            else source = host;
          } catch (e) {}
        }
      }
      setDetectedSource(source);
    }
  }, []);

  // 2a. Tải mã tracking do admin cấu hình cho landing này
  useEffect(() => {
    supabase
      .from("cau_hinh_tracking")
      .select("loai_ma, ma")
      .eq("landing", "/thuonghieuchuyendoi")
      .then(({ data }) => setTrackingCodes(data || []));
  }, []);

  // 2b. Khởi tạo pixel tracking khi đã có mã từ Supabase
  useEffect(() => {
    if (trackingCodes.length === 0) return;

    const fbPixel = pickTrackingCodes("facebook_pixel").join(",");
    const ttPixel = pickTrackingCodes("tiktok_pixel")[0] || "";
    const ggTag = pickTrackingCodes("google_tag")[0] || "";
    const ytTag = pickTrackingCodes("youtube_ads")[0] || "";

    // Facebook Pixel
    if (fbPixel && !window.fbq) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      const fbPixelIds = fbPixel.split(",").map((id) => id.trim()).filter(Boolean);
      fbPixelIds.forEach((pixelId) => {
        window.fbq("init", pixelId);
      });
      window.fbq("track", "PageView");
    }

    // TikTok Pixel
    if (ttPixel && !window.ttq) {
      !(function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready",
          "alias", "group", "enableCookie", "offCookie",
        ];
        ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var e = 0; e < ttq.methods.length; e++) ttq.setAndDefer(ttq, ttq.methods[e]);
        ttq.instance = function (t) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e, n) {
          var o = "https://analytics.tiktok.com/i18n/pixel/events.js";
          (ttq._i = ttq._i || {}), (ttq._i[e] = []), (ttq._i[e]._u = o), (ttq._t = ttq._t || {}), (ttq._t[e] = +new Date()), (ttq._o = ttq._o || {}), (ttq._o[e] = n);
          var i = d.createElement("script");
          (i.type = "text/javascript"), (i.async = !0), (i.src = o);
          var s = d.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(i, s);
        };
        ttq.load(ttPixel);
        ttq.page();
      })(window, document, "ttq");
    }

    // Google & YouTube Tag
    if ((ggTag || ytTag) && !window.gtag) {
      const primaryTag = ggTag || ytTag;
      const gScript = document.createElement("script");
      gScript.async = true;
      gScript.src = "https://www.googletagmanager.com/gtag/js?id=" + primaryTag;
      document.head.appendChild(gScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());

      if (ggTag) window.gtag("config", ggTag);
      if (ytTag) window.gtag("config", ytTag);
    }
  }, [trackingCodes]);

  // Đọc link Zalo do admin cấu hình (dùng tạo mã QR khi đăng ký thành công)
  useEffect(() => {
    supabase
      .from("cau_hinh_landing")
      .select("zalo_link")
      .eq("landing", "/thuonghieuchuyendoi")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.zalo_link) setZaloLink(data.zalo_link);
      });
  }, []);

  // 3. Countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // Ghi nhận lượt truy cập cho chiến dịch (nếu URL có slug chiến dịch)
  useEffect(() => {
    if (typeof window === "undefined" || window.top !== window.self) return;
    if (!utmCampaign) return;

    supabase.rpc("tang_luot_truy_cap", { p_slug: utmCampaign }).then(() => {}, () => {});
  }, [utmCampaign]);

  // Theo dõi tổng số giây mọi người xem từng section (heatmap)
  useEffect(() => {
    if (typeof window === "undefined" || window.top !== window.self) return;

    const LANDING = "/thuonghieuchuyendoi";
    const sections = document.querySelectorAll("[data-section]");
    if (!sections.length) return;

    const bucket = getDeviceBucket();

    const accumulated = {};
    const flushed = {};
    const visibleSince = {};
    const isCurrentlyIntersecting = {};

    sections.forEach((el) => {
      const key = el.getAttribute("data-section");
      accumulated[key] = 0;
      flushed[key] = 0;
      visibleSince[key] = null;
      isCurrentlyIntersecting[key] = false;
    });

    const startCounting = (key) => {
      if (visibleSince[key] === null) visibleSince[key] = Date.now();
    };

    const stopCounting = (key) => {
      if (visibleSince[key] !== null) {
        accumulated[key] += (Date.now() - visibleSince[key]) / 1000;
        visibleSince[key] = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entry.target.getAttribute("data-section");
          const rootHeight = (entry.rootBounds && entry.rootBounds.height) || window.innerHeight;
          const nowIntersecting =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= rootHeight * 0.5);
          isCurrentlyIntersecting[key] = nowIntersecting;

          if (document.visibilityState !== "visible") return;

          if (nowIntersecting) startCounting(key);
          else stopCounting(key);
        });
      },
      { threshold: [0, 0.5] }
    );

    sections.forEach((el) => observer.observe(el));

    const buildPayload = () => {
      const payload = [];
      Object.keys(accumulated).forEach((key) => {
        const delta = accumulated[key] - flushed[key];
        if (delta > 0.3) {
          payload.push({ section: key, seconds: Math.round(delta * 10) / 10 });
          flushed[key] = accumulated[key];
        }
      });
      return payload;
    };

    const sendPayload = (payload, useKeepalive) => {
      payload.forEach(({ section, seconds }) => {
        fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/ghi_nhan_section", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ p_landing: LANDING, p_section_key: section, p_thiet_bi: bucket, p_giay: seconds }),
          keepalive: !!useKeepalive,
        }).catch(() => {});
      });
    };

    const snapshotAndContinue = () => {
      const now = Date.now();
      Object.keys(visibleSince).forEach((key) => {
        if (visibleSince[key] !== null) {
          accumulated[key] += (now - visibleSince[key]) / 1000;
          visibleSince[key] = now;
        }
      });
    };

    const interval = setInterval(() => {
      snapshotAndContinue();
      sendPayload(buildPayload(), false);
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        Object.keys(visibleSince).forEach((key) => stopCounting(key));
        sendPayload(buildPayload(), true);
      } else if (document.hasFocus()) {
        Object.keys(isCurrentlyIntersecting).forEach((key) => {
          if (isCurrentlyIntersecting[key]) startCounting(key);
        });
      }
    };

    // document.visibilityState chỉ đổi khi chuyển TAB — nếu người dùng chuyển
    // sang cửa sổ ứng dụng khác (tab vẫn "visible") thì phải dựa vào blur/focus
    // của window mới dừng đếm đúng lúc, tránh cộng dồn thời gian ảo.
    const handleWindowBlur = () => {
      Object.keys(visibleSince).forEach((key) => stopCounting(key));
      sendPayload(buildPayload(), true);
    };

    const handleWindowFocus = () => {
      if (document.visibilityState !== "visible") return;
      Object.keys(isCurrentlyIntersecting).forEach((key) => {
        if (isCurrentlyIntersecting[key]) startCounting(key);
      });
    };

    const handlePageHide = () => {
      Object.keys(visibleSince).forEach((key) => stopCounting(key));
      sendPayload(buildPayload(), true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pagehide", handlePageHide);
      sections.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Theo dõi lượt di chuyển/chạm, lượt click và thời gian phiên theo thiết bị (heatmap)
  useEffect(() => {
    if (typeof window === "undefined" || window.top !== window.self) return;

    const LANDING = "/thuonghieuchuyendoi";
    const SAMPLE_THROTTLE_MS = 130;
    const TOUCH_GHOST_WINDOW_MS = 700;

    const bucket = getDeviceBucket();
    const sessionStart = Date.now();

    let moveCount = 0;
    let clickCount = 0;
    let flushedMoves = 0;
    let flushedClicks = 0;

    let lastSampleTime = 0;
    const throttledMove = () => {
      const now = Date.now();
      if (now - lastSampleTime < SAMPLE_THROTTLE_MS) return;
      lastSampleTime = now;
      moveCount++;
    };

    let lastTouchTime = 0;
    const isGhostMouseEvent = () => Date.now() - lastTouchTime < TOUCH_GHOST_WINDOW_MS;

    const handleMouseMove = () => {
      if (!isGhostMouseEvent()) throttledMove();
    };
    const handleClick = () => {
      if (!isGhostMouseEvent()) clickCount++;
    };
    const handleTouchMove = () => {
      lastTouchTime = Date.now();
      throttledMove();
    };
    const handleTouchEnd = () => {
      lastTouchTime = Date.now();
      clickCount++;
    };

    let maxScroll = 0;
    const handleScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const pct = Math.round((window.scrollY / scrollHeight) * 100);
        if (pct > maxScroll) maxScroll = pct;
      }
    };
    window.addEventListener("scroll", handleScrollDepth, { passive: true });
    handleScrollDepth();

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    const sendActivity = (useKeepalive) => {
      const dMoves = moveCount - flushedMoves;
      const dClicks = clickCount - flushedClicks;
      if (dMoves <= 0 && dClicks <= 0) return;
      flushedMoves = moveCount;
      flushedClicks = clickCount;
      fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/ghi_nhan_di_chuyen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ p_landing: LANDING, p_thiet_bi: bucket, p_di_chuyen: dMoves, p_click: dClicks }),
        keepalive: !!useKeepalive,
      }).catch(() => {});
    };

    let sessionSent = false;
    const sendSessionOnce = (useKeepalive) => {
      if (sessionSent) return;
      const seconds = (Date.now() - sessionStart) / 1000;
      if (seconds < 1) return;
      sessionSent = true;
      const isBounce = seconds < 10 || (moveCount === 0 && clickCount === 0);
      const isAbandoned = formTouchedRef.current && !formSubmittedRef.current;
      fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/ghi_nhan_phien", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          p_landing: LANDING,
          p_thiet_bi: bucket,
          p_giay: Math.round(seconds * 10) / 10,
          p_is_bounce: isBounce,
          p_max_scroll: maxScroll,
          p_form_abandoned: isAbandoned,
        }),
        keepalive: !!useKeepalive,
      }).catch(() => {});
    };

    const interval = setInterval(() => sendActivity(false), 15000);

    const handleVisibilityHidden = () => {
      if (document.visibilityState === "hidden") {
        sendActivity(true);
        sendSessionOnce(true);
      }
    };
    const handlePageHide = () => {
      sendActivity(true);
      sendSessionOnce(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityHidden);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("visibilitychange", handleVisibilityHidden);
      window.removeEventListener("pagehide", handlePageHide);
      sendActivity(true);
      sendSessionOnce(true);
    };
  }, []);

  // 8. Sticky CTA visibility scroll checker
  useEffect(() => {
    const handleScroll = () => {
      const form = document.getElementById("register");
      if (!form) return;

      const rect = form.getBoundingClientRect();
      const isFormVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const hasScrolledPastHero = window.scrollY > 500;

      setStickyVisible(!isFormVisible && hasScrolledPastHero);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 9. QR Code drawing when success modal opens
  useEffect(() => {
    if (successModalOpen && zaloQrCanvasRef.current) {
      QRCode.toCanvas(zaloQrCanvasRef.current, zaloLink, { width: 280, margin: 1 }, (err) => {
        if (err) console.error("QR Code Error:", err);
      });
    }
  }, [successModalOpen, zaloLink]);

  // 10. Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    formSubmittedRef.current = true;

    // Gửi qua route handler nội bộ — vừa lưu vào Supabase, vừa đồng bộ
    // sang phmax.vn để xử lý CRM ở đó (xem app/api/dang-ky/route.js)
    let saveOk = false;
    try {
      const res = await fetch("/api/dang-ky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullname.trim(),
          phone: phone.trim(),
          email: email.trim(),
          nguon: detectedSource,
          utmCampaign,
          ghiChu: ghiChu.trim(),
          thietBi: getDeviceBucket(),
          thoiGianPhienGiay: Math.round((Date.now() - pageLoadTimeRef.current) / 100) / 10,
          maSoThue: maSoThue.trim(),
        }),
      });
      const json = await res.json();
      saveOk = !!json.ok;
      if (!json.ok) console.warn("Lưu khách hàng thất bại:", json.error);
    } catch (err) {
      console.warn("Gửi đăng ký thất bại:", err);
    }

    if (!saveOk) {
      setIsSubmitting(false);
      setSubmitError("Đăng ký không thành công do lỗi hệ thống. Vui lòng thử lại hoặc liên hệ trực tiếp qua Zalo.");
      return;
    }

    // Show success modal immediately to mimic fast UX
    setTimeout(() => {
      setFullname("");
      setPhone("");
      setEmail("");
      setMaSoThue("");
      setGhiChu("");
      setIsSubmitting(false);
      setSuccessModalOpen(true);

      // Fire tracking events
      if (window.fbq) {
        try {
          window.fbq("track", "Lead");
        } catch (e) {
          console.warn("FB Pixel track error:", e);
        }
      }
      if (window.ttq) {
        try {
          window.ttq.track("CompleteRegistration");
        } catch (e) {
          console.warn("TikTok Pixel track error:", e);
        }
      }
      if (window.gtag) {
        try {
          const clientGgTag = pickTrackingCodes("google_tag")[0];
          if (clientGgTag) {
            window.gtag("event", "generate_lead", { send_to: clientGgTag });
          }
          const clientYtTag = pickTrackingCodes("youtube_ads")[0];
          const clientYtLabel = pickTrackingCodes("conversion_label")[0];
          if (clientYtTag && clientYtLabel) {
            window.gtag("event", "conversion", { send_to: `${clientYtTag}/${clientYtLabel}` });
          }
        } catch (e) {
          console.warn("Google track error:", e);
        }
      }
    }, 150);
  };

  // 11. Helper to format seconds to countdown HH:MM:SS
  const formatCountdown = (totalSeconds) => {
    const pad = (n) => String(n).padStart(2, "0");
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h: pad(h), m: pad(m), s: pad(s) };
  };

  const timeParts = formatCountdown(remaining);

  // Smooth scroll helper
  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ── Shared Tailwind class strings (1:1 port of the former BEM classes) ──
  const container = "max-w-[980px] mx-auto px-6 max-[680px]:px-4";
  const sectionWhite = "bg-white py-14 max-[680px]:py-5";
  const sectionTitle = "text-[clamp(28px,3.4vw,40px)] font-extrabold font-montserrat text-[#e25010] uppercase leading-[1.2]";
  const ctaButton = "bg-[#e30a0a] hover:bg-[#ff1e1e] text-white font-extrabold font-montserrat uppercase tracking-wide rounded-full shadow-[0_0_25px_rgba(227,10,10,0.45)] hover:shadow-[0_0_32px_rgba(227,10,10,0.6)] transition-all duration-300";
  const ctaButtonInline = ctaButton + " hover:scale-105 active:scale-95";
  const oppTitle =
    "text-[clamp(30px,4.2vw,46px)] font-extrabold text-[#e25010] uppercase leading-[1.2] mb-2 max-[680px]:text-[27px] max-[680px]:leading-[1.2]";
  const oppSubtitle = "text-[22px] text-[#555] max-[680px]:text-[16.5px]";
  const oppMid =
    "max-w-[740px] mx-auto mb-4 text-[21px] leading-[1.8] text-[#333] text-center max-[680px]:text-[16.5px] max-[680px]:my-3.5";
  const oppClosing =
    "max-w-[740px] mx-auto text-center text-[24px] font-semibold text-[#e25010] italic leading-[1.4] max-[680px]:text-[17px] max-[680px]:leading-[1.5] max-[680px]:mt-4 max-[680px]:mb-4 max-[680px]:px-4";
  const oppListNoicon =
    "flex flex-col gap-[18px] max-w-[600px] mx-auto mb-[22px] bg-[#fff8f0] border-l-4 border-[#e25010] rounded-md px-6 py-[18px] max-[680px]:gap-1.5 max-[680px]:px-3.5 max-[680px]:py-2.5 max-[680px]:mb-2.5 max-[480px]:px-[18px] max-[480px]:py-3.5";
  const oppListNoiconLi =
    "py-[5px] pl-6 relative text-[23px] font-semibold text-[#333] max-[680px]:text-[17px] max-[680px]:py-[2px] max-[680px]:pl-[20px] before:content-['✔'] before:absolute before:left-0 before:text-[#e25010] before:text-[14px] before:top-[9px] max-[680px]:before:top-[4px]";
  const checkListGreen =
    "flex flex-col gap-[14px] max-w-[700px] mx-auto mb-7 max-[680px]:gap-2";
  const checkListGreenLi =
    "text-[21px] text-[#333] py-1 pl-[32px] relative leading-[1.6] max-[680px]:text-[16.5px] max-[680px]:pl-[28px] before:content-['✔'] before:absolute before:left-0 before:top-[6px] before:text-[#1b8a3e] before:text-[15px] max-[680px]:before:top-[2px]";
  const btnBase =
    "px-9 py-3.5 rounded-md font-bold text-[17px] cursor-pointer text-center tracking-[0.4px] relative overflow-hidden";
  const btnGoldLg =
    "inline-block " + btnBase +
    " border-[2.5px] border-white bg-[linear-gradient(135deg,#ffe066_0%,#f5c030_100%)] text-[#1a1a1a] shadow-[0_0_25px_rgba(245,166,35,0.8)] text-[19px] px-[100px] py-4 whitespace-nowrap max-[680px]:text-base max-[680px]:px-8 max-[680px]:py-[15px]";
  const btnGoldLgWrap =
    "inline-block " + btnBase +
    " border-[2.5px] border-white bg-[linear-gradient(135deg,#ffe066_0%,#f5c030_100%)] text-[#1a1a1a] shadow-[0_0_25px_rgba(245,166,35,0.8)] text-[17px] leading-snug px-10 py-4 max-w-[420px] max-[680px]:text-[14.5px] max-[680px]:px-6 max-[680px]:py-[15px] max-[680px]:max-w-[300px]";

  if (campaignStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]">
        <div className="w-8 h-8 border-[3px] border-[#e25010] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (campaignStatus === "invalid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f7] px-6 text-center gap-3">
        <p className="text-2xl font-bold text-[#0b0b0b]">404 — Không tìm thấy trang</p>
        <p className="text-[#898781] max-w-sm">Đường dẫn này không tồn tại hoặc chiến dịch đã bị gỡ bỏ.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ══════════════════════════════════════════
           SECTION 1 — THANH THÔNG BÁO ĐẦU TRANG
      ══════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-50 relative overflow-hidden bg-[#e30a0a] text-white text-center px-6 py-1 text-[17px] font-bold flex flex-wrap items-center justify-center gap-x-5 gap-y-1 max-[680px]:text-[16px] max-[680px]:py-1 font-montserrat shadow-md"
        data-section="announcement-bar"
      >
        <span className="opacity-100 font-extrabold text-[#ffffff]">🗓️ Khai giảng: 03/08/2026</span>
        <span className="hidden md:inline-block opacity-40">|</span>
        <span className="text-[#ffe066] font-extrabold">Chỉ nhận 10 học viên để đội ngũ Mentor có thể theo sát quá trình thực hành.</span>
        <a
          href="#register"
          onClick={(e) => handleAnchorClick(e, "register")}
          className="bg-white text-[#e30a0a] font-black text-[12px] px-5 py-2.5 rounded-full uppercase tracking-wide hover:opacity-90 transition-opacity whitespace-nowrap ml-2 shadow-md"
        >
          Đăng ký giữ chỗ
        </a>
      </div>

      {/* ══════════════════════════════════════════
           SECTION 2 — HERO: LỜI HỨA CHÍNH
      ══════════════════════════════════════════ */}
      <section
        className="text-white py-8 md:py-12 max-[680px]:py-6 relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(11, 16, 44, 0.95), rgba(16, 26, 68, 0.92)), url('/thuonghieuchuyendoi/images/banner.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        data-section="hero"
      >
        <div className="max-w-[800px] mx-auto px-6 max-[680px]:px-4 relative text-center flex flex-col items-center">
          
          <h1 className="text-[21px] md:text-[28px] font-black font-montserrat leading-relaxed mb-5 text-white uppercase max-w-[720px] mx-auto text-center">
            7 ngày bắt đầu xây kênh và tạo ra những <span className="text-[#f5a623]">khách hàng đầu tiên</span> <br /> <span className="whitespace-nowrap">từ <span className="text-[#f5a623]">nội dung</span></span>
          </h1>
          
          <p className="mb-4 text-[16px] md:text-[18px] opacity-[0.95] leading-relaxed max-w-[650px] text-center">
            Bạn sẽ bắt đầu xây dựng được kênh thương hiệu cá nhân thu hút khách hàng và bán hàng bằng việc tham dự chương trình 7 ngày liên tục này.
          </p>
          
          <p className="mb-4 text-[16px] md:text-[18px] italic text-[#f5a623] font-extrabold leading-relaxed text-center">
            Đăng ký sớm ngay hôm nay để chúng tôi giữ cho bạn một chỗ.
          </p>
          
          <p className="mb-6 text-[15px] md:text-[16px] opacity-[0.88] leading-relaxed max-w-[650px] text-center">
            Trong suốt 4 năm qua, hơn <strong>2.000 học viên</strong> đã tham dự chương trình xây kênh và bán hàng, bằng những kiến thức có được và sự kèm cặp sát sao công việc kinh doanh của họ đã có rất nhiều thay đổi.
          </p>
          
          {/* Hàng Icons ngày/địa điểm với SVG outline chuẩn (căn giữa) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8 text-[13.5px] font-medium text-white/90">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tháng 8/2026</span>
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Online qua Zoom & Group</span>
            </span>
          </div>

          {/* Red pill CTA Button */}
          <a
            href="#register"
            onClick={(e) => handleAnchorClick(e, "register")}
            className="inline-block bg-[#e30a0a] hover:bg-[#ff1e1e] text-white font-extrabold text-[12px] md:text-[13px] px-10 py-3 rounded-full text-center tracking-wide uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(227,10,10,0.4)] leading-tight font-montserrat mx-auto"
          >
            YES! TÔI SẴN SÀNG XÂY KÊNH<br />
            VÀ BỨT PHÁ DOANH THU CỦA MÌNH!
          </a>
          
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 3 — GIỚI THIỆU GIẢI PHÁP 1
      ══════════════════════════════════════════ */}
      <section className="bg-white py-10 md:py-12 max-[680px]:py-6 border-t-[3px] border-t-[#f0f0f0]" data-section="benefits">
        <div className={container}>
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-12 items-start max-[960px]:grid-cols-1 max-[960px]:gap-10">
            {/* Cột trái: Tiêu đề & Danh sách văn bản */}
            <div className="text-left font-montserrat">
              <span className="block text-[18px] md:text-[22px] font-black text-gray-800 uppercase tracking-wider mb-1">
                KHI BẠN THAM GIA
              </span>
              <h2 className="text-[24px] md:text-[36px] font-black text-[#e25010] uppercase leading-[1.2] mb-2">
                7 ngày xây kênh <span className="whitespace-nowrap">chuyển đổi</span>
              </h2>
              <span className="block text-[15px] md:text-[16px] font-black text-gray-800 uppercase tracking-widest mb-4">
                BẠN SẼ CÓ CƠ HỘI ĐỂ:
              </span>

              <div className="space-y-2 text-[15.5px] leading-relaxed text-gray-700 font-medium font-sans text-left">
                {[
                  { num: "#1.", desc: <span>Thấu hiểu thuật toán các <span className="whitespace-nowrap">nền tảng.</span></span> },
                  { num: "#3.", desc: <span>Làm thế nào để chọn sản phẩm bán trên Online <span className="whitespace-nowrap">hiệu quả.</span></span> },
                  { num: "#8.", desc: <span>Các chiến lược sáng tạo nội dung <span className="whitespace-nowrap">chuyển đổi.</span></span> },
                  { num: "#11.", desc: <span>4 Dạng nội dung chuyển đổi dễ dàng cho <span className="whitespace-nowrap">người mới.</span></span> },
                  { num: "#17.", desc: <span>Quy trình Quay và Edit một video <span className="whitespace-nowrap">đơn giản.</span></span> },
                  { num: "#23.", desc: <span>Xây dựng Trang Fanpage, TikTok, Profile <span className="whitespace-nowrap">trên MXH.</span></span> },
                  { num: "#25.", desc: <span>Đo lường chỉ số và tối ưu nội dung chuyển đổi <span className="whitespace-nowrap">trên kênh.</span></span> },
                  { num: "#31.", desc: <span>Kèm cặp chữa bài <span className="whitespace-nowrap">từng ngày.</span></span> },
                  { num: "#36.", desc: <span>Khám 1:1 định hướng kênh sau khi kết thúc <span className="whitespace-nowrap">hành trình.</span></span> }
                ].map((item) => (
                  <p key={item.num} className="text-left leading-relaxed">
                    <strong className="text-gray-900 font-bold font-montserrat mr-2">{item.num}</strong>
                    <span>{item.desc}</span>
                  </p>
                ))}
              </div>

              <p className="text-left text-[16.5px] text-[#111111] font-black italic mt-5 font-sans">
                Và còn nhiều hơnnnn thế nữa….
              </p>
            </div>

            {/* Cột phải: 4 ảnh xếp chồng/staggered */}
            <div className="w-full max-w-[500px] mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.06)] bg-gray-50 aspect-[4/3] relative">
                    <img
                      src="/thuonghieuchuyendoi/images/benefit-1.jpg"
                      alt="Thực hành lớp học xây kênh"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x300/fff3f3/e30a0a?text=Thực+Hành+Lớp+Học";
                      }}
                    />
                  </div>
                  <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.06)] bg-gray-50 aspect-[3/4] relative">
                    <img
                      src="/thuonghieuchuyendoi/images/benefit-2.jpg"
                      alt="Mentor sửa bài trực tiếp"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x533/fff3f3/e30a0a?text=Mentor+Chữa+Bài";
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-10">
                  <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.06)] bg-gray-50 aspect-[3/4] relative">
                    <img
                      src="/thuonghieuchuyendoi/images/benefit-3.jpg"
                      alt="Học viên hoàn thành video"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x533/fff3f3/e30a0a?text=Học+Viên+Tự+Tin";
                      }}
                    />
                  </div>
                </div>
                <div className="col-span-2 mt-2">
                  <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.06)] bg-gray-50 aspect-[2.1/1] relative">
                    <img
                      src="/thuonghieuchuyendoi/images/benefit-4.jpg"
                      alt="Toàn cảnh khóa học online"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/800x380/fff3f3/e30a0a?text=Không+Gian+Đào+Tạo";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="#register"
              onClick={(e) => handleAnchorClick(e, "register")}
              className={"inline-block " + ctaButtonInline + " text-[12px] md:text-[13px] px-10 py-3 text-center animate-btn-pulse"}
            >
              YES! TÔI ĐÃ SẴN SÀNG XÂY KÊNH VÀ BỨT PHÁ DOANH THU CỦA MÌNH
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 4 — GIỚI THIỆU GIẢI PHÁP 2 (thư ngỏ)
      ══════════════════════════════════════════ */}
      <section className="bg-[linear-gradient(to_right,#901a5e_0%,#4a187e_50%,#1c3285_100%)] py-6 md:py-8 max-[680px]:py-3.5" data-section="overcome-barriers">
        <div className="max-w-[1040px] mx-auto px-6 max-[680px]:px-4">
          <div className="bg-[#0b0c1e]/65 backdrop-blur-md rounded-[32px] p-5 md:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white font-montserrat leading-[1.8] text-[15.5px]">
            
            <p className="text-justify font-bold text-[17.5px] leading-relaxed mb-4 max-w-[880px] mx-auto">
              7 ngày xây kênh chuyển đổi là một chương trình liên tục được thiết kế để bạn vượt qua những rào cản bản thân để ngay lập tức <u>xây một kênh thương hiệu cá nhân, bán hàng gia tăng doanh số và thu nhập.</u>
            </p>

            <div className="space-y-3.5 text-[#ffffff] text-justify">
              <p>
                Với những trải nghiệm sống, sự phán xét từ môi trường xung quanh, con người ta chấp nhận những định kiến của người khác về xây kênh, về bán hàng online tạo ra những nỗi sợ ngăn chúng ta hành động.
              </p>
              
              <p>
                Theo thời gian, chúng ta tin đó là sự thật, nó biến thành những rào cản vô hình khi chúng ta phát triển kinh doanh và ngăn cản điều chúng ta muốn làm, muốn có, muốn trở thành.
              </p>

              <p>
                TÔI GỌI ĐÓ LÀ ẢO TƯỞNG!!! Điều đáng buồn là chúng ta lại coi những ảo tưởng đó là có thật. Chúng ta sẵn sàng mang những điều chúng ta coi là "sự thật" đó để bao biện cho việc không xây kênh, không bắt đầu làm nội dung, không tạo ra thu nhập. Và dùng nó để chỉ trích ai đó đang có khát khao một kênh truyền thông, một nguồn thu nhập mới mà ta từng khát khao có.
              </p>

              <p>
                7 ngày xây kênh chuyển đổi là một chương trình liên tục được thiết kế để bạn vượt qua những rào cản bản thân để ngay lập tức xây một kênh thương hiệu cá nhân, bán hàng gia tăng doanh số và thu nhập.
              </p>

              <p>
                Tôi mong bạn khi tham gia chương trình sẽ nhận ra những RÀO CẢN vô hình của mình, thách thức chúng rồi vượt qua chúng. Đối diện với nó thay vì TRỐN CHẠY như trước đây!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 5 — VẤN ĐỀ KHÁCH HÀNG ĐANG GẶP
      ══════════════════════════════════════════ */}
      <section className="bg-white py-6 md:py-8 max-[680px]:py-3.5" data-section="customer-pain-points">
        <div className={container}>
          <h2 className={sectionTitle + " text-center mb-8 max-w-[800px] mx-auto"}>
            ĐÂY LÀ HẦU HẾT VẤN ĐỀ MÀ <br className="max-[680px]:inline hidden" />NHỮNG NGƯỜI KINH DOANH ONLINE GẶP PHẢI
          </h2>

          <div className="max-w-[720px] mx-auto text-[15.5px] text-[#1a1a1a] leading-[1.8] font-sans">
            <div className="space-y-4 text-justify font-medium text-gray-800">
              <p>
                <strong>NĂM 2020 TÔI VÀ VỢ BẮT ĐẦU KINH DOANH ONLINE TỪ NGƯỜI LÀM THUÊ XUẤT SẮC</strong>, chúng tôi bắt đầu nhập hàng để bán trên Online nhưng khi nhìn vào đống hàng đã nhập về chúng tôi thực sự không biết làm thế nào?
              </p>
              <p>
                Tôi muốn xây dựng thương hiệu cá nhân nhưng không biết mình nên chia sẻ điều gì?
              </p>
              <p>
                Muốn quay Video nhưng cứ cầm điện thoại lên thì con chữ cứ bay đi đâu, cứng miệng không nói ra được!
              </p>
              <p>
                Đăng bài lên đều nhưng nội dung ít tương tác, không có khách hàng nào hỏi mua.
              </p>
              <p>
                Sau này phát triển thêm các kênh như Shopee, TikTok cũng không biết cách chọn sản phẩm, tối ưu nội dung như thế nào?
              </p>
              <p>
                Xem rất nhiều hướng dẫn, lưu rất nhiều công thức nhưng kênh vẫn chưa tạo ra được kết quả.
              </p>
            </div>

            <p className="font-extrabold text-[#e25010] mt-6 text-[16.5px]">
              Nếu bạn cũng như vậy có thể bạn đang gặp những sai lầm sau:
            </p>
            <ul className="list-none space-y-2 mt-3 pl-1">
              {[
                "Follow trước bán hàng sau.",
                "Mình không phải idol, không có tài năng nào đặc biệt.",
                "Đối diện với Camera cảm giác như đối diện với kẻ thù.",
                "Không có người dẫn dắt bạn vượt qua những khó khăn ngày đầu xây kênh.",
                "Cố gắng bắt đầu bằng một ý tưởng."
              ].map((err, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#e30a0a] font-bold shrink-0 mt-0.5">✕</span>
                  <span className="font-semibold text-gray-700 text-[15.5px]">{err}</span>
                </li>
              ))}
            </ul>
            <p className="italic font-bold text-gray-800 mt-4 pl-1 text-[15px]">
              Tôi cũng đã từng gặp những lỗi như vậy và kết quả là không có Video, không có đơn hàng.
            </p>

            <div className="mt-8 bg-orange-50/70 border border-orange-100 rounded-2xl p-6">
              <p className="font-black text-[#e30a0a] text-[17px] mb-4 text-center uppercase tracking-wide">
                Thực tế là bạn không cần triệu view và hàng trăm ngàn Follower mới bán được hàng!
              </p>
              <p className="font-bold text-gray-900 mb-3 text-[16px]">Họ mua khi nội dung tạo ra:</p>
              <ul className="list-none space-y-2.5 pl-1">
                {[
                  "Sự tin tưởng vào người bán và giải pháp phù hợp với họ",
                  "Người làm nội dung thấu hiểu vấn đề của họ đang gặp phải",
                  "Người giới thiệu thực sự hiểu được giá trị của sản phẩm giải quyết được vấn đề",
                  "Trao đúng sản phẩm tới đúng người cần chứ không phải spam nội dung tới tất cả mọi người",
                  "Biết rõ mình cần hành động gì tiếp theo"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="font-semibold text-gray-800 text-[15.5px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-3.5 text-center border-t border-gray-100 pt-6">
              <p className="text-[17.5px] text-[#e30a0a] font-black italic font-montserrat">
                "Một kênh ít Follower vẫn có thể bán hàng nếu nội dung đúng và đủ!"
              </p>
              <p className="text-[18px] text-gray-900 font-black font-montserrat uppercase leading-relaxed max-w-[640px] mx-auto">
                Nội dung hay có thể tạo View <br className="max-[680px]:inline hidden" /><span className="whitespace-nowrap">nhưng chỉ</span> nội dung đúng mới tạo ra <span className="whitespace-nowrap">chuyển đổi</span>
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="#register"
              onClick={(e) => handleAnchorClick(e, "register")}
              className={"inline-block " + ctaButtonInline + " text-[12px] md:text-[13px] px-10 py-3"}
            >
              YES! TÔI SẴN SÀNG XÂY KÊNH VÀ TẠO RA DOANH THU CHUYỂN ĐỔI!
            </a>
          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════════
           SECTION 6 — NGƯỜI DẪN ĐƯỜNG
      ══════════════════════════════════════════ */}
      <section
        className="border-t border-[#eeeeee] py-16 max-[680px]:py-10 relative overflow-hidden"
        style={{ backgroundColor: "#f9f9f9", backgroundImage: "url('/thuonghieuchuyendoi/images/world-map-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        data-section="instructor"
      >
        <div className={container}>

          {/* Header căn giữa */}
          <div className="text-center mb-10 max-[860px]:mb-6">
            <p className="text-[16px] md:text-[18px] font-black uppercase tracking-[0.2em] text-[#e25010] mb-2 font-montserrat">
              GẶP GỠ NGƯỜI HUẤN LUYỆN
            </p>
            <h2 className={sectionTitle}>
              TH.S VŨ KIM KHÁNH
            </h2>

            {/* Mobile-only: Ảnh 1 nằm ngay dưới tên người huấn luyện */}
            <div className="hidden max-[860px]:block mt-6 max-w-[340px] mx-auto rounded-[24px] overflow-hidden border border-gray-100 shadow-md aspect-[3/4]">
              <img
                src="/thuonghieuchuyendoi/images/vu-kim-khanh-hero.jpg"
                alt="Th.S Vũ Kim Khánh chân dung"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* 2 cột: text trái — ảnh phải */}
          <div className="grid grid-cols-[1fr_340px] gap-10 items-start max-[860px]:grid-cols-1 max-[860px]:gap-8">

            {/* Cột trái — nội dung */}
            <div>
              <div className="space-y-4 text-[15px] text-[#111111] font-semibold leading-[1.85] font-sans text-justify">
                <p>
                  Không chỉ là một Doanh nhân và Nhà đào tạo chuyên nghiệp trong lĩnh vực xây dựng thương hiệu cá nhân và bán hàng mà còn là <span className="text-[#e25010] font-extrabold">một biểu tượng của sự kiên trì, vượt khó, tạo ra những kết quả không tưởng từ con số 0</span>. Với hơn 6 năm kinh nghiệm kinh doanh và đào tạo ông trở thành nguồn cảm hứng cho hàng chục nghìn người qua hơn 100 khoá học seminar, đồng thời đồng hành cùng hơn 10 doanh nghiệp doanh thu triệu đô.
                </p>
                <p>
                  Sở hữu hệ thống kênh mạng xã hội <span className="text-[#e25010] font-extrabold">&gt;400.000 Follower</span> nơi ông chia sẻ kiến thức về phát triển bản thân, kinh doanh và hạnh phúc gia đình. Trở thành một nguồn thông tin đáng tin cậy dẫn đường cho những ai <span className="text-[#e25010] font-extrabold">đam mê kinh doanh và xây dựng hạnh phúc</span>.
                </p>
                <p>
                  Không chỉ là một doanh nhân, Vũ Kim Khánh còn là <span className="text-[#e25010] font-extrabold">một vận động viên Marathon mạnh mẽ</span>, đã thể hiện tinh thần thép qua việc hoàn tất cự ly Marathon 42km nhiều lần, tham gia các chuyến trip 20 ngày trong khi doanh nghiệp vẫn vận hành hoạt động bình thường. Những thành tựu này không chỉ phản ánh sự kiên trì nghị lực mà còn minh chứng cho khả năng quản lý thời gian và cân bằng cuộc sống một cách xuất sắc.
                </p>
                <p>
                  Tham gia khoá học của Vũ Kim Khánh bạn sẽ trải nghiệm <span className="text-[#e25010] font-extrabold">một hành trình chuyển hoá</span> từ việc khám phá các tiềm lực của bản thân đến việc xây dựng kênh thương hiệu cá nhân và bán hàng bằng phong cách sống, mở ra cánh cửa mới cho tương lai của bạn.
                </p>
              </div>

              {/* Mobile-only: Ảnh 2, 3, 4 nằm dưới nội dung section */}
              <div className="hidden max-[860px]:flex flex-col gap-3 mt-6">
                <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm aspect-[16/9]">
                  <img
                    src="/thuonghieuchuyendoi/images/mentor-class-1.jpg"
                    alt="Vũ Kim Khánh tại sự kiện"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm aspect-[4/3]">
                    <img
                      src="/thuonghieuchuyendoi/images/mentor-class-2.jpg"
                      alt="Vũ Kim Khánh Marathon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm aspect-[4/3]">
                    <img
                      src="/thuonghieuchuyendoi/images/mentor-class-3.jpg"
                      alt="Vũ Kim Khánh hoạt động"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop-only: Cột phải với đủ 4 ảnh */}
            <div className="flex flex-col gap-3 max-[860px]:hidden">
              {/* Ảnh 1: Chân dung chính (trên cùng) */}
              <div className="rounded-[24px] overflow-hidden border border-gray-100 shadow-md aspect-[3/4]">
                <img
                  src="/thuonghieuchuyendoi/images/vu-kim-khanh-hero.jpg"
                  alt="Th.S Vũ Kim Khánh chân dung"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Ảnh 2: Giải thưởng / Sự kiện (ngang ở giữa) */}
              <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm aspect-[16/9]">
                <img
                  src="/thuonghieuchuyendoi/images/mentor-class-1.jpg"
                  alt="Vũ Kim Khánh tại sự kiện"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ảnh 3 & 4: Marathon & Bán hàng (2 ảnh song song ở dưới) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm aspect-[4/3]">
                  <img
                    src="/thuonghieuchuyendoi/images/mentor-class-2.jpg"
                    alt="Vũ Kim Khánh Marathon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm aspect-[4/3]">
                  <img
                    src="/thuonghieuchuyendoi/images/mentor-class-3.jpg"
                    alt="Vũ Kim Khánh hoạt động"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════════
           SECTION 7 — TỔNG HỢP CHƯƠNG TRÌNH
      ══════════════════════════════════════════ */}
      <section className="bg-white text-center py-20 max-[680px]:py-10 border-t-[3px] border-t-[#f0f0f0]" data-section="methodology">
        <div className={container}>
          <h2 className={sectionTitle + " mb-4"}>
            7 NGÀY XÂY KÊNH CHUYỂN ĐỔI THAY ĐỔI TOÀN BỘ CÔNG VIỆC KINH DOANH SỰ NGHIỆP CỦA BẠN TRÊN ONLINE
          </h2>
          <p className="text-[16px] md:text-[18px] font-black font-montserrat text-[#e25010] uppercase tracking-wider mb-6">
            PHƯƠNG PHÁP ĐÀO TẠO ACTION LEARNING
          </p>

          <div className="inline-block bg-[#fff8f0] border border-[#f5ddc0] rounded-2xl px-6 py-4.5 mb-8 shadow-inner max-w-[860px] mx-auto">
            <span className="text-[18px] md:text-[22px] font-black font-montserrat text-[#1a1a1a] leading-relaxed block">
              20% HỌC ĐÚNG — 80% LÀM THẬT - 100% MENTOR SỬA TRỰC TIẾP
            </span>
          </div>

          <div className="max-w-[420px] mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl">
            <img src="/thuonghieuchuyendoi/images/chart-practice-80-20.png" alt="20% học lý thuyết - 80% thực hành kèm cặp" className="w-full h-auto block mx-auto" />
          </div>

          <div className="max-w-[760px] mx-auto text-[#333] text-justify text-[15.5px] leading-relaxed space-y-4 mb-10 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200">
            <p className="font-semibold text-[17px] text-[#e25010] italic border-b border-gray-200 pb-3">
              * Chưa từng có tiền lệ một chương trình kết hợp cả việc HỌC và THỰC HÀNH trong cùng một chương trình.
            </p>
            <p>
              Học viên sẽ trải nghiệm bằng việc học kiến thức tới đâu, thực hành ngay tới đó liên tục trong 7 ngày, với sự hỗ trợ kèm cặp của các Mentor. Sai đâu sửa đó, từng nội dung Video và bài viết.
            </p>
            <p className="font-medium text-[16px] text-[#1a1a1a]">
              👉 Kết thúc 7 ngày khám và định hướng tư vấn kênh 1:1.
            </p>
          </div>

          <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={"inline-block " + ctaButtonInline + " text-[12px] md:text-[13px] px-10 py-3 animate-btn-pulse"}>
            YES! TÔI MUỐN BẮT ĐẦU XÂY KÊNH
          </a>
          <p className="text-[17px] text-gray-600 mt-4 max-[680px]:text-[15px] font-bold font-montserrat">
            Không cần nổi tiếng — Không cần thiết bị chuyên nghiệp — Không cần biết quay dựng phức tạp..
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 8 — LỰA CHỌN HẠNG VÉ CỦA BẠN
      ══════════════════════════════════════════ */}
      <section className="bg-[#0d0b26] py-20 max-[680px]:py-10" data-section="pricing-tiers">
        <div className={container}>
          <h2 className="text-[19px] min-[390px]:text-[21px] sm:text-[26px] md:text-[36px] font-black font-montserrat uppercase text-white leading-tight mb-2.5 text-center whitespace-nowrap">LỰA CHỌN HẠNG VÉ CỦA BẠN</h2>
          <p className="text-center text-[#e25010] font-extrabold text-[16.5px] md:text-[18.5px] mb-12 leading-relaxed">Chọn đúng hạng vé phù hợp với mục tiêu 7 ngày <br className="max-[680px]:inline hidden" /><span className="whitespace-nowrap">tới của bạn</span></p>

          <div className="grid grid-cols-3 gap-6 max-[860px]:grid-cols-1 max-[860px]:gap-8 items-start max-[860px]:max-w-[330px] max-[860px]:mx-auto">
            {[
              {
                key: "Silver",
                subtitle: "Hạng vé chung",
                items: ["Học qua Elearning", "Hỏi đáp trong nhóm"],
                original: null,
                price: "568.000",
                ghiChu: "Silver — 568.000đ",
              },
              {
                key: "Gold",
                subtitle: "Hạng vé Gold, đã đăng ký 58%",
                items: [
                  "Học qua Elearning",
                  "Hỏi đáp trong nhóm",
                  "Chữa bài 7 ngày",
                  "Phiên coach chiến lược 1:1",
                  "Hoàn tiền nếu không hài lòng",
                ],
                original: "1.468.000đ",
                price: "868.000",
                ghiChu: "Gold — 868.000đ",
              },
              {
                key: "Diamond",
                subtitle: "Hạng vé Diamond, đã đăng ký 76%",
                items: [
                  "Học qua Elearning",
                  "Hỏi đáp trong nhóm",
                  "Chữa bài 7 ngày",
                  "Phiên coach chiến lược 1:1",
                  "Hoàn tiền nếu không hài lòng",
                  "Nhóm riêng kết nối CEO",
                  "Tặng 1 trong 3 khoá học online trị giá 2 triệu đồng",
                ],
                original: "3.268.000đ",
                price: "1.868.000",
                ghiChu: "Diamond — 1.868.000đ",
              },
            ].map((tier) => (
              <div key={tier.key} className="rounded-2xl bg-white px-6 py-8 flex flex-col text-center shadow-lg">
                <h3 className="text-[40px] md:text-[44px] font-black font-montserrat text-[#1a1a2e] uppercase leading-tight mb-1">{tier.key}</h3>
                <p className="text-[16.5px] font-semibold text-gray-600 mb-3">{tier.subtitle}</p>
                <div className="h-px bg-gray-200 mb-4" />
                <ul className="space-y-1.5 text-[20px] md:text-[21px] font-bold text-[#111111] mb-4 text-left leading-snug">
                  {tier.items.map((item) => (
                    <li key={item} className="flex gap-2.5 items-start">
                      <span className="text-[#e30a0a] font-black">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {tier.original && (
                  <p className="text-[22px] max-[480px]:text-[20px] text-[#e30a0a] line-through leading-none mb-1 font-bold font-montserrat">{tier.original}</p>
                )}
                <p className="text-[42px] max-[480px]:text-[36px] font-black font-montserrat text-[#e30a0a] mb-4 leading-none whitespace-nowrap">
                  {tier.price} <span className="text-[32px] max-[480px]:text-[26px] font-black">VND</span>
                </p>
                <a
                  href="#register"
                  onClick={(e) => {
                    setGhiChu(tier.ghiChu);
                    handleAnchorClick(e, "register");
                  }}
                  className={"inline-block max-w-[220px] w-full mx-auto " + ctaButton + " py-3.5 text-sm active:scale-95 font-bold uppercase rounded-xl"}
                >
                  Bấm để nhận vé
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 9 — CTA: ĐĂNG KÝ THAM GIA
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0d] py-16 max-[680px]:py-9" data-section="register-cta">
        <div className={container}>
          <div className="grid grid-cols-[1fr_1.15fr] gap-10 items-start max-[860px]:grid-cols-1 max-[860px]:gap-7">
            <div className="text-white max-[860px]:text-center">
              <h2 className="text-[19px] min-[390px]:text-[22px] sm:text-[28px] md:text-[36px] font-black font-montserrat uppercase leading-[1.2] mb-3 text-[#e25010] whitespace-nowrap">7 Ngày Xây Kênh Chuyển Đổi</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[16.5px] text-white font-medium mb-6 max-[860px]:justify-center">
                <span>🗓️ Tháng 8.2026</span>
                <span>📍 Kèm cặp liên tục 7 ngày</span>
              </div>
              <img src="/thuonghieuchuyendoi/images/event-stage-crowd.jpg" alt="Sự kiện hội nghị bán hàng" className="w-full rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] max-[860px]:max-w-[420px] max-[860px]:mx-auto" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-[#222] relative" id="register">
              <h3 className="text-center text-[22px] font-black font-montserrat text-[#d0212a] mb-5 uppercase tracking-wide">Đăng ký ngay</h3>

              <form className="[&>input]:w-full [&>input]:border-[1.5px] [&>input]:border-[#e5e7eb] [&>input]:rounded-lg [&>input]:px-4 [&>input]:py-2.5 [&>input]:text-base [&>input]:mb-2.5 [&>input]:outline-none [&>input]:block max-[680px]:[&>input]:text-[15px] [&>input]:focus:border-[#e25010] [&>input]:font-montserrat" onSubmit={handleSubmit} onFocusCapture={() => { formTouchedRef.current = true; }}>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Nhập tên của bạn"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại của bạn"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <p className="text-[15px] font-bold font-montserrat text-gray-800 mb-2">Lựa chọn hạng vé của bạn</p>
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    "Silver — 568.000đ",
                    "Gold — 868.000đ",
                    "Diamond — 1.868.000đ",
                  ].map((opt) => {
                    const active = ghiChu === opt;
                    return (
                      <label
                        key={opt}
                        className={
                          "flex items-center gap-3 border-[1.5px] rounded-lg px-4 py-2.5 cursor-pointer transition-all " +
                          (active ? "border-[#e25010] bg-[#fff8f0] shadow-sm font-semibold text-[#e25010]" : "border-[#e5e7eb] hover:bg-gray-50")
                        }
                      >
                        <input
                          type="radio"
                          name="hangVe"
                          value={opt}
                          checked={active}
                          onChange={(e) => setGhiChu(e.target.value)}
                          required
                          className="accent-[#e25010] w-4.5 h-4.5 shrink-0"
                        />
                        <span className="text-[15px] text-[#333] font-montserrat">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                <input
                  type="text"
                  name="maSoThue"
                  placeholder="Mã số thuế (Nếu có)"
                  value={maSoThue}
                  onChange={(e) => setMaSoThue(e.target.value)}
                />

                {submitError && (
                  <p className="text-[13.5px] text-[#d03b3b] font-semibold text-center mb-3 leading-[1.5]">{submitError}</p>
                )}

                <button type="submit" disabled={isSubmitting} className={"block w-full " + ctaButton + " py-3.5 text-center tracking-wider text-base cursor-pointer active:scale-95 animate-btn-pulse"}>
                  {isSubmitting ? "Đang đăng ký..." : "Đăng ký ngay"}
                </button>
              </form>

              <div className="flex justify-center items-center gap-1.5 mt-5">
                <div className="flex flex-col items-center"><span className="block bg-[#e25010] text-white text-[28px] font-black font-montserrat px-3 py-1.5 rounded-lg min-w-[55px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px] shadow-sm">{timeParts.h}</span><small className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Giờ</small></div>
                <div className="text-2xl font-black text-gray-300 mb-5 px-0.5">:</div>
                <div className="flex flex-col items-center"><span className="block bg-[#e25010] text-white text-[28px] font-black font-montserrat px-3 py-1.5 rounded-lg min-w-[55px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px] shadow-sm">{timeParts.m}</span><small className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Phút</small></div>
                <div className="text-2xl font-black text-gray-300 mb-5 px-0.5">:</div>
                <div className="flex flex-col items-center"><span className="block bg-[#e25010] text-white text-[28px] font-black font-montserrat px-3 py-1.5 rounded-lg min-w-[55px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px] shadow-sm">{timeParts.s}</span><small className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Giây</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 10 — SOCIAL PROOF
      ══════════════════════════════════════════ */}
      <section className="py-10 max-[680px]:py-6 bg-[#faf9f7]" data-section="social-proof">
        <div className={container}>
          <h2 className={sectionTitle + " text-center mb-8"}>
            Đừng tin những gì <br className="max-[680px]:inline hidden" /><span className="whitespace-nowrap">tôi nói, </span><br className="md:inline hidden" />đây là những gì <br className="max-[680px]:inline hidden" /><span className="whitespace-nowrap">người khác nói…</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[860px] mx-auto mt-6 mb-4">
            {[
              { value: "500+", label: "học viên đã được đào tạo" },
              { value: "12+", label: "ngành nghề đã được tư vấn" },
              { value: "500+", label: "kênh đã được đánh giá và tối ưu" },
              { value: "500+", label: "học viên đã tạo ra khách hàng hoặc đơn hàng từ nội dung" },
            ].map((s, idx) => (
              <div key={idx} className="bg-white border-[1.5px] border-[#eee] rounded-[14px] px-4 py-6 text-center shadow-sm">
                <p className="text-[34px] md:text-[40px] font-black text-[#e25010] leading-none mb-2 font-montserrat">{s.value}</p>
                <p className="text-[13px] text-[#555] font-semibold leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feedback bằng bài đăng của học viên (Rút gọn còn 4 ảnh thật, Masonry 2 cột trên desktop, xếp dọc 1 cột trên mobile) */}
          <div className="mt-4 mb-8 max-w-[960px] mx-auto">
            {/* Giao diện Desktop: Grid 2 cột */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="flex flex-col gap-6">
                {[1, 3].map((num) => (
                  <div key={num} className="bg-white border border-[#eee] rounded-2xl overflow-hidden shadow-md relative w-full h-auto">
                    <img
                      src={`/thuonghieuchuyendoi/images/feedback-img-${num}.jpg`}
                      alt={`Feedback học viên ${num}`}
                      className="w-full h-auto block"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/450x600/fff3f3/e30a0a?text=Feedback+Ảnh+${num}`;
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Cột 2 */}
              <div className="flex flex-col gap-6">
                {[2, 4].map((num) => (
                  <div key={num} className="bg-white border border-[#eee] rounded-2xl overflow-hidden shadow-md relative w-full h-auto">
                    <img
                      src={`/thuonghieuchuyendoi/images/feedback-img-${num}.jpg`}
                      alt={`Feedback học viên ${num}`}
                      className="w-full h-auto block"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/450x600/fff3f3/e30a0a?text=Feedback+Ảnh+${num}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Giao diện Mobile: Xếp chồng 1 cột cuộn dọc */}
            <div className="md:hidden flex flex-col gap-5">
              {Array.from({ length: 4 }).map((_, idx) => {
                const num = idx + 1;
                return (
                  <div key={num} className="bg-white border border-[#eee] rounded-2xl overflow-hidden shadow-md relative w-full h-auto">
                    <img
                      src={`/thuonghieuchuyendoi/images/feedback-img-${num}.jpg`}
                      alt={`Feedback học viên ${num}`}
                      className="w-full h-auto block"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/450x600/fff3f3/e30a0a?text=Feedback+Ảnh+${num}`;
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Nút đăng ký lớn đặt ngay dưới ảnh thứ 4 */}
            <div className="text-center mt-10">
              <a
                href="#register"
                onClick={(e) => handleAnchorClick(e, "register")}
                className={"inline-block w-full max-w-[760px] " + ctaButtonInline + " text-[13px] md:text-[14.5px] py-3.5 text-center animate-btn-pulse font-extrabold uppercase"}
              >
                YES! TÔI MUỐN THAM GIA HÀNH TRÌNH 7 NGÀY XÂY KÊNH CHUYỂN ĐỔI
              </a>
            </div>
          </div>

          {/* Feedback bằng Video (3 video thật) */}
          <div className="my-12">
            <div className="grid grid-cols-3 gap-3 max-w-[700px] mx-auto max-[480px]:gap-2">
              {["testimonial-1", "testimonial-2", "testimonial-3"].map((file, idx) => (
                <div key={file} className="bg-white border border-[#eee] rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-[9/16] bg-[#111]">
                    {playingTestimonial === idx ? (
                      <video
                        src={`/thuonghieuchuyendoi/Video/${file}.mp4`}
                        poster={`/thuonghieuchuyendoi/images/${file}-poster.jpg`}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPlayingTestimonial(idx)}
                        className="absolute inset-0 w-full h-full group cursor-pointer"
                        aria-label={`Phát video cảm nhận học viên ${idx + 1}`}
                      >
                        <img
                          src={`/thuonghieuchuyendoi/images/${file}-poster.jpg`}
                          alt={`Cảm nhận học viên ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                          <div className="w-12 h-12 max-[480px]:w-7 max-[480px]:h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-5 h-5 max-[480px]:w-3.5 max-[480px]:h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="p-3 max-[480px]:p-1.5 text-center">
                    <p className="font-bold text-[14px] max-[480px]:text-[10px] text-gray-800 font-montserrat leading-tight">{["Vũ Hải", "Phạm Minh Vương", "Quỳnh Thương"][idx]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kênh học viên thành công (chạy ngang) */}
          <div className="my-12">
            <h3 className="text-center text-lg font-extrabold font-montserrat text-[#e25010] uppercase mb-6">
              Kênh học viên thành công
            </h3>
            <div className="w-full overflow-hidden py-4 bg-gray-50 border-y border-[#eee] rounded-lg">
              <div className="animate-marquee whitespace-nowrap flex gap-6">
                {[
                  "Kênh học viên: Quỳnh Thương",
                  "Kênh học viên: Hường Nguyễn",
                  "Kênh học viên: Huyền Lắm Mẹo",
                  "Kênh học viên: Vũ Hải xe điện",
                  "Kênh học viên: Tuân Vũ",
                  "Kênh học viên: Thảo Ly",
                  "Kênh học viên: Hương Phạm",
                  "Kênh học viên: Nguyen Thanh Ha",
                  "Kênh học viên: Minh Phượng sinh lý",
                  "Kênh học viên: Nhung Trương Daily",
                  "Kênh học viên: Trương thị huyền trang",
                  "Kênh học viên: Minh Vương thuận mộc"
                ].map((label, idx) => (
                  <span key={idx} className="bg-white border border-[#eee] rounded-full px-6 py-2.5 text-[14.5px] font-bold text-gray-700 shadow-sm inline-block font-montserrat">
                    {label}
                  </span>
                ))}
                {/* Loop copy */}
                {[
                  "Kênh học viên: Quỳnh Thương",
                  "Kênh học viên: Hường Nguyễn",
                  "Kênh học viên: Huyền Lắm Mẹo",
                  "Kênh học viên: Vũ Hải xe điện",
                  "Kênh học viên: Tuân Vũ",
                  "Kênh học viên: Thảo Ly",
                  "Kênh học viên: Hương Phạm",
                  "Kênh học viên: Nguyen Thanh Ha",
                  "Kênh học viên: Minh Phượng sinh lý",
                  "Kênh học viên: Nhung Trương Daily",
                  "Kênh học viên: Trương thị huyền trang",
                  "Kênh học viên: Minh Vương thuận mộc"
                ].map((label, idx) => (
                  <span key={`dup-${idx}`} className="bg-white border border-[#eee] rounded-full px-6 py-2.5 text-[14.5px] font-bold text-gray-700 shadow-sm inline-block font-montserrat">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 10.5 — CHỌN CHỖ NGỒI TỐT NHẤT
      ══════════════════════════════════════════ */}
      <section className="py-12 bg-gradient-to-b from-[#f9f9f9] to-[#f3f3f3] text-center border-t border-b border-[#eee]" data-section="choose-seat">
        <div className={container}>
          <h3 className="text-[23px] md:text-[28px] font-extrabold text-[#e25010] font-montserrat uppercase tracking-wide mb-3">
            ĐĂNG KÝ THAM GIA NGAY <br className="max-[680px]:inline hidden" />HÔM NAY
          </h3>
          <p className="text-[14px] md:text-[15.5px] text-[#e25010] font-bold max-w-[760px] mx-auto mb-8 leading-relaxed px-4">
            Đây chính là thời điểm sẽ giúp bạn thoát ra khỏi tình trạng hiện nay và TĂNG TỐC DOANH NGHIỆP phát triển đột phá.
          </p>
          <div className="mt-2">
            <a
              href="#register"
              onClick={(e) => handleAnchorClick(e, "register")}
              className={"inline-block " + ctaButtonInline + " text-[12px] md:text-[13px] px-12 py-3.5 text-center animate-btn-pulse font-extrabold uppercase"}
            >
              GIỮ CHỖ CHO TÔI
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           FOOTER
      ══════════════════════════════════════════ */}
      <footer
        className="text-white pt-10 pb-6 relative overflow-hidden font-montserrat border-t border-white/10"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(11, 16, 44, 0.98), rgba(16, 26, 68, 0.95)), url('/thuonghieuchuyendoi/images/banner.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className={container + " flex gap-8 flex-wrap justify-between pb-4 max-[680px]:flex-col max-[680px]:items-center"}>
          <div className="max-w-[460px]">
            <h4 className="text-[19px] font-black mb-4 text-[#ffe066] uppercase tracking-wide max-[680px]:text-[16px]">CÔNG TY CỔ PHẦN FLOWMAX GLOBAL</h4>
            <p className="text-[16px] mb-2.5 text-gray-200 leading-relaxed max-[680px]:text-[14px]">🏢 D01 – L39 An Vượng Villa, KĐT mới Dương Nội, Phường Dương Nội, TP Hà Nội</p>
            <p className="text-[16px] mb-2.5 text-gray-200 leading-relaxed max-[680px]:text-[14px]">🧾 Mã số thuế: 0111301605 – do Sở Tài Chính TP Hà Nội cấp ngày 03/12/2025</p>
            <p className="text-[16px] mb-2.5 text-gray-200 leading-relaxed max-[680px]:text-[14px]">📞 Hotline: 091 5217 659</p>
            <p className="text-[16px] mb-2.5 text-gray-200 leading-relaxed max-[680px]:text-[14px]">✉️ Email: flowmax.contact.vn@gmail.com</p>
          </div>
          <div>
            <iframe
              src="https://maps.google.com/maps?q=An+Vuong+Villa+Ha+Dong+Ha+Noi+Vietnam&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="340"
              height="240"
              className="border border-white/20 rounded-xl block shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-[340px] w-full max-[680px]:max-w-full"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ Công ty Flowmax Global"
            ></iframe>
          </div>
        </div>
      </footer>



      {/* Dialog thông báo đăng ký thành công */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-[2000] animate-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="successModalTitle">
          <div className="bg-white rounded-2xl pt-7 px-6 pb-6 max-w-[380px] w-full max-h-[90vh] overflow-y-auto text-center relative shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-[480px]:pt-[22px] max-[480px]:px-4 max-[480px]:pb-[18px] animate-modal-content">
            <button
              type="button"
              className="absolute top-[14px] right-[14px] w-8 h-8 border-0 bg-[#f2f2f2] text-[#555] rounded-full text-base cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white"
              onClick={() => setSuccessModalOpen(false)}
              aria-label="Đóng"
            >
              ✕
            </button>
            <div className="mb-3 flex justify-center">
              <svg className="w-14 h-14 rounded-full block [stroke-width:3] stroke-white mx-auto animate-circle-fill" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="stroke-[#1b8a3e] fill-none [stroke-width:3]" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: 166, strokeDashoffset: 0 }} />
                <path className="fill-none stroke-white [stroke-width:3] animate-checkmark-draw" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 className="text-[22px] font-extrabold text-[#1b8a3e] mb-1.5 max-[480px]:text-[19px]" id="successModalTitle">Đăng ký thành công!</h3>
            <p className="text-[15px] text-[#555] leading-[1.5] max-[480px]:text-[13.5px]">Cảm ơn bạn đã đăng ký. Tư vấn viên sẽ liên hệ lại để xác nhận sớm nhất.</p>
            <div className="mt-5 pt-5 border-t border-[#eee]">
              <canvas ref={zaloQrCanvasRef} className="w-[140px] h-[140px] mx-auto mb-[14px] rounded-lg border border-[#eee] p-1.5 bg-white block max-[480px]:w-[110px] max-[480px]:h-[110px]"></canvas>
              <a href={zaloLink} target="_blank" rel="noopener noreferrer" id="zaloJoinBtn" className={"flex items-center justify-center " + btnBase + " w-full bg-[#0068ff] text-white text-base"}>
                Tham gia nhóm Zalo
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Cuộn lên đầu trang"
          className="fixed bottom-6 right-4 z-50 w-11 h-11 rounded-full bg-[#e91e8c] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(233,30,140,0.5)] hover:bg-[#c2185b] hover:scale-110 transition-all duration-300 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
