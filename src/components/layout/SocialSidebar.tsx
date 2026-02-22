import { Facebook, Youtube, Instagram } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/nethajividhyalayam2002",
    label: "Facebook",
    bg: "bg-[#1877F2]",
    activeShadow: "shadow-[0_0_20px_rgba(24,119,242,0.5)]",
    color: "#1877F2",
  },
  {
    icon: XIcon,
    href: "https://x.com/nethajividhya",
    label: "X",
    bg: "bg-[#000000]",
    activeShadow: "shadow-[0_0_20px_rgba(0,0,0,0.5)]",
    color: "#000",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@nethajividhyalayam",
    label: "YouTube",
    bg: "bg-[#FF0000]",
    activeShadow: "shadow-[0_0_20px_rgba(255,0,0,0.4)]",
    color: "#FF0000",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/nethajividhyalayam2002",
    label: "Instagram",
    bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]",
    activeShadow: "shadow-[0_0_20px_rgba(225,48,108,0.4)]",
    color: "#e6683c",
  },
];

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: 0=Jan, 5=Jun
  // Academic year runs June to May. Before June, show previous year's session.
  const startYear = month < 5 ? year - 1 : year;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const SocialSidebar = () => {
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [dateHover, setDateHover] = useState(false);
  const socialRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-collapse date/time after 3s (only if not hovered by cursor)
  useEffect(() => {
    if (!expanded) return;
    if (dateHover) return;
    const t = setTimeout(() => setExpanded(false), 3000);
    return () => clearTimeout(t);
  }, [expanded, dateHover]);

  useEffect(() => {
    if (!activeSocial) return;
    const t = setTimeout(() => setActiveSocial(null), 2000);
    return () => clearTimeout(t);
  }, [activeSocial]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Right side proximity for social icons
    if (window.innerWidth - e.clientX < 120) {
      setMouseY(e.clientY);
    } else {
      setMouseY(null);
    }
    // Left side proximity for date/time widget (hover tracking only, no auto-expand)
    if (e.clientX < 120 && dateRef.current) {
      const rect = dateRef.current.getBoundingClientRect();
      const dist = Math.abs(e.clientY - (rect.top + rect.height / 2));
      setDateHover(dist < 100);
    } else {
      setDateHover(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const getIconStyle = (index: number) => {
    if (!socialRef.current || mouseY === null) return {};
    const rect = socialRef.current.getBoundingClientRect();
    const iconY = rect.top + index * 48 + 24;
    const dist = Math.abs(mouseY - iconY);
    const maxDist = 150;
    if (dist > maxDist) return {};
    const proximity = 1 - dist / maxDist;
    const translateX = -proximity * 14;
    const scale = 1 + proximity * 0.2;
    const rotate = Math.sin(Date.now() / 200 + index) * proximity * 6;
    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotate(${rotate}deg)`,
      transition: "transform 0.15s ease-out",
    };
  };

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (mouseY === null) return;
    const raf = requestAnimationFrame(function tick() {
      forceUpdate((n) => n + 1);
    });
    return () => cancelAnimationFrame(raf);
  }, [mouseY, forceUpdate]);

  const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <>
      {/* Floating Date/Time - Left Side */}
      <div ref={dateRef} className="fixed left-0 top-1/3 -translate-y-1/2 z-50 hidden md:flex flex-col">
        <div
          onClick={() => setExpanded(!expanded)}
          style={
            dateHover && !expanded
              ? {
                  transform: `translateX(6px) scale(1.08) rotate(${Math.sin(Date.now() / 200) * 3}deg)`,
                  transition: "transform 0.15s ease-out",
                }
              : undefined
          }
          className={`bg-primary/90 backdrop-blur-md border border-white/10 rounded-r-2xl px-3 py-4 text-white text-center shadow-2xl cursor-pointer transition-all duration-500 overflow-hidden ${expanded ? "w-44" : "w-14"} ${dateHover && !expanded ? "shadow-[0_0_25px_rgba(var(--primary),0.4)]" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-accent font-bold">{dayName}</span>
              <span className="text-lg font-bold font-serif leading-tight">{now.getDate()}</span>
              <span className="text-[9px] text-white/60 uppercase">
                {now.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
            <div
              className={`transition-opacity duration-500 whitespace-nowrap text-left ${expanded ? "opacity-100" : "opacity-0"}`}
            >
              <div className="text-lg font-bold font-serif tabular-nums">{timeStr}</div>
              <div className="text-[10px] text-white/60">{dateStr}</div>
              <div className="mt-1.5 text-[9px] bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5 text-accent font-semibold">
                {getAcademicYear()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Social - Right Side */}
      <div ref={socialRef} className="fixed right-0 top-1/3 -translate-y-1/2 z-50 flex flex-col gap-1.5">
        {socials.map(({ icon: Icon, href, label, bg, activeShadow }, index) => {
          const isActive = activeSocial === label;
          const dynamicStyle = getIconStyle(index);
          return (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              onClick={() => setActiveSocial(label)}
              style={!isActive ? dynamicStyle : undefined}
              className={`flex items-center ${bg} text-white transition-all duration-300 overflow-hidden rounded-l-xl ${isActive ? `w-36 scale-105 ${activeShadow}` : "w-11 shadow-lg"}`}
            >
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
                <Icon className={`h-5 w-5 ${mouseY !== null && !isActive ? "animate-pulse" : ""}`} />
              </div>
              <span
                className={`whitespace-nowrap text-sm font-semibold transition-opacity duration-300 pr-3 ${isActive ? "opacity-100" : "opacity-0"}`}
              >
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </>
  );
};

export default SocialSidebar;
