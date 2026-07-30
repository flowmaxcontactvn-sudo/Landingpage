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
  const [ghiChu, setGhiChu] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

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

  // 4. Social proof toast scheduler
  useEffect(() => {
    if (toastDismissed) return;

    const people = [
      { name: "Nguyễn Thị Hương" }, { name: "Trần Văn Minh" }, { name: "Lê Thị Lan" },
      { name: "Phạm Văn Đức" }, { name: "Hoàng Thị Mai" }, { name: "Vũ Văn Tùng" },
      { name: "Đặng Thị Thu" }, { name: "Bùi Văn Hải" }, { name: "Ngô Thị Ngọc" },
      { name: "Đỗ Văn Long" }, { name: "Phạm Minh Tuấn" }, { name: "Nguyễn Thanh Hằng" },
      { name: "Trần Minh Quang" }, { name: "Lê Hoàng Nam" }, { name: "Vũ Hồng Nhung" },
      { name: "Nguyễn Văn Đạt" }, { name: "Phạm Hải Yến" }, { name: "Hoàng Quốc Việt" },
      { name: "Đỗ Thị Thảo" }, { name: "Nguyễn Tuấn Anh" }, { name: "Trần Thu Trang" },
      { name: "Lê Minh Triết" }, { name: "Vũ Thị Vân" }, { name: "Nguyễn Hữu Đạt" },
      { name: "Phạm Thị Thủy" }, { name: "Nguyễn Tiến Dũng" }, { name: "Trần Phương Thảo" },
      { name: "Lê Quốc Bảo" }, { name: "Nguyễn Kiều Trang" }, { name: "Phạm Đức Anh" },
      { name: "Hoàng Minh Huy" }, { name: "Đỗ Kim Oanh" }, { name: "Vũ Duy Khánh" },
      { name: "Trần Thanh Sơn" }, { name: "Nguyễn Ngọc Anh" }, { name: "Lê Thị Hồng" },
      { name: "Nguyễn Việt Bách" }, { name: "Phạm Xuân Mai" }, { name: "Hoàng Tuấn Tú" },
      { name: "Trần Hoài Nam" }, { name: "Đỗ Phương Linh" }, { name: "Nguyễn Khánh Ly" },
      { name: "Lê Anh Đức" }, { name: "Vũ Hoàng Yến" }
    ];

    const avatarColors = ["#d0212a", "#e25010", "#c8961e", "#1b8a3e", "#1868c9", "#7a3fc9"];

    const initials = (name) => {
      const parts = name.trim().split(/\s+/);
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    let hideTimer = null;
    let showTimer = null;

    const showToast = () => {
      if (document.hidden || successModalOpen) {
        showTimer = setTimeout(showToast, 3000);
        return;
      }

      const person = people[Math.floor(Math.random() * people.length)];
      const minutesAgo = 1 + Math.floor(Math.random() * 14);
      const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      setToast({
        visible: true,
        name: person.name,
        time: `${minutesAgo} phút trước`,
        initials: initials(person.name),
        color,
      });

      hideTimer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
        showTimer = setTimeout(showToast, 4000 + Math.random() * 4000);
      }, 3000);
    };

    showTimer = setTimeout(showToast, 1000 + Math.random() * 1000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toastDismissed, successModalOpen]);

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
    formSubmittedRef.current = true;

    // Gửi qua route handler nội bộ — vừa lưu vào Supabase, vừa đồng bộ
    // sang phmax.vn để xử lý CRM ở đó (xem app/api/dang-ky/route.js)
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
        }),
      });
      const json = await res.json();
      if (!json.ok) console.warn("Lưu khách hàng thất bại:", json.error);
    } catch (err) {
      console.warn("Gửi đăng ký thất bại:", err);
    }

    // Show success modal immediately to mimic fast UX
    setTimeout(() => {
      setFullname("");
      setPhone("");
      setEmail("");
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
        className="bg-[#e30a0a] text-white text-center py-3 text-[14.5px] font-bold font-montserrat uppercase tracking-wider max-[680px]:text-[12px] max-[680px]:py-2.5 px-4"
        data-section="announcement-bar"
      >
        7 NGÀY XÂY KÊNH CHUYỂN ĐỔI – ONLINE QUA ZOOM &amp; GROUP KÈM CẶP
      </div>

      {/* ══════════════════════════════════════════
           SECTION 2 — HERO: LỜI HỨA CHÍNH
      ══════════════════════════════════════════ */}
      <section
        className="bg-[linear-gradient(135deg,#0b1120_0%,#141d3d_45%,#1f2b5c_100%)] text-white px-6 py-10 max-[680px]:px-4 max-[680px]:py-6 relative overflow-hidden"
        data-section="hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(226,80,16,0.12),transparent_55%)] pointer-events-none" />
        <div className="max-w-[1140px] mx-auto px-6 max-[680px]:px-4 relative grid grid-cols-[1.1fr_0.9fr] gap-8 items-center max-[860px]:grid-cols-1 max-[860px]:gap-6">
          <div className="relative">
            <div className="w-full aspect-video max-w-[500px] mx-auto rounded-xl overflow-hidden border-[3px] border-white/10 bg-black/60 shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative group cursor-pointer">
              <img
                src="/thuonghieuchuyendoi/images/banner.jpeg"
                alt="Video giới thiệu chương trình"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = "https://placehold.co/500x281/1e293b/ffffff?text=Video+Giới+Thiệu+Chương+Trình";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#e30a0a] text-white flex items-center justify-center shadow-[0_0_25px_rgba(227,10,10,0.5)] group-hover:scale-110 group-hover:bg-[#ff1e1e] transition-all duration-300">
                  <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="text-left max-[860px]:text-center">
            <h1 className="text-[23px] md:text-[30px] font-black font-montserrat leading-[1.25] mb-3.5">
              7 NGÀY BẮT ĐẦU XÂY KÊNH<br />
              VÀ TẠO RA NHỮNG <span className="text-[#f5a623]">KHÁCH HÀNG ĐẦU TIÊN</span><br />
              TỪ NỘI DUNG
            </h1>
            <p className="mb-2 text-[14.5px] opacity-[0.9] leading-[1.6] max-[680px]:text-[13.5px]">
              Bạn sẽ bắt đầu xây dựng được kênh thương hiệu cá nhân thu hút khách hàng và bán hàng bằng việc tham dự chương trình 7 ngày liên tục này.
            </p>
            <p className="mb-4 text-[14.5px] opacity-[0.9] leading-[1.6] max-[680px]:text-[13.5px]">
              Trong suốt 4 năm qua, hơn <strong>2.000 học viên</strong> đã tham dự chương trình xây kênh và bán hàng — bằng những kiến thức có được và sự kèm cặp sát sao công việc kinh doanh, họ đã có rất nhiều thay đổi.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5 text-[14px] font-semibold text-white/80 max-[860px]:justify-center max-[680px]:text-[13px]">
              <span>🗓️ Khai giảng: 03/08/2026</span>
              <span>💻 Địa điểm: Online qua Zoom và kèm cặp tại Group</span>
            </div>
            <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className="inline-block bg-[#e30a0a] hover:bg-[#ff1e1e] text-white font-extrabold text-[13.5px] px-8 py-3.5 rounded-full text-center tracking-wide uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg animate-btn-pulse max-[860px]:mx-auto leading-tight font-montserrat">
              YES! TÔI SẴN SÀNG XÂY KÊNH<br />
              VÀ BỨT PHÁ DOANH THU CỦA MÌNH!
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 3 — GIỚI THIỆU GIẢI PHÁP 1
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="benefits">
        <div className={container}>
          <h2 className={oppTitle}>KHI BẠN THAM GIA CHƯƠNG TRÌNH<br /><span className="whitespace-nowrap">"7 NGÀY XÂY KÊNH CHUYỂN&nbsp;ĐỔI"</span></h2>
          <p className={oppSubtitle + " mb-6"}>Bạn sẽ có cơ hội để:</p>

          <div className="text-center mb-8">
            <img
              src="/thuonghieuchuyendoi/images/section3-benefits.jpg"
              alt="Lợi ích khi tham gia chương trình"
              className="max-w-[760px] w-full h-auto inline-block rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-orange-500/10"
              onError={(e) => {
                e.target.src = "https://placehold.co/760x900/fff8f0/e25010?text=Ảnh+Mô+Tả+Lợi+Ích+Học+Viên+(Section+3)";
              }}
            />
          </div>

          <div className="text-center mt-9">
            <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLgWrap}>
              YES!
              <br />
              TÔI ĐÃ SẴN SÀNG XÂY KÊNH VÀ BỨT PHÁ DOANH THU CỦA MÌNH
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 4 — GIỚI THIỆU GIẢI PHÁP 2 (thư ngỏ)
      ══════════════════════════════════════════ */}
      <section className="bg-[linear-gradient(135deg,#7a1a5c_0%,#5b2a8f_50%,#2a4fb8_100%)] py-16 max-[680px]:py-9" data-section="overcome-barriers">
        <div className={container}>
          <div className="text-center mb-8">
            <h2 className="text-[clamp(28px,3.8vw,42px)] font-extrabold text-white uppercase leading-[1.2] max-[680px]:text-[24px]">ẢO TƯỞNG CỦA BẠN VÀ RÀO CẢN VÔ HÌNH</h2>
          </div>
          <div className="text-center">
            <img
              src="/thuonghieuchuyendoi/images/section4-barriers.jpg"
              alt="Vượt qua các rào cản vô hình"
              className="max-w-[760px] w-full h-auto inline-block rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              onError={(e) => {
                e.target.src = "https://placehold.co/760x800/ffffff/d0212a?text=Ảnh+Thư+Ngỏ+Vượt+Qua+Rào+Cản+(Section+4)";
              }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 5 — VẤN ĐỀ KHÁCH HÀNG ĐANG GẶP
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="customer-pain-points">
        <div className={container}>
          <h2 className={oppTitle + " text-center mb-8"}>ĐÂY LÀ HẦU HẾT VẤN ĐỀ MÀ NHỮNG NGƯỜI<br /><span className="whitespace-nowrap">KINH DOANH ONLINE GẶP PHẢI</span></h2>

          <div className="text-center mb-8">
            <img
              src="/thuonghieuchuyendoi/images/section5-painpoints.jpg"
              alt="Các vấn đề người kinh doanh gặp phải"
              className="max-w-[760px] w-full h-auto inline-block rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-orange-500/10"
              onError={(e) => {
                e.target.src = "https://placehold.co/760x1200/fff8f0/e25010?text=Ảnh+Vấn+Đề+Kinh+Doanh+Online+Gặp+Phải+(Section+5)";
              }}
            />
          </div>

          <div className="text-center">
            <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLgWrap}>
              YES!
              <br />
              TÔI SẴN SÀNG TĂNG TỐC XÂY KÊNH CỦA MÌNH!
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 6 — NGƯỜI DẪN ĐƯỜNG
      ══════════════════════════════════════════ */}
      <section className="bg-[#f4f4f6] border-t-[3px] border-t-[#e6e6ea] py-16 max-[680px]:py-9" data-section="instructor">
        <div className={container}>
          <div className="text-center mb-10">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.15em] text-[#c81e6d] mb-2">Gặp gỡ người huấn luyện</p>
            <h2 className="text-[36px] font-extrabold text-[#c81e6d] uppercase leading-[1.2] max-[680px]:text-[27px] max-[680px]:leading-[1.2]">Th.S Vũ Kim Khánh</h2>
          </div>

          <div className="text-center">
            <img
              src="/thuonghieuchuyendoi/images/section6-instructor.jpg"
              alt="Giới thiệu người dẫn đường Vũ Kim Khánh"
              className="max-w-[760px] w-full h-auto inline-block rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              onError={(e) => {
                e.target.src = "https://placehold.co/760x1000/ffffff/fa8c16?text=Ảnh+Hồ+Sơ+Giảng+Viên+Vũ+Kim+Khánh+(Section+6)";
              }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 7 — TỔNG HỢP CHƯƠNG TRÌNH
      ══════════════════════════════════════════ */}
      <section className="bg-[linear-gradient(115deg,#3a1560_0%,#5b2a8f_45%,#8a1f4a_100%)] text-center py-16 max-[680px]:py-9" data-section="methodology">
        <div className={container}>
          <h2 className="text-[clamp(28px,3.8vw,42px)] font-extrabold text-white uppercase leading-[1.2] mb-8 max-[680px]:text-[24px]">7 NGÀY XÂY KÊNH CHUYỂN ĐỔI<br />THAY ĐỔI TOÀN BỘ CÔNG VIỆC KINH DOANH, SỰ NGHIỆP CỦA BẠN TRÊN&nbsp;ONLINE</h2>

          <div className="text-center mb-8">
            <img
              src="/thuonghieuchuyendoi/images/section7-methodology.jpg"
              alt="Tổng hợp chương trình & tỷ lệ học tập"
              className="max-w-[760px] w-full h-auto inline-block rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              onError={(e) => {
                e.target.src = "https://placehold.co/760x600/fff8f0/e25010?text=Ảnh+Tổng+Hợp+Phương+Pháp+Học+Tập+(Section+7)";
              }}
            />
          </div>

          <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLgWrap}>
            YES!
            <br />
            TÔI MUỐN BẮT ĐẦU XÂY KÊNH
          </a>
          <p className="text-[15px] text-white/60 mt-4 max-[680px]:text-[13px]">Không cần nổi tiếng — Không cần thiết bị chuyên nghiệp — Không cần biết quay dựng phức&nbsp;tạp</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 8 — LỰA CHỌN HẠNG VÉ CỦA BẠN
      ══════════════════════════════════════════ */}
      <section className="bg-[#0b0d16] py-20 max-[680px]:py-10" data-section="pricing-tiers">
        <div className={container}>
          <h2 className="text-[clamp(28px,3.8vw,42px)] font-extrabold font-montserrat text-white uppercase leading-[1.2] text-center mb-12 max-[680px]:text-[24px]">LỰA CHỌN HẠNG VÉ CỦA BẠN</h2>

          <div className="grid grid-cols-3 gap-6 max-[860px]:grid-cols-1 max-[860px]:gap-8 items-stretch">
            {/* Vé Silver */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] px-7 py-9 flex flex-col hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-300">
              <p className="text-xs font-black font-montserrat tracking-wider text-[#888] uppercase mb-1">General</p>
              <h3 className="text-xl font-bold font-montserrat text-gray-800 mb-3">Vé Silver</h3>
              <p className="text-[36px] font-black font-montserrat text-[#0b0b0b] mb-6 leading-none">
                568.000<span className="text-lg font-bold">đ</span>
              </p>
              <ul className="space-y-3.5 text-[15px] text-[#444] mb-8 flex-1">
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Học qua E-learning</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Hỏi đáp trong nhóm</span></li>
              </ul>
              <a
                href="#register"
                onClick={(e) => {
                  setGhiChu("Silver — 568.000đ");
                  handleAnchorClick(e, "register");
                }}
                className="block text-center rounded-lg border-2 border-[#e25010] text-[#e25010] font-bold font-montserrat py-3.5 hover:bg-[#fff8f0] transition-colors uppercase text-sm tracking-wider"
              >
                Chọn Silver
              </a>
            </div>

            {/* Vé Gold */}
            <div className="rounded-2xl bg-[#fffdfa] px-7 py-9 flex flex-col relative shadow-[0_20px_50px_rgba(226,80,16,0.25)] md:scale-[1.05] border-2 border-[#fa8c16] z-10">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#fa8c16] to-[#e25010] text-white text-[11px] font-extrabold px-5 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider">PHỔ BIẾN NHẤT</span>
              <p className="text-xs font-black font-montserrat tracking-wider text-[#e25010] uppercase mb-1 mt-1">VIP Tier</p>
              <h3 className="text-xl font-bold font-montserrat text-[#e25010] mb-3">Vé Gold</h3>
              <p className="text-[36px] font-black font-montserrat text-[#e25010] mb-6 leading-none">
                868.000<span className="text-lg font-bold">đ</span>
              </p>
              <ul className="space-y-3.5 text-[15px] text-[#333] mb-8 flex-1">
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Học qua E-learning</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Hỏi đáp trong nhóm</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Chữa bài 7 ngày</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Phiên coach chiến lược 1:1</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Hoàn tiền nếu không hài lòng</span></li>
              </ul>
              <a
                href="#register"
                onClick={(e) => {
                  setGhiChu("Gold — 868.000đ");
                  handleAnchorClick(e, "register");
                }}
                className="block text-center rounded-lg bg-gradient-to-r from-[#fa8c16] to-[#e25010] text-white font-extrabold font-montserrat py-4 hover:shadow-lg transition-all uppercase text-sm tracking-wider animate-btn-pulse"
              >
                Chọn Gold
              </a>
            </div>

            {/* Vé Diamond */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] px-7 py-9 flex flex-col hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-300">
              <p className="text-xs font-black font-montserrat tracking-wider text-[#888] uppercase mb-1">VVIP Tier</p>
              <h3 className="text-xl font-bold font-montserrat text-gray-800 mb-3">Vé Diamond</h3>
              <p className="text-[36px] font-black font-montserrat text-[#0b0b0b] mb-6 leading-none">
                1.868.000<span className="text-lg font-bold">đ</span>
              </p>
              <ul className="space-y-3.5 text-[15px] text-[#444] mb-8 flex-1">
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Toàn bộ quyền lợi gói Gold</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Nhóm riêng kết nối CEO</span></li>
                <li className="flex gap-2.5 items-start"><span className="text-[#1b8a3e] font-bold">✔</span><span>Tặng 1 trong 3 khoá học online trị giá 2.000.000đ</span></li>
              </ul>
              <a
                href="#register"
                onClick={(e) => {
                  setGhiChu("Diamond — 1.868.000đ");
                  handleAnchorClick(e, "register");
                }}
                className="block text-center rounded-lg border-2 border-[#e25010] text-[#e25010] font-bold font-montserrat py-3.5 hover:bg-[#fff8f0] transition-colors uppercase text-sm tracking-wider"
              >
                Chọn Diamond
              </a>
            </div>
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
              <h2 className="text-[clamp(26px,3.2vw,38px)] font-extrabold uppercase leading-[1.2] mb-3 text-[#e25010]">7 Ngày Xây Kênh Chuyển Đổi</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[16px] text-white/75 mb-6 max-[860px]:justify-center">
                <span>🗓️ Tháng 8.2026</span>
                <span>📍 Kèm cặp liên tục 7 ngày</span>
              </div>
              <img src="/thuonghieuchuyendoi/images/mentor-class-2.jpg" alt="Lớp học xây kênh" className="w-full rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] max-[860px]:max-w-[420px] max-[860px]:mx-auto" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-[#222] relative" id="register">
              <p className="text-center text-lg font-bold font-montserrat text-[#d0212a] mb-5 leading-[1.6] max-[680px]:text-[15px]">Ưu đãi đăng ký sớm chỉ áp dụng <br className="max-[680px]:hidden" />cho số lượng học viên giới hạn!</p>

              <form className="[&>input]:w-full [&>input]:border-[1.5px] [&>input]:border-[#e5e7eb] [&>input]:rounded-lg [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-base [&>input]:mb-3.5 [&>input]:outline-none [&>input]:block max-[680px]:[&>input]:text-[15px] [&>input]:focus:border-[#e25010] [&>input]:font-montserrat" onSubmit={handleSubmit} onFocusCapture={() => { formTouchedRef.current = true; }}>
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
                <div className="flex flex-col gap-2.5 mb-5">
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
                          "flex items-center gap-3 border-[1.5px] rounded-lg px-4 py-3.5 cursor-pointer transition-all " +
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

                <button type="submit" disabled={isSubmitting} className="block w-full py-4 text-center rounded-lg bg-gradient-to-r from-[#e25010] to-[#d0212a] text-white font-extrabold font-montserrat uppercase tracking-wider shadow-[0_10px_20px_rgba(226,80,16,0.3)] hover:shadow-[0_12px_24px_rgba(226,80,16,0.45)] hover:scale-[1.01] active:scale-95 transition-all text-base cursor-pointer animate-btn-pulse">
                  {isSubmitting ? "Đang đăng ký..." : "Đăng ký ngay"}
                </button>
              </form>

              <div className="flex justify-center items-center gap-1.5 mt-6">
                <div className="flex flex-col items-center"><span className="block bg-[#e25010] text-white text-[28px] font-black font-montserrat px-3 py-1.5 rounded-lg min-w-[55px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px] shadow-sm">{timeParts.h}</span><small className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Giờ</small></div>
                <div className="text-2xl font-black text-gray-300 mb-5 px-0.5">:</div>
                <div className="flex flex-col items-center"><span className="block bg-[#e25010] text-white text-[28px] font-black font-montserrat px-3 py-1.5 rounded-lg min-w-[55px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px] shadow-sm">{timeParts.m}</span><small className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Phút</small></div>
                <div className="text-2xl font-black text-gray-300 mb-5 px-0.5">:</div>
                <div className="flex flex-col items-center"><span className="block bg-[#e25010] text-white text-[28px] font-black font-montserrat px-3 py-1.5 rounded-lg min-w-[55px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px] shadow-sm">{timeParts.s}</span><small className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Giây</small></div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-[13.5px] text-gray-500 mb-1.5 leading-[1.6]">* Chú ý: Tư vấn viên sẽ liên lạc lại để xác nhận đăng ký chương trình cho bạn.</p>
                <p className="text-[13.5px] text-gray-500 mb-1.5 leading-[1.6]">* Đây là chương trình online kèm cặp qua E-Learning, không phải học trực tiếp.</p>
                <p className="text-[13.5px] text-gray-500 mb-1.5 leading-[1.6]">* Hãy kiểm tra lại thông tin họ tên và số điện thoại của bạn trước khi bấm đăng ký.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 10 — SOCIAL PROOF
      ══════════════════════════════════════════ */}
      <section className="py-14 bg-[#faf9f7]" data-section="social-proof">
        <div className={container}>
          <h2 className={oppTitle + " text-center"}>Đừng tin những gì tôi nói,<br />đây là những gì người khác&nbsp;nói…</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[860px] mx-auto my-9">
            {[
              { value: "500+", label: "học viên đã được đào tạo" },
              { value: "12+", label: "ngành nghề đã được tư vấn" },
              { value: "500+", label: "kênh đã được đánh giá và tối ưu" },
              { value: "500+", label: "học viên đã tạo ra khách hàng hoặc đơn hàng từ nội dung" },
            ].map((s) => (
              <div key={s.label} className="bg-white border-[1.5px] border-[#eee] rounded-[14px] px-4 py-6 text-center">
                <p className="text-[40px] font-black text-[#e25010] leading-none mb-2 max-[680px]:text-[28px]">{s.value}</p>
                <p className="text-[13px] text-[#666] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          <h3 className="text-center text-lg font-extrabold text-[#e25010] uppercase mb-5 max-[680px]:text-base">Học viên tiêu biểu</h3>
          <div className="grid grid-cols-3 gap-5 max-[680px]:grid-cols-1 mb-12">
            <div className="bg-white border-[1.5px] border-[#eee] rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="relative aspect-square bg-[#222]">
                <video controls preload="none" playsInline poster="/thuonghieuchuyendoi/images/testimonial-1-poster.jpg" className="w-full h-full object-cover block">
                  <source src="/thuonghieuchuyendoi/Video/testimonial-1.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="px-5 py-[18px]">
                <p className="text-lg font-bold text-[#222] mb-0.5">Chị Vũ Hải</p>
                <p className="text-[15px] text-[#888] mb-2.5 italic">Chủ cửa hàng xe điện Vũ Hải & Xe đạp Thống nhất</p>
                <p className="text-[15px] text-[#444] leading-[1.6]">Trước đây cửa hàng của tôi chủ yếu bán cho khách quen hoặc khách vãng lai khu vực lân cận, việc tiếp cận khách trực tuyến còn rất hạn chế. Nhờ chương trình 7 ngày của thầy Khánh, tôi đã tự quay dựng được những video ngắn giới thiệu các dòng xe điện mới và tư vấn chọn xe đạp Thống Nhất. Video thu hút lượng tương tác lớn, nhiều khách hàng ở các khu vực khác chủ động nhắn tin hỏi giá và chốt đơn mua xe!</p>
              </div>
            </div>

            <div className="bg-white border-[1.5px] border-[#eee] rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="relative aspect-square bg-[#222]">
                <video controls preload="none" playsInline poster="/thuonghieuchuyendoi/images/testimonial-2-poster.jpg" className="w-full h-full object-cover block">
                  <source src="/thuonghieuchuyendoi/Video/testimonial-2.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="px-5 py-[18px]">
                <p className="text-lg font-bold text-[#222] mb-0.5">Anh Phạm Minh Vương</p>
                <p className="text-[15px] text-[#888] mb-2.5 italic">Chuyên gia trị liệu, chăm sóc cơ xương khớp (Lâm sàng 5000+ ca, 4+ năm kinh nghiệm)</p>
                <p className="text-[15px] text-[#444] leading-[1.6]">Là một chuyên gia trị liệu, tôi từng nghĩ kiến thức chuyên môn của mình rất khó truyền tải qua video ngắn. Nhờ sự dẫn dắt của thầy Khánh trong chương trình 7 ngày, tôi đã học được cách biến những kiến thức bệnh lý phức tạp thành nội dung chia sẻ ngắn gọn, dễ hiểu và gần gũi. Lượng bệnh nhân tin tưởng và liên hệ đặt lịch khám tại cơ sở tăng trưởng vượt trội!</p>
              </div>
            </div>

            <div className="bg-white border-[1.5px] border-[#eee] rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="relative aspect-square bg-[#222]">
                <video controls preload="none" playsInline poster="/thuonghieuchuyendoi/images/testimonial-3-poster.jpg" className="w-full h-full object-cover block">
                  <source src="/thuonghieuchuyendoi/Video/testimonial-3.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="px-5 py-[18px]">
                <p className="text-lg font-bold text-[#222] mb-0.5">Chị Quỳnh Thương Beauty</p>
                <p className="text-[15px] text-[#888] mb-2.5 italic">Chủ chuỗi spa Quỳnh Thương Beauty Center</p>
                <p className="text-[15px] text-[#444] leading-[1.6]">Với quy mô chuỗi spa, bài toán tiếp cận và thu hút khách hàng mới luôn là ưu tiên hàng đầu. Khóa học đã giúp tôi định hình thương hiệu cá nhân chuyên nghiệp và xây dựng quy trình sản xuất video chăm sóc da chuẩn y khoa bài bản. Lượng khách biết đến spa qua mạng xã hội tăng trưởng mạnh mẽ, giúp spa luôn kín lịch mà không còn phụ thuộc quá nhiều vào chi phí quảng cáo.</p>
              </div>
            </div>
          </div>

          <h3 className="text-center text-lg font-extrabold text-[#e25010] uppercase mb-5 max-[680px]:text-base">Học viên thành công</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            <img src="/thuonghieuchuyendoi/images/mentor-class-1.jpg" alt="Feedback học viên" className="w-full h-auto rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)]" />
            <img src="/thuonghieuchuyendoi/images/mentor-class-2.jpg" alt="Feedback học viên" className="w-full h-auto rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)]" />
            <img src="/thuonghieuchuyendoi/images/mentor-class-3.jpg" alt="Feedback học viên" className="w-full h-auto rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)]" />
            <img src="/thuonghieuchuyendoi/images/mentor-class-4.jpg" alt="Feedback học viên" className="w-full h-auto rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)]" />
          </div>

          <h3 className="text-center text-lg font-extrabold text-[#e25010] uppercase mb-5 max-[680px]:text-base">Kênh học viên thành công</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Kênh học viên #1", "Kênh học viên #2", "Kênh học viên #3", "Kênh học viên #4", "Kênh học viên #5", "Kênh học viên #6", "Kênh học viên #7"].map((label) => (
              <span key={label} className="bg-white border-[1.5px] border-[#eee] rounded-full px-5 py-2 text-[14px] font-semibold text-[#444]">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-white pt-6 max-[680px]:pt-[18px]">
        <div className={container + " flex gap-8 flex-wrap justify-between pb-9 max-[680px]:flex-col max-[680px]:items-center"}>
          <div className="max-w-[420px]">
            <h4 className="text-[19px] font-bold mb-3.5 text-[#222] max-[680px]:text-[15px]">CÔNG TY CỔ PHẦN FLOWMAX GLOBAL</h4>
            <p className="text-[17.5px] mb-2 text-[#444] max-[680px]:text-[14px]">🏢 D01 – L39 An Vượng Villa, KĐT mới Dương Nội, Phường Dương Nội, TP Hà Nội</p>
            <p className="text-[17.5px] mb-2 text-[#444] max-[680px]:text-[14px]">🧾 Mã số thuế: 0111301605 – do Sở Tài Chính TP Hà Nội cấp ngày 03/12/2025</p>
            <p className="text-[17.5px] mb-2 text-[#444] max-[680px]:text-[14px]">📞 Hotline: 091 5217 659</p>
            <p className="text-[17.5px] mb-2 text-[#444] max-[680px]:text-[14px]">✉️ Email: flowmax.contact.vn@gmail.com</p>
          </div>
          <div>
            <iframe
              src="https://maps.google.com/maps?q=An+Vuong+Villa+Ha+Dong+Ha+Noi+Vietnam&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="340"
              height="260"
              className="border-0 rounded-lg block shadow-[0_2px_10px_rgba(0,0,0,0.1)] max-w-[340px] w-full max-[680px]:max-w-full"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ Công ty Flowmax Global"
            ></iframe>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA bar */}
      <div
        className={`fixed bottom-0 inset-x-0 w-full min-[768px]:hidden ${stickyVisible ? "flex" : "hidden"} justify-center items-center z-[1000] bg-white/95 backdrop-blur-md border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-4 py-2.5`}
        id="stickyCta"
      >
        <a
          href="#register"
          onClick={(e) => handleAnchorClick(e, "register")}
          className="block w-full max-w-[420px] bg-[linear-gradient(135deg,#f5c842_0%,#f5a623_100%)] text-[#1a1a1a] font-extrabold py-3.5 rounded-full text-base shadow-[0_4px_15px_rgba(245,166,35,0.4)] text-center uppercase tracking-wide cursor-pointer active:scale-95 transition-transform"
        >
          ĐĂNG KÝ NGAY!
        </a>
      </div>

      {/* Thông báo đăng ký gần đây (social proof) */}
      <div
        className={`fixed left-4 bottom-[100px] z-[999] items-center gap-3 bg-white rounded-xl pl-3 pr-9 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)] max-w-[300px] max-[480px]:left-2.5 max-[480px]:bottom-[86px] max-[480px]:max-w-[250px] max-[480px]:gap-2.5 max-[480px]:pl-2.5 max-[480px]:pr-[30px] max-[480px]:py-2.5 ${toast.visible ? "flex" : "hidden"}`}
        id="signupToast"
        aria-live="polite"
      >
        <button
          type="button"
          className="absolute top-1.5 right-1.5 w-[22px] h-[22px] border-0 bg-transparent text-[#aaa] text-[11px] cursor-pointer flex items-center justify-center rounded-full"
          onClick={() => setToastDismissed(true)}
          aria-label="Đóng"
        >
          ✕
        </button>
        <div
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base max-[480px]:w-[38px] max-[480px]:h-[38px] max-[480px]:text-sm"
          style={{ background: toast.color }}
        >
          {toast.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[14.5px] text-[#222] leading-[1.4] max-[480px]:text-[13px]">
            <strong>{toast.name}</strong> vừa đăng ký tham gia
          </p>
          <p className="text-[12.5px] text-[#999] mt-0.5 max-[480px]:text-[11px]">
            <span>{toast.time}</span>
          </p>
        </div>
      </div>

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
    </div>
  );
}
