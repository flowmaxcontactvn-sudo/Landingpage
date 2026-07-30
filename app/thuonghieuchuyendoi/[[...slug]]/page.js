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
  const sectionDark =
    "bg-[linear-gradient(155deg,#b01010_0%,#c82010_35%,#d93015_65%,#e04020_100%)] text-white relative py-[60px] max-[680px]:py-5";
  const oppTitle =
    "text-2xl font-extrabold text-[#e25010] uppercase leading-[1.25] mb-1 max-[680px]:text-[22px] max-[680px]:leading-[1.22]";
  const oppSubtitle = "text-[19px] text-[#555] max-[680px]:text-[14.5px]";
  const oppIntro =
    "max-w-[760px] mx-auto mb-8 text-[19px] leading-[1.85] text-[#333] text-center max-[680px]:text-[15px] max-[680px]:mb-4";
  const oppMid =
    "max-w-[720px] mx-auto mb-4 text-[19px] leading-[1.85] text-[#333] text-center max-[680px]:text-[15px] max-[680px]:my-3.5";
  const oppClosing =
    "max-w-[720px] mx-auto text-center text-xl font-semibold text-[#e25010] italic max-[680px]:text-[14.5px] max-[680px]:leading-[1.6] max-[680px]:mt-4 max-[680px]:mb-4 max-[680px]:px-4";
  const oppListNoicon =
    "flex flex-col gap-[18px] max-w-[560px] mx-auto mb-[22px] bg-[#fff8f0] border-l-4 border-[#e25010] rounded-md px-6 py-[18px] max-[680px]:gap-1.5 max-[680px]:px-3.5 max-[680px]:py-2.5 max-[680px]:mb-2.5 max-[480px]:px-[18px] max-[480px]:py-3.5";
  const oppListNoiconLi =
    "py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['✔'] before:absolute before:left-0 before:text-[#e25010] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]";
  const checkListGreen =
    "flex flex-col gap-[14px] max-w-[680px] mx-auto mb-7 max-[680px]:gap-2";
  const checkListGreenLi =
    "text-[18px] text-[#333] py-1 pl-[30px] relative leading-[1.65] max-[680px]:text-[15px] max-[680px]:pl-[26px] before:content-['✔'] before:absolute before:left-0 before:top-[6px] before:text-[#1b8a3e] before:text-[13px] max-[680px]:before:top-[3px]";
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
        className="relative overflow-hidden bg-gradient-to-r from-[#0d0404] via-[#1a0808] to-[#0d0404] text-white text-center px-4 py-2.5 text-[14.5px] font-medium flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-[680px]:text-[12.5px] max-[680px]:py-2 border-b border-orange-500/20"
        data-section="announcement-bar"
      >
        {/* Shimmer light effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 w-[200%] h-full bg-[linear-gradient(90deg,transparent_45%,rgba(255,255,255,0.07)_50%,transparent_55%)] pointer-events-none animate-bar-shimmer" />

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 bg-orange-950/60 border border-orange-500/30 px-3 py-0.5 rounded-full text-orange-400 text-[12px] font-bold uppercase tracking-wider max-[680px]:text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Khai giảng: 03/08/2026
          </span>
          
          <span className="text-white/90">
            Chỉ nhận <strong className="text-orange-400 font-extrabold underline decoration-orange-500/50 decoration-2 underline-offset-2">10 học viên</strong> để đội ngũ Mentor có thể theo sát quá trình <span className="whitespace-nowrap">thực hành</span>
          </span>
          
          <a
            href="#register"
            onClick={(e) => handleAnchorClick(e, "register")}
            className="ml-1.5 inline-block bg-gradient-to-r from-[#ff6b00] to-[#ff2c00] text-white font-extrabold text-[12px] px-4 py-2 rounded-full uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap animate-btn-pulse"
          >
            Đăng ký giữ chỗ
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════
           SECTION 2 — HERO: LỜI HỨA CHÍNH
      ══════════════════════════════════════════ */}
      <section
        className="bg-[linear-gradient(150deg,#a50e0e_0%,#c41a10_30%,#d43020_60%,#e04822_100%)] bg-[url('/thuonghieuchuyendoi/images/banner.jpeg')] bg-cover bg-center text-white text-center px-6 pt-12 pb-16 max-[680px]:px-4 max-[680px]:pt-9 max-[680px]:pb-[52px] max-[480px]:px-[14px] max-[480px]:pt-7 max-[480px]:pb-11 relative overflow-hidden"
        data-section="hero"
      >
        <h1 className="text-[clamp(30px,4.6vw,54px)] font-black leading-[1.2] mb-5 relative [text-shadow:-1.5px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_1.5px_0_#000,1.5px_1.5px_0_#000,0px_4px_12px_rgba(0,0,0,0.65)] max-[680px]:text-[clamp(22px,6vw,34px)] max-[480px]:text-[clamp(20px,7vw,28px)]">
          7 NGÀY BẮT ĐẦU XÂY KÊNH<br className="max-[680px]:hidden" />
          VÀ TẠO RA NHỮNG <span className="text-[#f5a623] whitespace-nowrap">KHÁCH HÀNG ĐẦU TIÊN</span><br />
          TỪ NỘI DUNG
        </h1>
        <p className="max-w-[620px] mx-auto mb-4 text-lg opacity-[0.94] leading-[1.8] text-center relative max-[680px]:text-[14.5px] max-[680px]:px-4">
          Bạn sẽ bắt đầu xây dựng được kênh thương hiệu cá nhân thu hút khách hàng và bán hàng bằng việc tham dự chương trình 7 ngày liên tục&nbsp;này.
        </p>
        <p className="max-w-[620px] mx-auto mb-6 text-lg opacity-[0.94] leading-[1.8] text-center relative max-[680px]:text-[14.5px] max-[680px]:px-4">
          Trong suốt 4 năm qua, hơn <strong>2.000 học viên</strong> đã tham dự chương trình xây kênh và bán hàng — bằng những kiến thức có được và sự kèm cặp sát sao công việc kinh doanh, họ đã có rất nhiều thay&nbsp;đổi.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 mb-8 text-[15.5px] font-semibold text-white/90 relative max-[680px]:text-[13px]">
          <span>🗓️ Khai giảng: 03/08/2026</span>
          <span>💻 Địa điểm: Online qua Zoom và kèm cặp tại Group</span>
        </div>
        <div className="relative block w-[260px] mx-auto mb-9 max-[680px]:w-[190px] max-[480px]:w-[160px]">
          <div className="w-[260px] h-[260px] rounded-full overflow-hidden border-[7px] border-[#f5a623] bg-[#f5a623] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-[680px]:w-[190px] max-[680px]:h-[190px] max-[480px]:w-[160px] max-[480px]:h-[160px]">
            <img src="/thuonghieuchuyendoi/images/instructor-avatar.jpg" alt="Th.S Vũ Kim Khánh" className="w-full h-full object-cover" />
          </div>
        </div>
        <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLgWrap}>
          YES! TÔI SẴN SÀNG XÂY KÊNH VÀ BỨT PHÁ DOANH THU CỦA MÌNH
        </a>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 3 — GIỚI THIỆU GIẢI PHÁP 1
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="benefits">
        <div className={container}>
          <div className="text-center mb-8 max-[680px]:mb-5">
            <h2 className={oppTitle}>KHI BẠN THAM GIA CHƯƠNG TRÌNH<br /><span className="whitespace-nowrap">"7 NGÀY XÂY KÊNH CHUYỂN&nbsp;ĐỔI"</span></h2>
            <p className={oppSubtitle}>Bạn sẽ có cơ hội để</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-[820px] mx-auto mb-8 max-[680px]:grid-cols-1 max-[680px]:gap-3">
            {[
              "Thấu hiểu thuật toán các nền tảng.",
              "Làm thế nào để chọn sản phẩm bán trên Online hiệu quả.",
              "Các chiến lược sáng tạo nội dung chuyển đổi.",
              "4 dạng nội dung chuyển đổi dễ dàng cho người mới.",
              "Quy trình quay và edit một video đơn giản.",
              "Xây dựng trang Fanpage, TikTok, Profile trên mạng xã hội.",
              "Đo lường chỉ số và tối ưu nội dung chuyển đổi trên kênh.",
              "Kèm cặp chữa bài từng ngày.",
              "Khám 1:1 định hướng kênh sau khi kết thúc hành trình.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 text-left">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#e25010] text-white text-sm font-extrabold flex items-center justify-center mt-0.5 max-[680px]:w-7 max-[680px]:h-7 max-[680px]:text-[13px]">
                  {i + 1}
                </span>
                <p className="text-[17px] text-[#333] leading-[1.6] pt-0.5 max-[680px]:text-[15px]">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[17px] text-[#999] italic mb-8 max-[680px]:text-[14px]">Và còn nhiều hơn nữa….</p>

          <div className="text-center">
            <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLgWrap}>
              YES! TÔI ĐÃ SẴN SÀNG XÂY KÊNH VÀ BỨT PHÁ DOANH THU CỦA MÌNH
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 4 — GIỚI THIỆU GIẢI PHÁP 2 (thư ngỏ)
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="overcome-barriers">
        <div className={container}>
          <p className={oppIntro}>
            7 ngày xây kênh chuyển đổi là một chương trình liên tục được thiết kế để bạn vượt qua những rào cản bản thân để ngay lập tức xây một kênh thương hiệu cá nhân, bán hàng gia tăng doanh số và thu&nbsp;nhập.
          </p>
          <p className={oppMid}>
            Với những trải nghiệm sống, sự phán xét từ môi trường xung quanh, con người ta chấp nhận những định kiến của người khác về xây kênh, về bán hàng online — tạo ra những nỗi sợ ngăn chúng ta hành&nbsp;động.
          </p>
          <p className={oppMid}>
            Theo thời gian, chúng ta tin đó là sự thật, nó biến thành những rào cản vô hình khi chúng ta phát triển kinh doanh và ngăn cản điều chúng ta muốn làm, muốn có, muốn trở&nbsp;thành.
          </p>
          <p className="max-w-[720px] mx-auto mb-5 text-2xl font-black text-[#d0212a] text-center max-[680px]:text-lg">
            TÔI GỌI ĐÓ LÀ ẢO TƯỞNG!!!
          </p>
          <p className={oppMid}>
            Điều đáng buồn là chúng ta lại coi những ảo tưởng đó là có thật. Chúng ta sẵn sàng mang những điều chúng ta coi là "sự thật" để bao biện cho việc không xây kênh, không bắt đầu làm nội dung, không tạo ra thu&nbsp;nhập. Và dùng nó để chỉ trích ai đó đang có khát khao một kênh truyền thông, một nguồn thu nhập mới mà ta từng khát khao&nbsp;có.
          </p>
          <p className={oppMid}>
            7 ngày xây kênh chuyển đổi là một chương trình liên tục được thiết kế để bạn vượt qua những rào cản bản thân để ngay lập tức xây một kênh thương hiệu cá nhân, bán hàng gia tăng doanh số và thu&nbsp;nhập.
          </p>
          <p className={oppClosing}>
            Tôi mong bạn khi tham gia chương trình sẽ nhận ra những RÀO CẢN vô hình của mình, thách thức chúng rồi vượt qua chúng. Đối diện với nó thay vì TRỐN CHẠY như trước&nbsp;đây!
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 5 — VẤN ĐỀ KHÁCH HÀNG ĐANG GẶP
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="customer-pain-points">
        <div className={container}>
          <h2 className={oppTitle + " text-center"}>ĐÂY LÀ HẦU HẾT VẤN ĐỀ MÀ NHỮNG NGƯỜI<br /><span className="whitespace-nowrap">KINH DOANH ONLINE GẶP PHẢI</span></h2>

          <div className="max-w-[760px] mx-auto mt-6 mb-7">
            <p className="text-[18px] text-[#333] leading-[1.85] mb-4 max-[680px]:text-[15px]">
              Năm 2020, tôi và vợ bắt đầu kinh doanh online từ người làm thuê xuất&nbsp;sắc.
            </p>
            <p className="text-[18px] text-[#333] leading-[1.85] mb-4 max-[680px]:text-[15px]">
              Chúng tôi bắt đầu nhập hàng để bán trên Online, nhưng khi nhìn vào đống hàng đã nhập về, chúng tôi thực sự không biết làm thế&nbsp;nào?
            </p>
            <p className="text-[18px] text-[#333] leading-[1.85] mb-4 max-[680px]:text-[15px]">
              Tôi muốn xây dựng thương hiệu cá nhân nhưng không biết mình nên chia sẻ điều&nbsp;gì?
            </p>
            <p className="text-[18px] text-[#333] leading-[1.85] mb-4 max-[680px]:text-[15px]">
              Muốn quay video nhưng cứ cầm điện thoại lên thì con chữ cứ bay đi đâu, cứng miệng không nói ra&nbsp;được!
            </p>
            <p className="text-[18px] text-[#333] leading-[1.85] mb-4 max-[680px]:text-[15px]">
              Đăng bài lên đều nhưng nội dung ít tương tác, không có khách hàng nào hỏi&nbsp;mua.
            </p>
            <p className="text-[18px] text-[#333] leading-[1.85] mb-4 max-[680px]:text-[15px]">
              Sau này phát triển thêm các kênh như Shopee, TikTok cũng không biết cách chọn sản phẩm, tối ưu nội dung như thế&nbsp;nào?
            </p>
            <p className="text-[18px] text-[#333] leading-[1.85]">
              Xem rất nhiều hướng dẫn, lưu rất nhiều công thức nhưng kênh vẫn chưa tạo ra được kết&nbsp;quả.
            </p>
          </div>

          <p className={oppMid}>Nếu bạn cũng như vậy, có thể bạn đang gặp những sai lầm&nbsp;sau:</p>

          <ul className={oppListNoicon}>
            <li className={oppListNoiconLi}>Follow trước, bán hàng sau.</li>
            <li className={oppListNoiconLi}>Mình không phải idol, không có tài năng nào đặc biệt.</li>
            <li className={oppListNoiconLi}>Đối diện với camera cảm giác như đối diện với kẻ thù.</li>
            <li className={oppListNoiconLi}>Không có người dẫn dắt bạn vượt qua những khó khăn ngày đầu xây kênh.</li>
            <li className={oppListNoiconLi}>Cố gắng bắt đầu bằng một ý tưởng.</li>
          </ul>

          <p className={oppMid}>Tôi đã từng gặp những lỗi như vậy — và không có video, không có đơn&nbsp;hàng.</p>

          <p className="max-w-[720px] mx-auto mb-2 text-xl font-bold text-[#0b0b0b] text-center max-[680px]:text-base">
            Thực tế là bạn không cần triệu view và hàng trăm ngàn Follower mới bán được&nbsp;hàng.
          </p>
          <p className={oppMid}>Họ mua khi nội dung tạo&nbsp;ra:</p>

          <ul className={checkListGreen}>
            <li className={checkListGreenLi}>Sự tin tưởng vào người bán và giải pháp phù hợp với họ.</li>
            <li className={checkListGreenLi}>Người làm nội dung thấu hiểu vấn đề họ đang gặp phải.</li>
            <li className={checkListGreenLi}>Người giới thiệu thực sự hiểu được giá trị của sản phẩm giải quyết được vấn đề.</li>
            <li className={checkListGreenLi}>Trao đúng sản phẩm tới đúng người cần, chứ không phải spam nội dung tới tất cả mọi người.</li>
            <li className={checkListGreenLi}>Biết rõ mình cần hành động gì tiếp theo.</li>
          </ul>

          <p className={oppClosing}>Một kênh ít Follower vẫn có thể bán hàng nếu nội dung đúng và&nbsp;đủ!</p>
          <p className={oppClosing + " mt-3"}>Nội dung hay có thể tạo View, nhưng chỉ nội dung đúng mới tạo ra chuyển&nbsp;đổi.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 6 — NGƯỜI DẪN ĐƯỜNG
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0] text-center"} data-section="instructor">
        <div className={container}>
          <div className="inline-block border-[1.5px] border-[#ccc] rounded-[20px] px-[22px] py-1.5 text-[17px] text-[#666] mb-3">Gặp gỡ người huấn luyện</div>
          <h2 className="text-[26px] font-extrabold text-[#e25010] uppercase leading-[1.25] mb-8 max-[680px]:text-[22px] max-[680px]:leading-[1.22]">Th.S Vũ Kim Khánh</h2>

          <div className="flex gap-8 items-start text-left max-w-[800px] mx-auto mb-8 flex-wrap justify-center max-[680px]:flex-col max-[680px]:items-center max-[680px]:gap-0">
            <div className="relative shrink-0">
              <img src="/thuonghieuchuyendoi/images/instructor-avatar.jpg" alt="Th.S Vũ Kim Khánh" className="w-[180px] h-[180px] rounded-full object-cover border-4 border-[#f5a623] block" />
            </div>
            <div className="flex-1 min-w-[260px] max-[680px]:min-w-0 max-[680px]:w-full max-[680px]:text-left max-[680px]:bg-[#fff8f0] max-[680px]:border-[1.5px] max-[680px]:border-[#f0d5b0] max-[680px]:rounded-[14px] max-[680px]:px-[18px] max-[680px]:py-5 max-[680px]:mt-4">
              <p className="text-[17px] text-[#444] leading-[1.75] mb-3 max-[680px]:text-[14.5px]">
                Không chỉ là một doanh nhân và nhà đào tạo chuyên nghiệp trong lĩnh vực xây dựng thương hiệu cá nhân và bán hàng, mà còn là một biểu tượng của sự kiên trì, vượt khó, tạo ra những kết quả không tưởng từ con số 0. Với hơn 6 năm kinh nghiệm kinh doanh và đào tạo, ông trở thành nguồn cảm hứng cho hàng chục nghìn người qua hơn 100 khoá học/seminar, đồng thời đồng hành cùng hơn 10 doanh nghiệp doanh thu triệu&nbsp;đô.
              </p>
              <p className="text-[17px] text-[#444] leading-[1.75] mb-3 max-[680px]:text-[14.5px]">
                Sở hữu hệ thống kênh mạng xã hội hơn 400.000 Follower, nơi ông chia sẻ kiến thức về phát triển bản thân, kinh doanh và hạnh phúc gia đình — trở thành nguồn thông tin đáng tin cậy dẫn đường cho những ai đam mê kinh doanh và xây dựng hạnh&nbsp;phúc.
              </p>
              <p className="text-[17px] text-[#444] leading-[1.75] max-[680px]:text-[14.5px]">
                Không chỉ là một doanh nhân, Vũ Kim Khánh còn là một vận động viên Marathon mạnh mẽ — đã hoàn tất cự ly Marathon 42km nhiều lần, tham gia các chuyến trip 20 ngày trong khi doanh nghiệp vẫn vận hành bình thường. Những thành tựu này phản ánh sự kiên trì, nghị lực và khả năng quản lý thời gian, cân bằng cuộc sống một cách xuất&nbsp;sắc.
              </p>
            </div>
          </div>

          <p className="max-w-[760px] mx-auto text-[18px] text-[#555] leading-[1.75] mb-8 max-[680px]:text-[14.5px]">
            Tham gia khoá học của Vũ Kim Khánh, bạn sẽ trải nghiệm một hành trình chuyển hoá từ việc khám phá các tiềm lực của bản thân đến việc xây dựng kênh thương hiệu cá nhân và bán hàng bằng phong cách sống, mở ra cánh cửa mới cho tương lai của&nbsp;bạn.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-[760px] mx-auto mb-9">
            {[
              { label: "Học vấn", value: "Thạc sĩ QTKD" },
              { label: "Đã đào tạo", value: "1000+ học viên" },
              { label: "Đã tư vấn", value: "50+ doanh nghiệp" },
              { label: "Kinh nghiệm", value: "6 năm" },
              { label: "Thành tích nổi bật", value: "10 DN doanh thu >1 triệu $" },
            ].map((s) => (
              <div key={s.label} className="bg-[#fff8f0] border-[1.5px] border-[#f0d5b0] rounded-lg px-2.5 py-3.5 text-center">
                <p className="text-[10.5px] text-[#999] uppercase tracking-wide mb-1.5 leading-tight">{s.label}</p>
                <p className="text-[13.5px] font-extrabold text-[#e25010] leading-snug">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-[720px] mx-auto max-[680px]:gap-2.5">
            <div>
              <img src="/thuonghieuchuyendoi/images/mentor-class-1.jpg" alt="Đồng hành thực chiến" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
            <div>
              <img src="/thuonghieuchuyendoi/images/mentor-class-2.jpg" alt="Học viên thực hành" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
            <div>
              <img src="/thuonghieuchuyendoi/images/mentor-class-3.jpg" alt="Mentor hướng dẫn" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
            <div>
              <img src="/thuonghieuchuyendoi/images/mentor-class-4.jpg" alt="Lớp học xây kênh" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 7 — TỔNG HỢP CHƯƠNG TRÌNH
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0] text-center"} data-section="methodology">
        <div className={container}>
          <h2 className={oppTitle}>7 NGÀY XÂY KÊNH CHUYỂN ĐỔI<br />THAY ĐỔI TOÀN BỘ CÔNG VIỆC KINH DOANH, SỰ NGHIỆP CỦA BẠN TRÊN&nbsp;ONLINE</h2>

          <p className="text-lg font-extrabold text-[#0b0b0b] uppercase mt-6 mb-1 max-[680px]:text-[15px]">Phương pháp đào tạo Action Learning</p>
          <p className="text-[19px] font-extrabold text-[#e25010] uppercase mb-6 max-[680px]:text-[15px]">20% học đúng — 80% làm thật — 100% mentor sửa trực tiếp</p>

          <div className="max-w-[600px] mx-auto mb-4 max-[680px]:mb-3 max-[680px]:px-4 max-[680px]:max-w-[340px]">
            <img src="/thuonghieuchuyendoi/images/chart-practice-80-20.png" alt="20% học lý thuyết - 80% thực hành kèm cặp" className="w-full h-auto block mx-auto" />
          </div>

          <p className="max-w-[680px] mx-auto text-[19px] leading-[1.85] text-[#444] text-center mb-2 max-[680px]:text-[15px]">
            Chưa từng có tiền lệ một chương trình kết hợp cả việc HỌC và THỰC HÀNH trong cùng một chương&nbsp;trình.
          </p>
          <p className="max-w-[680px] mx-auto text-[19px] leading-[1.85] text-[#444] text-center mb-7 max-[680px]:text-[15px]">
            Học viên sẽ trải nghiệm bằng việc học kiến thức tới đâu, thực hành ngay tới đó liên tục trong 7 ngày, với sự hỗ trợ kèm cặp của các Mentor. Sai đâu sửa đó, từng nội dung video và bài&nbsp;viết. Kết thúc 7 ngày, bạn được khám và định hướng tư vấn kênh&nbsp;1:1.
          </p>

          <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLgWrap}>
            YES! TÔI MUỐN BẮT ĐẦU XÂY KÊNH
          </a>
          <p className="text-[15px] text-[#888] mt-4 max-[680px]:text-[13px]">Không cần nổi tiếng — Không cần thiết bị chuyên nghiệp — Không cần biết quay dựng phức&nbsp;tạp</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 8 — LỰA CHỌN HẠNG VÉ CỦA BẠN
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="pricing-tiers">
        <div className={container}>
          <h2 className={oppTitle + " text-center mb-8"}>LỰA CHỌN HẠNG VÉ CỦA BẠN</h2>

          <div className="grid grid-cols-3 gap-5 max-[860px]:grid-cols-1 max-[860px]:gap-6">
            <div className="rounded-2xl border-2 border-[#e2ded4] bg-white px-6 py-8 flex flex-col">
              <p className="text-sm font-extrabold tracking-wide text-[#888] uppercase mb-2">Silver</p>
              <p className="text-[30px] font-black text-[#0b0b0b] mb-5 leading-none">568.000<span className="text-lg font-bold">đ</span></p>
              <ul className="space-y-2.5 text-[15px] text-[#444] mb-7 flex-1">
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Học qua E-learning</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Hỏi đáp trong nhóm</li>
              </ul>
              <a
                href="#register"
                onClick={(e) => {
                  setGhiChu("Silver — 568.000đ");
                  handleAnchorClick(e, "register");
                }}
                className="block text-center rounded-md border-2 border-[#e25010] text-[#e25010] font-bold py-3 hover:bg-[#fff8f0] transition-colors"
              >
                Chọn Silver
              </a>
            </div>

            <div className="rounded-2xl border-2 border-[#e25010] bg-[#fff8f0] px-6 py-8 flex flex-col relative shadow-[0_10px_30px_rgba(226,80,16,0.15)] md:scale-[1.04]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full whitespace-nowrap">PHỔ BIẾN NHẤT</span>
              <p className="text-sm font-extrabold tracking-wide text-[#e25010] uppercase mb-2 mt-2">Gold</p>
              <p className="text-[30px] font-black text-[#0b0b0b] mb-5 leading-none">868.000<span className="text-lg font-bold">đ</span></p>
              <ul className="space-y-2.5 text-[15px] text-[#333] mb-7 flex-1">
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Học qua E-learning</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Hỏi đáp trong nhóm</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Chữa bài 7 ngày</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Phiên coach chiến lược 1:1</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Hoàn tiền nếu không hài lòng</li>
              </ul>
              <a
                href="#register"
                onClick={(e) => {
                  setGhiChu("Gold — 868.000đ");
                  handleAnchorClick(e, "register");
                }}
                className={btnBase + " block bg-[linear-gradient(135deg,#e25010,#d0212a)] text-white text-center"}
              >
                Chọn Gold
              </a>
            </div>

            <div className="rounded-2xl border-2 border-[#e2ded4] bg-white px-6 py-8 flex flex-col">
              <p className="text-sm font-extrabold tracking-wide text-[#888] uppercase mb-2">Diamond</p>
              <p className="text-[30px] font-black text-[#0b0b0b] mb-5 leading-none">1.868.000<span className="text-lg font-bold">đ</span></p>
              <ul className="space-y-2.5 text-[15px] text-[#444] mb-7 flex-1">
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Toàn bộ quyền lợi gói Gold</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Nhóm riêng kết nối CEO</li>
                <li className="flex gap-2"><span className="text-[#1b8a3e]">✔</span>Tặng 1 trong 3 khoá học online trị giá 2.000.000đ</li>
              </ul>
              <a
                href="#register"
                onClick={(e) => {
                  setGhiChu("Diamond — 1.868.000đ");
                  handleAnchorClick(e, "register");
                }}
                className="block text-center rounded-md border-2 border-[#e25010] text-[#e25010] font-bold py-3 hover:bg-[#fff8f0] transition-colors"
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
      <section className={sectionDark + " pb-16"} data-section="register-cta">
        <div className={container}>
          <h2 className="text-center text-[clamp(24px,3.2vw,36px)] font-extrabold text-white uppercase leading-[1.25] mb-2 relative max-[680px]:text-[22px] max-[680px]:leading-[1.22]">7 Ngày Xây Kênh Chuyển Đổi</h2>
          <p className="text-center text-[19px] text-white/85 mb-9 relative max-[680px]:text-[15px]">Tháng 8.2026 — Kèm cặp liên tục 7 ngày</p>

          <div className="max-w-[440px] mx-auto bg-white rounded-[14px] px-[22px] py-7 text-[#222] relative" id="register">
            <div className="flex justify-center items-center gap-1 mb-2">
              <div className="flex flex-col items-center"><span className="block bg-[#111] text-white text-[26px] font-black px-2.5 py-1.5 rounded-md min-w-[50px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px]">{timeParts.h}</span><small className="text-xs text-[#777] mt-[3px]">Giờ</small></div>
              <div className="text-2xl font-black text-[#333] mb-3.5 px-0.5">:</div>
              <div className="flex flex-col items-center"><span className="block bg-[#111] text-white text-[26px] font-black px-2.5 py-1.5 rounded-md min-w-[50px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px]">{timeParts.m}</span><small className="text-xs text-[#777] mt-[3px]">Phút</small></div>
              <div className="text-2xl font-black text-[#333] mb-3.5 px-0.5">:</div>
              <div className="flex flex-col items-center"><span className="block bg-[#111] text-white text-[26px] font-black px-2.5 py-1.5 rounded-md min-w-[50px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px]">{timeParts.s}</span><small className="text-xs text-[#777] mt-[3px]">Giây</small></div>
            </div>
            <p className="text-center text-[17px] font-bold text-[#d0212a] mb-5 leading-[1.6] max-[680px]:text-[14px]">Ưu đãi đăng ký sớm chỉ áp dụng <br className="max-[680px]:hidden" />cho số lượng học viên giới hạn!</p>

            <form className="[&>input]:w-full [&>input]:border-[1.5px] [&>input]:border-[#ddd] [&>input]:rounded-md [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-lg [&>input]:mb-2.5 [&>input]:outline-none [&>input]:block max-[680px]:[&>input]:text-[15px] [&>input]:focus:border-[#e25010]" onSubmit={handleSubmit} onFocusCapture={() => { formTouchedRef.current = true; }}>
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
              <select
                name="hangVe"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                required
                className="w-full border-[1.5px] border-[#ddd] rounded-md px-4 py-3.5 text-lg mb-2.5 outline-none block bg-white text-[#0b0b0b] focus:border-[#e25010] max-[680px]:text-[15px]"
              >
                <option value="" disabled>Lựa chọn hạng vé của bạn</option>
                <option value="Silver — 568.000đ">Silver — 568.000đ</option>
                <option value="Gold — 868.000đ">Gold — 868.000đ</option>
                <option value="Diamond — 1.868.000đ">Diamond — 1.868.000đ</option>
              </select>
              <button type="submit" disabled={isSubmitting} className={"block w-full " + btnBase + " border-[2.5px] border-white bg-[linear-gradient(135deg,#ffe066_0%,#f5c030_100%)] text-[#1a1a1a] shadow-[0_0_25px_rgba(245,166,35,0.8)]"}>
                {isSubmitting ? "Đang đăng ký..." : "Đăng ký ngay"}
              </button>
            </form>

            <div className="mt-3">
              <p className="text-[15px] text-[#888] mb-1 leading-[1.6]">* Chú ý: Tư vấn viên sẽ liên lạc lại để xác nhận đăng ký chương trình cho bạn.</p>
              <p className="text-[15px] text-[#888] mb-1 leading-[1.6]">* Đây là chương trình online kèm cặp qua E-Learning, không phải học trực tiếp.</p>
              <p className="text-[15px] text-[#888] mb-1 leading-[1.6]">* Hãy kiểm tra lại thông tin họ tên và số điện thoại của bạn trước khi bấm đăng ký.</p>
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
                <p className="text-[30px] font-black text-[#e25010] leading-none mb-2 max-[680px]:text-2xl">{s.value}</p>
                <p className="text-[13px] text-[#666] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          <h3 className="text-center text-lg font-extrabold text-[#e25010] uppercase mb-5 max-[680px]:text-base">Feedback bằng video</h3>
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

          <h3 className="text-center text-lg font-extrabold text-[#e25010] uppercase mb-5 max-[680px]:text-base">Feedback bằng hình ảnh</h3>
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
