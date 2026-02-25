import { useState, useEffect, useRef } from "react";

const emails = [
  { label: "nethajividhyalayam@gmail.com", href: "mailto:nethajividhyalayam@gmail.com" },
  { label: "info@nethajividhyalayam.org", href: "mailto:info@nethajividhyalayam.org" },
];

interface AnimatedEmailScrollerProps {
  className?: string;
}

const AnimatedEmailScroller = ({ className = "" }: AnimatedEmailScrollerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextIndex = (activeIndex + 1) % emails.length;
  const [phase, setPhase] = useState<"stable" | "rolling">("stable");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase("rolling");
      timerRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % emails.length);
        setPhase("stable");
      }, 600);
    }, 30000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <a
      href={emails[phase === "rolling" ? nextIndex : activeIndex].href}
      className={`inline-flex items-center overflow-hidden ${className}`}
      style={{ height: "1.5em", position: "relative" }}
    >
      {/* Current email - exits upward */}
      <span
        className="inline-block absolute left-0 will-change-transform"
        style={{
          transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
          transform: phase === "rolling"
            ? "translateY(-100%)"
            : "translateY(0)",
          opacity: phase === "rolling" ? 0 : 1,
        }}
      >
        {emails[activeIndex].label}
      </span>

      {/* Next email - enters from below */}
      <span
        className="inline-block absolute left-0 will-change-transform"
        style={{
          transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
          transform: phase === "rolling"
            ? "translateY(0)"
            : "translateY(100%)",
          opacity: phase === "rolling" ? 1 : 0,
        }}
      >
        {emails[nextIndex].label}
      </span>

      {/* Invisible spacer for width */}
      <span className="invisible whitespace-nowrap">nethajividhyalayam@gmail.com</span>
    </a>
  );
};

export default AnimatedEmailScroller;
