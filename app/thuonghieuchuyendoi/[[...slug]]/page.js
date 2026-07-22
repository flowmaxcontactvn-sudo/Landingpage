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

  // Countdown state (6 mins 49 seconds original duration)
  const [remaining, setRemaining] = useState(6 * 60 + 49);

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

  // 2. Initial pixel tracking scripts from localstorage
  useEffect(() => {
    const fbPixel = localStorage.getItem("clientFbPixel");
    const ttPixel = localStorage.getItem("clientTtPixel");
    const ggTag = localStorage.getItem("clientGgTag");
    const ytTag = localStorage.getItem("clientYtTag");

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
  }, []);

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
      fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/rpc/ghi_nhan_phien", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ p_landing: LANDING, p_thiet_bi: bucket, p_giay: Math.round(seconds * 10) / 10 }),
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
          const clientGgTag = localStorage.getItem("clientGgTag");
          if (clientGgTag) {
            window.gtag("event", "generate_lead", { send_to: clientGgTag });
          }
          const clientYtTag = localStorage.getItem("clientYtTag");
          const clientYtLabel = localStorage.getItem("clientYtLabel");
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
    "max-w-[720px] mx-auto text-center text-xl font-semibold text-[#e25010] italic max-[680px]:text-[15px] max-[680px]:mt-3 max-[680px]:mb-0";
  const oppListNoicon =
    "flex flex-col gap-[18px] max-w-[560px] mx-auto mb-[22px] bg-[#fff8f0] border-l-4 border-[#e25010] rounded-md px-6 py-[18px] max-[680px]:gap-1.5 max-[680px]:px-3.5 max-[680px]:py-2.5 max-[680px]:mb-2.5 max-[480px]:px-[18px] max-[480px]:py-3.5";
  const oppListNoiconLi =
    "py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['✔'] before:absolute before:left-0 before:text-[#e25010] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]";
  const btnBase =
    "px-9 py-3.5 rounded-md font-bold text-[17px] cursor-pointer text-center tracking-[0.4px] relative overflow-hidden";
  const btnGoldLg =
    "inline-block " + btnBase +
    " border-[2.5px] border-white bg-[linear-gradient(135deg,#ffe066_0%,#f5c030_100%)] text-[#1a1a1a] shadow-[0_0_25px_rgba(245,166,35,0.8)] text-[19px] px-[100px] py-4 whitespace-nowrap max-[680px]:text-base max-[680px]:px-8 max-[680px]:py-[15px]";

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
           SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section
        className="bg-[linear-gradient(150deg,#a50e0e_0%,#c41a10_30%,#d43020_60%,#e04822_100%)] bg-[url('/thuonghieuchuyendoi/images/banner.jpeg')] bg-cover bg-center text-white text-center px-6 pt-12 pb-16 max-[680px]:px-4 max-[680px]:pt-9 max-[680px]:pb-[52px] max-[480px]:px-[14px] max-[480px]:pt-7 max-[480px]:pb-11 relative overflow-hidden"
        data-section="hero"
      >
        <div className="inline-block border-[1.5px] border-white/50 rounded-[20px] px-6 py-[7px] text-[17px] mb-[22px] relative max-[680px]:text-[13px] max-[680px]:px-4 max-[680px]:py-[5px] max-[680px]:mb-4">
          🚀 Chương trình 7 ngày dành cho người mới bắt đầu
        </div>
        <h1 className="text-[clamp(32px,4.8vw,56px)] font-black leading-[1.18] mb-5 uppercase relative [text-shadow:-1.5px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_1.5px_0_#000,1.5px_1.5px_0_#000,0px_4px_12px_rgba(0,0,0,0.65)] max-[680px]:text-[clamp(22px,6vw,36px)] max-[480px]:text-[clamp(20px,7vw,30px)]">
          7 NGÀY BẮT ĐẦU XÂY KÊNH ONLINE<br className="max-[680px]:hidden" />
          VÀ TẠO <span className="text-[#f5a623] whitespace-nowrap">ĐƠN HÀNG ĐẦU TIÊN</span><br />
          TỪ NỘI DUNG
        </h1>
        <div className="flex flex-wrap justify-center gap-[10px] mx-auto mb-5 relative">
          <span className="bg-white/15 border-[1.5px] border-white/40 rounded-3xl px-5 py-2 text-[17px] font-semibold text-white whitespace-nowrap max-[480px]:whitespace-normal max-[480px]:text-sm max-[480px]:px-4 max-[480px]:py-1.5 max-[480px]:leading-[1.4]">🚫 Không học lan man, chỉ nghe lý thuyết</span>
          <span className="bg-white/15 border-[1.5px] border-white/40 rounded-3xl px-5 py-2 text-[17px] font-semibold text-white whitespace-nowrap max-[480px]:whitespace-normal max-[480px]:text-sm max-[480px]:px-4 max-[480px]:py-1.5 max-[480px]:leading-[1.4]">✅ Học – Làm – Trả bài mỗi ngày</span>
        </div>
        <p className="max-w-[580px] mx-auto mb-[14px] text-lg opacity-[0.92] leading-[1.8] text-center relative max-[680px]:text-[14.5px] max-[680px]:px-6 max-[480px]:text-[14px] max-[480px]:px-4">
          Bạn có sản phẩm, dịch vụ hoặc muốn làm affiliate Shopee nhưng chưa biết <span className="whitespace-nowrap">cách xây kênh từ đâu?</span>
        </p>
        <p className="max-w-[580px] mx-auto mb-8 text-lg opacity-[0.92] leading-[1.8] text-center relative max-[680px]:text-[14.5px] max-[680px]:px-6 max-[480px]:text-[14px] max-[480px]:px-4">
          Chương trình <strong>7 Ngày Xây Kênh Chuyển Đổi</strong> giúp bạn biến câu chuyện thương hiệu thành bài viết, video thu hút khách hàng và tạo đơn hàng thật. Bạn sẽ được học, thực hành và nhận góp ý trực tiếp từ <span className="whitespace-nowrap">mentor mỗi ngày.</span>
        </p>
        <div className="relative block w-[280px] mx-auto mb-9 max-[680px]:w-[200px] max-[480px]:w-[170px]">
          <div className="w-[280px] h-[280px] rounded-full overflow-hidden border-[7px] border-[#f5a623] bg-[#f5a623] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-[680px]:w-[200px] max-[680px]:h-[200px] max-[480px]:w-[170px] max-[480px]:h-[170px]">
            <img src="/thuonghieuchuyendoi/images/instructor-avatar.jpg" alt="Th.S Vũ Kim Khánh" className="w-full h-full object-cover" />
          </div>
        </div>
        <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLg}>
          ĐĂNG KÝ THAM GIA NGAY
        </a>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 2 — VẤN ĐỀ CỦA NGƯỜI MỚI
      ══════════════════════════════════════════ */}
      <section className={sectionWhite} data-section="pain-points">
        <div className={container}>
          <div className="flex items-center justify-center gap-4 mb-3 text-center max-[480px]:flex-col max-[480px]:gap-[10px] max-[480px]:mb-2">
            <div>
              <h2 className={oppTitle}>VẤN ĐỀ CỦA NGƯỜI MỚI KHI <br /><span className="whitespace-nowrap">XÂY KÊNH</span></h2>
              <p className={oppSubtitle}>Bạn biết online là con đường phải đi, nhưng lại mắc kẹt ngay từ bước đầu&nbsp;tiên</p>
            </div>
          </div>

          <p className={oppIntro}>
            Bạn thấy người khác bán được hàng từ Facebook, TikTok, Shopee, video ngắn, affiliate. Nhưng đến lượt mình thì lại mắc&nbsp;kẹt:
          </p>

          <ul className={oppListNoicon}>
            <li className="py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['❌'] before:absolute before:left-0 before:text-[#d0212a] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]">Không biết nên đăng gì.</li>
            <li className="py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['❌'] before:absolute before:left-0 before:text-[#d0212a] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]">Không biết quay video thế nào.</li>
            <li className="py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['❌'] before:absolute before:left-0 before:text-[#d0212a] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]">Không biết viết bài sao cho có người mua.</li>
            <li className="py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['❌'] before:absolute before:left-0 before:text-[#d0212a] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]">Không biết chọn sản phẩm nào để bán.</li>
            <li className="py-[5px] pl-5 relative text-xl font-semibold text-[#333] max-[680px]:text-[15px] max-[680px]:py-[2px] max-[680px]:pl-[18px] before:content-['❌'] before:absolute before:left-0 before:text-[#d0212a] before:text-[12px] before:top-[7px] max-[680px]:before:top-[3px]">Không biết dùng AI sao cho ra nội dung thực tế.</li>
          </ul>

          <p className={oppMid}>Đăng bài thì ít tương tác, ít khách hỏi, ít đơn&nbsp;hàng.</p>

          <p className={oppClosing}>
            Vấn đề không phải là bạn thiếu năng lực. Vấn đề là bạn chưa có một lộ trình đủ đơn giản để bắt đầu và đủ thực chiến để tạo ra kết&nbsp;quả.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 3 — SỰ THẬT BẠN CẦN BIẾT
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="truth">
        <div className={container}>
          <div className="flex items-center justify-center gap-4 mb-3 text-center max-[480px]:flex-col max-[480px]:gap-[10px] max-[480px]:mb-2">
            <div>
              <h2 className={oppTitle}>SỰ THẬT BẠN CẦN BIẾT</h2>
              <p className={oppSubtitle}>Bạn không cần hoàn hảo mới được bắt&nbsp;đầu</p>
            </div>
          </div>

          <ul className="flex flex-col gap-[18px] max-w-[760px] mx-auto mb-7 max-[680px]:gap-1.5 max-[680px]:mb-3">
            <li className="flex gap-[14px] items-start text-[19px] text-[#333] max-[680px]:text-[15px] max-[680px]:gap-1.5 max-[680px]:leading-[1.4]"><span className="text-xl shrink-0 mt-px">📌</span><span>Không cần nổi tiếng mới có thể bán hàng.</span></li>
            <li className="flex gap-[14px] items-start text-[19px] text-[#333] max-[680px]:text-[15px] max-[680px]:gap-1.5 max-[680px]:leading-[1.4]"><span className="text-xl shrink-0 mt-px">📌</span><span>Không cần video quá chuyên nghiệp để bắt đầu.</span></li>
            <li className="flex gap-[14px] items-start text-[19px] text-[#333] max-[680px]:text-[15px] max-[680px]:gap-1.5 max-[680px]:leading-[1.4]"><span className="text-xl shrink-0 mt-px">📌</span><span>Không cần học hết mọi công cụ marketing phức tạp.</span></li>
          </ul>

          <p className={oppMid}>Điều bạn cần là:</p>

          <ul className={oppListNoicon}>
            <li className={oppListNoiconLi}>Biết mình bán gì.</li>
            <li className={oppListNoiconLi}>Biết mình nói với ai.</li>
            <li className={oppListNoiconLi}>Biết khách hàng đang đau ở đâu.</li>
            <li className={oppListNoiconLi}>Biết cách biến sản phẩm thành nội dung.</li>
            <li className={oppListNoiconLi}>Biết cách quay dựng, đăng bài, dùng AI và kêu gọi hành động.</li>
          </ul>

          <p className={oppClosing}>Khi có đúng công thức, người mới vẫn có thể bắt đầu tạo ra chuyển động bán hàng trong 7&nbsp;ngày.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 4 — GIẢI PHÁP / DÀNH CHO AI
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0] pb-0 max-[680px]:pb-0"} data-section="audience-fit">
        <div className={container}>
          <div className="flex items-center justify-center gap-4 mb-3 text-center max-[480px]:flex-col max-[480px]:gap-[10px] max-[480px]:mb-2">
            <div>
              <h2 className={oppTitle}>CHƯƠNG TRÌNH <span className="whitespace-nowrap">"7 NGÀY XÂY KÊNH CHUYỂN&nbsp;ĐỔI"</span><br /><span className="whitespace-nowrap">LÀ DÀNH CHO BẠN</span></h2>
              <p className={oppSubtitle}>Chương trình thực chiến dành cho người muốn bắt đầu xây kênh online để bán&nbsp;hàng</p>
            </div>
          </div>

          <ul className={oppListNoicon}>
            <li className={oppListNoiconLi}>Người kinh doanh online.</li>
            <li className={oppListNoiconLi}>Chủ shop, chủ spa, chủ dịch vụ.</li>
            <li className={oppListNoiconLi}>Người bán sản phẩm cá nhân.</li>
            <li className={oppListNoiconLi}>Người làm affiliate Shopee.</li>
            <li className={oppListNoiconLi}>Người muốn xây thương hiệu cá nhân để thu hút khách hàng.</li>
            <li className={oppListNoiconLi}>Người đã học nhiều nhưng chưa triển khai đều.</li>
            <li className={oppListNoiconLi}>Người mới bắt đầu và cần một lộ trình dễ làm ngay.</li>
          </ul>

          <p className={oppClosing}>
            Mục tiêu của chương trình là giúp bạn có nội dung đầu tiên, kênh được kích hoạt, sản phẩm được truyền thông và có cơ hội tạo ra đơn hàng đầu tiên từ&nbsp;online.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 5 — ĐIỂM KHÁC BIỆT (20/80)
      ══════════════════════════════════════════ */}
      <section className="bg-white text-center pt-0 pb-9 -mt-[30px] max-[680px]:py-5" data-section="theory-practice">
        <div className={container}>
          <div className="max-w-[600px] mx-auto mb-4 max-[680px]:mb-3 max-[680px]:px-4">
            <img src="/thuonghieuchuyendoi/images/biểu đồ 2.8.png" alt="20% học lý thuyết - 80% thực hành kèm cặp" className="w-full h-auto block" />
          </div>
          <p className="max-w-[680px] mx-auto text-[19px] leading-[1.85] text-[#444] text-center max-[680px]:text-[15px]">
            Bạn sẽ học lý thuyết nền tảng qua E-Learning để hiểu đúng cách <span className="whitespace-nowrap">làm nội dung chuyển đổi.</span> Nhưng quan trọng nhất là thực hành: làm bài tập, đăng video thật và nhận góp ý từ <span className="whitespace-nowrap">mentor mỗi ngày.</span><br />
            Không chỉ học lý thuyết, bạn thực sự bắt đầu hành động <span className="whitespace-nowrap">để xây kênh.</span>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 6 — CÁCH CHƯƠNG TRÌNH VẬN HÀNH
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="steps">
        <div className={container}>
          <h2 className="text-center text-[clamp(24px,3vw,32px)] font-extrabold text-[#e25010] uppercase leading-[1.25] mb-2 max-[680px]:text-[22px] max-[680px]:leading-[1.22]">⚙️ 3 BƯỚC ĐỂ CÓ NHỮNG KẾT QUẢ ĐẦU TIÊN</h2>
          <p className="text-center text-[19px] text-[#666] mb-9 max-[680px]:text-[15px]">Cách chương trình vận hành</p>
          <div className="grid grid-cols-3 gap-6 max-[680px]:grid-cols-1 max-[680px]:gap-3">
            <div className="bg-[#fff8f0] border-[1.5px] border-[#f0d5b0] rounded-[14px] px-[22px] py-7 text-left max-[680px]:px-[18px] max-[680px]:py-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e25010] text-white text-[19px] font-extrabold mb-3.5 max-[680px]:w-8 max-[680px]:h-8 max-[680px]:text-base max-[680px]:mb-2">1</span>
              <h3 className="text-[19px] font-bold text-[#222] mb-2.5 leading-[1.4] max-[680px]:text-[16.5px] max-[680px]:mb-1.5">📖 Học bài ngắn trên E-Learning</h3>
              <p className="text-[17.5px] text-[#555] leading-[1.7] max-[680px]:text-[14.5px] max-[680px]:leading-[1.45]">Bạn xem các video hướng dẫn ngắn, dễ hiểu, tập trung vào những gì cần làm ngay. Nội dung gồm: định hướng kênh, chọn sản phẩm, hiểu khách hàng, viết bài, quay video, chụp ảnh, dùng AI và tạo lời kêu gọi hành&nbsp;động.</p>
            </div>
            <div className="bg-[#fff8f0] border-[1.5px] border-[#f0d5b0] rounded-[14px] px-[22px] py-7 text-left max-[680px]:px-[18px] max-[680px]:py-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e25010] text-white text-[19px] font-extrabold mb-3.5 max-[680px]:w-8 max-[680px]:h-8 max-[680px]:text-base max-[680px]:mb-2">2</span>
              <h3 className="text-[19px] font-bold text-[#222] mb-2.5 leading-[1.4] max-[680px]:text-[16.5px] max-[680px]:mb-1.5">📝 Nhận bài tập mỗi ngày</h3>
              <p className="text-[17.5px] text-[#555] leading-[1.7] max-[680px]:text-[14.5px] max-[680px]:leading-[1.45]">Mỗi ngày, bạn nhận một nhiệm vụ cụ thể để triển khai trên chính kênh của mình. Không học xong để đó. Mỗi bài học đều gắn với một hành động thực&nbsp;tế.</p>
            </div>
            <div className="bg-[#fff8f0] border-[1.5px] border-[#f0d5b0] rounded-[14px] px-[22px] py-7 text-left max-[680px]:px-[18px] max-[680px]:py-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e25010] text-white text-[19px] font-extrabold mb-3.5 max-[680px]:w-8 max-[680px]:h-8 max-[680px]:text-base max-[680px]:mb-2">3</span>
              <h3 className="text-[19px] font-bold text-[#222] mb-2.5 leading-[1.4] max-[680px]:text-[16.5px] max-[680px]:mb-1.5">🤝 Trả bài và được mentor góp ý</h3>
              <p className="text-[17.5px] text-[#555] leading-[1.7] max-[680px]:text-[14.5px] max-[680px]:leading-[1.45]">Bạn đăng bài, quay video, hoàn thiện kênh và nộp bài theo yêu cầu. Đội ngũ mentor sẽ hỗ trợ soi bài, góp ý, chỉ ra điểm cần sửa và giúp bạn tối ưu để tăng khả năng tạo chuyển&nbsp;đổi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 7 — LỘ TRÌNH 7 NGÀY
      ══════════════════════════════════════════ */}
      <section className={sectionDark} data-section="roadmap">
        <div className={container}>
          <h2 className="text-center text-[clamp(24px,3vw,34px)] font-extrabold text-white uppercase leading-[1.25] mb-10 relative max-[680px]:text-[22px] max-[680px]:leading-[1.22]">Lộ Trình 7 Ngày Kèm Cặp</h2>
          <div className="flex flex-col gap-5 relative">
            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 1</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Xác định hướng kênh và sản phẩm bán</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn làm rõ mình bán gì, bán cho ai và kênh của mình cần truyền tải thông điệp&nbsp;gì.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Có định hướng kênh và bài giới thiệu đầu&nbsp;tiên.</p>
            </div>

            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 2</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Hiểu khách hàng và lý do họ mua</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn học cách nhìn sản phẩm từ góc nhìn khách hàng, không chỉ từ góc nhìn người&nbsp;bán.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Có bài viết chạm đúng nỗi đau hoặc mong muốn của khách&nbsp;hàng.</p>
            </div>

            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 3</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Viết bài bán hàng có chuyển đổi</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn học công thức viết bài khiến người đọc hiểu vấn đề, tin giải pháp và muốn hành&nbsp;động.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Có một bài bán hàng hoàn chỉnh được đăng lên&nbsp;kênh.</p>
            </div>

            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 4</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Quay video chuyển đổi đầu tiên</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn học cách mở đầu video, trình bày thông điệp và kêu gọi khách hàng hành&nbsp;động.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Có video đầu tiên giới thiệu sản phẩm, câu chuyện hoặc giải&nbsp;pháp.</p>
            </div>

            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 5</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Chụp ảnh và trình bày sản phẩm hấp dẫn hơn</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn học cách làm sản phẩm trở nên rõ ràng, đẹp mắt và đáng mua hơn qua hình&nbsp;ảnh.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Có bộ ảnh hoặc bài đăng sản phẩm hấp dẫn&nbsp;hơn.</p>
            </div>

            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 6</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Dùng AI để làm nội dung nhanh hơn</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn học cách dùng AI cơ bản để lên ý tưởng, viết nháp, tạo hook, viết caption và kịch bản&nbsp;video.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Có nội dung được tạo cùng AI nhưng vẫn giữ giọng thật của&nbsp;bạn.</p>
            </div>

            <div className="bg-white rounded-[14px] px-7 py-[26px] text-[#222] max-[680px]:px-4 max-[680px]:py-3.5 max-[680px]:mb-3">
              <span className="inline-block bg-[#d0212a] text-white text-[13px] font-bold px-4 py-1 rounded-xl mb-3">Ngày 7</span>
              <h3 className="text-xl font-bold text-[#e25010] mb-2 leading-[1.4] max-[680px]:text-[17px]">Tối ưu kênh và tạo lời mời mua hàng</h3>
              <p className="text-lg text-[#444] leading-[1.75] mb-2.5 max-[680px]:text-[15px]">Bạn rà soát lại kênh, tối ưu bio, thông tin sản phẩm, CTA, link mua hàng hoặc link&nbsp;affiliate.</p>
              <p className="text-[17.5px] text-[#444] border-l-[3px] border-[#e25010] pl-3 leading-[1.7] max-[680px]:text-[15px]"><strong>Kết quả:</strong> Kênh rõ ràng hơn, nội dung có lời mời mua hàng rõ hơn và sẵn sàng cho buổi khám&nbsp;kênh.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 8 — SAU 7 NGÀY BẠN CÓ GÌ
      ══════════════════════════════════════════ */}
      <section className={sectionWhite} data-section="outcomes">
        <div className={container}>
          <h2 className="text-center text-[clamp(24px,3vw,32px)] font-extrabold text-[#e25010] uppercase leading-[1.25] mb-8 max-[680px]:text-[22px] max-[680px]:leading-[1.22] max-[680px]:mb-4">Sau 7 Ngày Bạn Có</h2>
          <ul className="max-w-[640px] mx-auto">
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Một định hướng kênh rõ ràng hơn.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Một sản phẩm hoặc nhóm sản phẩm để tập trung bán.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Những bài viết đầu tiên có cấu trúc bán hàng.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Những video đầu tiên được quay và đăng.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Ảnh sản phẩm hấp dẫn hơn.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Cách dùng AI đơn giản để không còn bí ý tưởng.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Lượt tương tác, tin nhắn, click link hoặc tín hiệu mua hàng đầu tiên.</li>
            <li className="text-[19px] text-[#333] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Cơ hội tạo đơn hàng đầu tiên từ sản phẩm của bạn hoặc affiliate Shopee.</li>
            <li className="text-[19px] font-bold text-[#e25010] py-2 pl-[30px] relative leading-[1.7] max-[680px]:text-[15px] max-[680px]:py-1 max-[680px]:pl-[22px] before:content-['✔'] before:absolute before:left-0 before:top-[10px] before:text-[#27ae60] before:text-[13px] max-[680px]:before:top-[6px] max-[680px]:before:text-[11px]">Quan trọng nhất: bạn vượt qua rào cản bắt đầu.</li>
          </ul>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 9 — GIẢNG VIÊN VÀ ĐỘI NGŨ MENTOR
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0] text-center"} data-section="instructor">
        <div className={container}>
          <div className="inline-block border-[1.5px] border-[#ccc] rounded-[20px] px-[22px] py-1.5 text-[17px] text-[#666] mb-3">Giảng viên chính</div>
          <h2 className="text-[26px] font-extrabold text-[#e25010] uppercase leading-[1.25] mb-8 max-[680px]:text-[22px] max-[680px]:leading-[1.22]">Người trực tiếp dẫn dắt bạn trong chương trình</h2>

          <div className="flex gap-8 items-start text-left max-w-[800px] mx-auto mb-9 flex-wrap justify-center max-[680px]:flex-col max-[680px]:items-center max-[680px]:gap-0">
            <div className="relative shrink-0">
              <img src="/thuonghieuchuyendoi/images/instructor-avatar.jpg" alt="Th.S Vũ Kim Khánh" className="w-[180px] h-[180px] rounded-full object-cover border-4 border-[#f5a623] block" />
            </div>
            <div className="flex-1 min-w-[260px] max-[680px]:min-w-0 max-[680px]:w-full max-[680px]:text-left max-[680px]:bg-[#fff8f0] max-[680px]:border-[1.5px] max-[680px]:border-[#f0d5b0] max-[680px]:rounded-[14px] max-[680px]:px-[18px] max-[680px]:py-5 max-[680px]:mt-4">
              <h3 className="text-[21px] font-bold text-[#e25010] mb-3 max-[680px]:text-center max-[680px]:text-[17px] max-[680px]:bg-[linear-gradient(135deg,#e25010,#d0212a)] max-[680px]:text-white max-[680px]:px-4 max-[680px]:py-2.5 max-[680px]:-mx-[18px] max-[680px]:-mt-5 max-[680px]:mb-4 max-[680px]:rounded-t-xl">Th.S Vũ Kim Khánh</h3>
              <ul className="mb-4 max-[680px]:mb-3.5">
                <li className="text-[19px] mb-1.5 flex items-start gap-2 max-[680px]:text-left max-[680px]:text-[15px] max-[680px]:mb-2.5 max-[680px]:leading-[1.55] max-[680px]:gap-2.5"><span className="text-[#d0212a] text-[10px] mt-[5px] shrink-0 max-[680px]:mt-1 max-[680px]:text-[8px]">●</span><span>Mentor xây dựng thương hiệu cá nhân, content bán hàng và hệ thống chuyển đổi online.</span></li>
                <li className="text-[19px] mb-1.5 flex items-start gap-2 max-[680px]:text-left max-[680px]:text-[15px] max-[680px]:mb-2.5 max-[680px]:leading-[1.55] max-[680px]:gap-2.5"><span className="text-[#d0212a] text-[10px] mt-[5px] shrink-0 max-[680px]:mt-1 max-[680px]:text-[8px]">●</span><span>Đã cố vấn và đồng hành cùng hàng ngàn học viên, chủ shop xây kênh thực chiến.</span></li>
              </ul>
              <p className="text-[19px] text-[#555] leading-[1.7] max-[680px]:text-left max-[680px]:text-[14.5px] max-[680px]:bg-white max-[680px]:border-l-[3px] max-[680px]:border-[#e25010] max-[680px]:px-3 max-[680px]:py-2.5 max-[680px]:rounded max-[680px]:leading-[1.65]">
                Cùng đội ngũ Mentor đồng hành hỗ trợ soi kênh, sửa bài tập và góp ý trực tiếp mỗi ngày.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-[720px] mx-auto mt-8 max-[680px]:gap-2.5">
            <div>
              <img src="/thuonghieuchuyendoi/images/B%E1%BB%95%20sung%20ph%E1%BA%A7n%20section%209%20(1).jpg" alt="Đồng hành thực chiến" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
            <div>
              <img src="/thuonghieuchuyendoi/images/B%E1%BB%95%20sung%20ph%E1%BA%A7n%20section%209%20(2).jpg" alt="Học viên thực hành" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
            <div>
              <img src="/thuonghieuchuyendoi/images/B%E1%BB%95%20sung%20ph%E1%BA%A7n%20section%209%20(3).jpg" alt="Mentor hướng dẫn" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
            <div>
              <img src="/thuonghieuchuyendoi/images/B%E1%BB%95%20sung%20ph%E1%BA%A7n%20section%209%20(4).jpg" alt="Lớp học xây kênh" className="w-full h-auto block rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 10 — HỌC VIÊN THÀNH CÔNG
      ══════════════════════════════════════════ */}
      <section className="py-14 bg-[#faf9f7]" data-section="testimonials">
        <div className={container}>
          <h2 className="text-center text-[clamp(24px,3vw,32px)] font-extrabold text-[#e25010] uppercase leading-[1.25] mb-9 max-[680px]:text-[22px] max-[680px]:leading-[1.22]">Học Viên Thành Công</h2>
          <div className="grid grid-cols-3 gap-5 max-[680px]:grid-cols-1">
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
                <p className="text-[15px] text-[#888] mb-2.5 italic">Chuyên gia trị liệu, chăm sóc cơ xương khớp (Đau vai gáy, thoái hoá, thoát vị, đau thần kinh toạ. Lâm sàng 5000+ ca, 4+ năm kinh nghiệm)</p>
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
                <p className="text-[15px] text-[#888] mb-2.5 italic">Chủ chuỗi spa QUỲNH THƯƠNG BEAUTY CENTER</p>
                <p className="text-[15px] text-[#444] leading-[1.6]">Với quy mô chuỗi spa, bài toán tiếp cận và thu hút khách hàng mới luôn là ưu tiên hàng đầu. Khóa học đã giúp tôi định hình thương hiệu cá nhân chuyên nghiệp và xây dựng quy trình sản xuất video chăm sóc da chuẩn y khoa bài bản. Lượng khách biết đến spa qua mạng xã hội tăng trưởng mạnh mẽ, giúp spa luôn kín lịch mà không còn phụ thuộc quá nhiều vào chi phí quảng cáo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 11 — ĐỪNG TIẾP TỤC TRÌ HOÃN
      ══════════════════════════════════════════ */}
      <section className={sectionWhite} data-section="urgency">
        <div className={container}>
          <div className="flex items-center justify-center gap-4 mb-3 text-center max-[480px]:flex-col max-[480px]:gap-[10px] max-[480px]:mb-2">
            <div>
              <h2 className={oppTitle}>ĐỪNG ĐỂ VIỆC XÂY KÊNH TIẾP TỤC <br /><span className="whitespace-nowrap">BỊ TRÌ HOÃN</span></h2>
            </div>
          </div>

          <p className={oppIntro}>Mỗi ngày bạn chưa bắt đầu, khách hàng của bạn vẫn đang xem nội dung của người&nbsp;khác.</p>

          <ul className={oppListNoicon}>
            <li className={oppListNoiconLi}>Người khác đang xuất hiện trước bạn.</li>
            <li className={oppListNoiconLi}>Người khác đang tạo niềm tin trước bạn.</li>
            <li className={oppListNoiconLi}>Người khác đang có lượt xem, data, tin nhắn và đơn hàng trước bạn.</li>
          </ul>

          <p className={oppMid}>Nếu tiếp tục chờ đợi hoàn hảo, vài tháng nữa kênh của bạn vẫn trống và bạn vẫn loay hoay chưa biết bắt đầu từ đâu.</p>

          <p className={oppClosing}>Bạn không cần thêm một khóa học để nghe cho hay. Bạn cần một chương trình khiến bạn hành động&nbsp;thật.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 12 + 13 — PHÙ HỢP / KHÔNG PHÙ HỢP
      ══════════════════════════════════════════ */}
      <section className={sectionWhite + " border-t-[3px] border-t-[#f0f0f0]"} data-section="fit-checklist">
        <div className={container}>
          <h2 className="text-center text-2xl font-extrabold text-[#e25010] uppercase leading-[1.25] mb-8 max-[680px]:text-[22px] max-[680px]:leading-[1.22]">CHƯƠNG TRÌNH PHÙ HỢP VỚI AI?</h2>
          <div className="grid grid-cols-2 gap-6 max-[680px]:grid-cols-1">
            <div className="rounded-[14px] px-6 py-7 bg-[#f0fbf3] border-[1.5px] border-[#b8e6c3]">
              <h3 className="text-xl font-bold mb-4 text-[#1b8a3e]">✅ Phù hợp nếu bạn</h3>
              <ul>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✔'] before:absolute before:left-0 before:text-[#1b8a3e] before:font-bold">Muốn bắt đầu xây kênh để bán hàng.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✔'] before:absolute before:left-0 before:text-[#1b8a3e] before:font-bold">Muốn tạo nội dung nhưng chưa biết làm sao.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✔'] before:absolute before:left-0 before:text-[#1b8a3e] before:font-bold">Có sản phẩm/dịch vụ nhưng chưa biết marketing online.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✔'] before:absolute before:left-0 before:text-[#1b8a3e] before:font-bold">Muốn làm affiliate Shopee nhưng chưa biết kéo click và tạo đơn.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✔'] before:absolute before:left-0 before:text-[#1b8a3e] before:font-bold">Muốn dùng AI để làm nội dung nhanh hơn.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✔'] before:absolute before:left-0 before:text-[#1b8a3e] before:font-bold">Muốn có người kèm, soi bài và góp ý trong quá trình làm.</li>
              </ul>
            </div>
            <div className="rounded-[14px] px-6 py-7 bg-[#fdf2f2] border-[1.5px] border-[#f0c0c0]">
              <h3 className="text-xl font-bold mb-4 text-[#d0212a]">❌ Không phù hợp nếu bạn</h3>
              <ul>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✘'] before:absolute before:left-0 before:text-[#d0212a] before:font-bold">Chỉ muốn nghe lý thuyết nhưng không làm bài tập.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✘'] before:absolute before:left-0 before:text-[#d0212a] before:font-bold">Muốn có kết quả nhưng không đăng bài, không quay video, không giới thiệu sản phẩm.</li>
                <li className="text-[18px] text-[#333] pl-[26px] relative mb-2.5 leading-[1.65] max-[680px]:text-[15px] before:content-['✘'] before:absolute before:left-0 before:text-[#d0212a] before:font-bold">Kỳ vọng có đơn hàng mà không hành động.</li>
              </ul>
            </div>
          </div>
          <p className={oppClosing + " mt-7"}>Dành cho người muốn bắt đầu thật.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 14 — ĐĂNG KÝ THAM GIA
      ══════════════════════════════════════════ */}
      <section className={sectionDark + " pb-16"} data-section="pricing-register">
        <div className={container}>
          <div className="text-center mb-[18px] relative" aria-hidden="true">
            <svg width="160" height="55" viewBox="0 0 160 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
              <polyline points="10,5 20,22 30,5" stroke="#c8a200" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="10,24 20,41 30,24" stroke="#c8a200" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="65,5 75,22 85,5" stroke="#c8a200" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="65,24 75,41 85,24" stroke="#c8a200" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="120,5 130,22 140,5" stroke="#c8a200" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="120,24 130,41 140,24" stroke="#c8a200" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          <h2 className="text-center text-[clamp(24px,3vw,36px)] font-extrabold text-white uppercase leading-[1.25] mb-6 relative max-[680px]:text-[22px] max-[680px]:leading-[1.22]">Nếu bạn đã từng muốn xây kênh <br className="max-[680px]:hidden" />nhưng chưa biết bắt đầu từ đâu, đây là lúc bắt đầu</h2>
          <p className="text-center text-[19.5px] font-bold text-white mb-6 leading-[1.5] uppercase relative block max-[680px]:text-[15px]">KHÔNG PHẢI BẰNG MỘT KẾ HOẠCH HOÀN HẢO <br className="max-[680px]:hidden" />MÀ BẰNG 7 NGÀY HÀNH ĐỘNG THẬT
            <span className="inline-block bg-[#ff4500] border-2 border-white rounded-full px-2 py-1.5 text-[11px] ml-2 align-middle">🔥 ĐĂNG KÝ NGAY</span>
          </p>

          <div className="grid grid-cols-2 gap-6 items-start relative max-[860px]:grid-cols-1">
            <div className="bg-white/10 border-[1.5px] border-white/25 rounded-[14px] px-6 py-7 text-white">
              <div>
                <div className="text-xl text-white/75 mb-2">Học phí gốc: <span className="line-through ml-1.5 text-white/45">6.868.000đ</span></div>
                <div className="inline-block bg-[#f5a623] text-[#1a1a1a] text-lg font-bold px-6 py-2.5 rounded-lg shadow-[0_4px_15px_rgba(245,166,35,0.35)] leading-[1.2]">
                  Ưu đãi thanh toán ngay: <strong className="text-[32px] font-black inline-block align-middle ml-1">999.000đ</strong>
                </div>
                <div className="text-sm text-white/70 mt-2.5 italic block">Đã bao gồm thuế phí</div>
              </div>
              <div className="h-[1.5px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2)_20%,rgba(255,255,255,0.2)_80%,transparent)] my-6"></div>
              <ul className="flex flex-col gap-2.5">
                <li className="text-[19px] text-white/[0.92] leading-[1.65] max-[680px]:text-[15px]">✅ Khóa học E-Learning nền tảng</li>
                <li className="text-[19px] text-white/[0.92] leading-[1.65] max-[680px]:text-[15px]">✅ Bài tập thực hành mỗi ngày</li>
                <li className="text-[19px] text-white/[0.92] leading-[1.65] max-[680px]:text-[15px]">✅ Hướng dẫn viết bài, quay chụp và dùng AI</li>
                <li className="text-[19px] text-white/[0.92] leading-[1.65] max-[680px]:text-[15px]">✅ Cơ chế trả bài trong 7 ngày</li>
                <li className="text-[19px] text-white/[0.92] leading-[1.65] max-[680px]:text-[15px]">✅ Mentor soi bài và góp ý</li>
                <li className="text-[19px] text-white/[0.92] leading-[1.65] max-[680px]:text-[15px]">✅ Khám kênh & tư vấn chiến lược sau khóa</li>
              </ul>
            </div>

            <div className="bg-white rounded-[14px] px-[22px] py-7 text-[#222]" id="register">
              <div className="flex justify-center items-center gap-1 mb-2">
                <div className="flex flex-col items-center"><span className="block bg-[#111] text-white text-[26px] font-black px-2.5 py-1.5 rounded-md min-w-[50px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px]">{timeParts.h}</span><small className="text-xs text-[#777] mt-[3px]">Giờ</small></div>
                <div className="text-2xl font-black text-[#333] mb-3.5 px-0.5">:</div>
                <div className="flex flex-col items-center"><span className="block bg-[#111] text-white text-[26px] font-black px-2.5 py-1.5 rounded-md min-w-[50px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px]">{timeParts.m}</span><small className="text-xs text-[#777] mt-[3px]">Phút</small></div>
                <div className="text-2xl font-black text-[#333] mb-3.5 px-0.5">:</div>
                <div className="flex flex-col items-center"><span className="block bg-[#111] text-white text-[26px] font-black px-2.5 py-1.5 rounded-md min-w-[50px] text-center leading-[1.2] max-[480px]:text-[22px] max-[480px]:min-w-[42px]">{timeParts.s}</span><small className="text-xs text-[#777] mt-[3px]">Giây</small></div>
              </div>
              <p className="text-center text-[17px] font-bold text-[#d0212a] mb-4 leading-[1.6] max-[680px]:text-[14px]">Ưu đãi đăng ký sớm chỉ áp dụng <br className="max-[680px]:hidden" />cho số lượng học viên giới hạn!</p>

              <div className="bg-[linear-gradient(135deg,#fffaf0_0%,#fff1f2_100%)] border-2 border-[#f43f5e] px-5 py-4 rounded-2xl mb-5 text-center shadow-[0_8px_24px_rgba(244,63,94,0.12)] relative [font-family:system-ui,-apple-system,sans-serif]">
                <div className="bg-[#f43f5e] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-[20px] inline-block mb-2 tracking-[0.5px]">
                  🔥 ƯU ĐÃI ĐẶC BIỆT - THANH TOÁN NGAY
                </div>
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <span className="text-[13px] text-[#78716c] line-through">Học phí gốc: 6.868.000đ</span>
                  <span className="bg-[#fee2e2] text-[#ef4444] text-[10px] font-bold px-2 py-0.5 rounded-md">TIẾT KIỆM 85%</span>
                </div>
                <div className="text-[30px] text-[#e11d48] font-black tracking-[-0.5px] leading-[1.1] mb-1">
                  999.000đ
                </div>
                <div className="text-[11px] text-[#4b5563] font-medium flex items-center justify-center gap-1">
                  🛡️ Đã bao gồm toàn bộ thuế phí
                </div>
              </div>

              <form className="[&>input]:w-full [&>input]:border-[1.5px] [&>input]:border-[#ddd] [&>input]:rounded-md [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-lg [&>input]:mb-2.5 [&>input]:outline-none [&>input]:block max-[680px]:[&>input]:text-[15px] [&>input]:focus:border-[#e25010]" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Họ và tên"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  name="ghiChu"
                  placeholder="Vấn đề bạn đang gặp phải (không bắt buộc)"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                />
                <button type="submit" disabled={isSubmitting} className={"block w-full " + btnBase + " border-[2.5px] border-white bg-[linear-gradient(135deg,#ffe066_0%,#f5c030_100%)] text-[#1a1a1a] shadow-[0_0_25px_rgba(245,166,35,0.8)]"}>
                  {isSubmitting ? "Đang đăng ký..." : "TÔI MUỐN THAM GIA"}
                </button>
              </form>

              <div className="mt-3">
                <p className="text-[15px] text-[#888] mb-1 leading-[1.6]">* Chú ý: Tư vấn viên sẽ liên lạc lại để xác nhận đăng ký chương trình cho bạn.</p>
                <p className="text-[15px] text-[#888] mb-1 leading-[1.6]">* Đây là chương trình online kèm cặp qua E-Learning, không phải học trực tiếp.</p>
                <p className="text-[15px] text-[#888] mb-1 leading-[1.6]">* Hãy kiểm tra lại thông tin họ tên và số điện thoại của bạn trước khi bấm đăng ký.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 15 — SAU 7 NGÀY, ĐI XA HƠN
      ══════════════════════════════════════════ */}
      <section className={sectionWhite} data-section="next-steps">
        <div className={container}>
          <div className="flex items-center justify-center gap-4 mb-3 text-center max-[480px]:flex-col max-[480px]:gap-[10px] max-[480px]:mb-2">
            <div>
              <h2 className={oppTitle}>SAU 7 NGÀY, BẠN CÓ THỂ ĐI <br /><span className="whitespace-nowrap">XA HƠN</span></h2>
            </div>
          </div>

          <p className={oppIntro}>7 ngày đầu tiên giúp bạn bắt đầu. Nhưng nếu muốn biến kênh thành tài sản bán hàng dài hạn, bạn cần đi&nbsp;tiếp.</p>

          <ul className={oppListNoicon}>
            <li className={oppListNoiconLi}>Cần lịch nội dung rõ ràng.</li>
            <li className={oppListNoiconLi}>Cần tối ưu chất lượng video.</li>
            <li className={oppListNoiconLi}>Cần xây thương hiệu cá nhân sâu.</li>
            <li className={oppListNoiconLi}>Cần xây phễu và tích lũy khách hàng bền vững.</li>
          </ul>

          <p className={oppClosing}>Vì vậy, sau chương trình 7 ngày, bạn sẽ có buổi khám kênh và tư vấn chiến lược 1:1 cùng đội ngũ&nbsp;Mentor.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 16 — CTA CUỐI TRANG
      ══════════════════════════════════════════ */}
      <section className={sectionDark + " text-center py-16"} data-section="final-cta">
        <div className={container}>
          <h2 className="text-[clamp(24px,3.2vw,34px)] font-extrabold text-white mb-5 leading-[1.4] relative max-[680px]:text-[20px]">Không cần hoàn hảo mới <span className="whitespace-nowrap">xây kênh</span><br />chỉ cần bắt đầu <span className="whitespace-nowrap">đúng cách</span></h2>
          <p className="max-w-[680px] mx-auto mb-8 text-[19px] leading-[1.85] text-white/[0.92] relative max-[680px]:text-[15px]">
            Trong 7 ngày tới, thay vì đứng ngoài nhìn người khác bán hàng, bạn sẽ tự tay xây kênh, đăng bài, quay video và tạo ra những <span className="whitespace-nowrap">đơn hàng đầu tiên.</span>
            <br />
            <strong>7 Ngày Xây Kênh Chuyển Đổi</strong> giúp bạn bắt đầu xây một kênh có khả năng bán&nbsp;hàng.
          </p>
          <div className="flex gap-4 justify-center flex-wrap relative max-[680px]:flex-col max-[680px]:items-center">
            <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className={btnGoldLg + " max-[680px]:w-full max-[680px]:max-w-[320px]"}>
              ĐĂNG KÝ THAM GIA NGAY
            </a>
            <a href="https://zalo.me/0989975498" target="_blank" rel="noopener noreferrer" className={"inline-block " + btnBase + " bg-transparent border-[2.5px] border-[#f5a623] text-[#f5a623] whitespace-nowrap max-[680px]:text-[15px] max-[680px]:px-[18px] max-[680px]:w-full max-[680px]:max-w-[320px]"}>
              Nhận tư vấn lộ trình phù hợp
            </a>
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
        className={`fixed bottom-0 left-0 w-full min-[768px]:hidden ${stickyVisible ? "flex" : "hidden"} justify-center items-center z-[1000] bg-white/55 backdrop-blur-[16px] border-t border-white/40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 max-[680px]:bottom-4 max-[680px]:w-fit max-[680px]:mx-auto`}
        id="stickyCta"
      >
        <a href="#register" onClick={(e) => handleAnchorClick(e, "register")} className="block bg-[linear-gradient(135deg,#f5c842_0%,#f5a623_100%)] text-[#1a1a1a] font-bold w-full py-3 rounded-md text-[17px] shadow-[0_4px_10px_rgba(245,166,35,0.4)] text-center uppercase max-[680px]:w-fit max-[680px]:px-11 max-[680px]:text-[15px] max-[680px]:whitespace-nowrap">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[8px] flex items-center justify-center p-5 z-[2000]" role="dialog" aria-modal="true" aria-labelledby="successModalTitle">
          <div className="bg-white rounded-2xl pt-7 px-6 pb-6 max-w-[380px] w-full max-h-[90vh] overflow-y-auto text-center relative shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-[480px]:pt-[22px] max-[480px]:px-4 max-[480px]:pb-[18px]">
            <button
              type="button"
              className="absolute top-[14px] right-[14px] w-8 h-8 border-0 bg-[#f2f2f2] text-[#555] rounded-full text-base cursor-pointer flex items-center justify-center"
              onClick={() => setSuccessModalOpen(false)}
              aria-label="Đóng"
            >
              ✕
            </button>
            <div className="mb-3 flex justify-center">
              <svg className="w-14 h-14 rounded-full block [stroke-width:3] stroke-white mx-auto shadow-[inset_0_0_0_30px_#1b8a3e]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="stroke-[#1b8a3e] fill-none [stroke-width:3]" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: 166, strokeDashoffset: 0 }} />
                <path className="fill-none stroke-[#1b8a3e] [stroke-width:3]" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ strokeDasharray: 48, strokeDashoffset: 0 }} />
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
