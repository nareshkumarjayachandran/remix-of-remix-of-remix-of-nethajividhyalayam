import { useState, useEffect } from "react";

const emails = [
  { label: "nethajividhyalayam@gmail.com", href: "mailto:nethajividhyalayam@gmail.com" },
  { label: "info@nethajividhyalayam.org", href: "mailto:info@nethajividhyalayam.org" },
];

interface AnimatedEmailScrollerProps {
  className?: string;
}

const AnimatedEmailScroller = ({ className = "" }: AnimatedEmailScrollerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % emails.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <a
      href={emails[activeIndex].href}
      className={`inline-flex items-center ${className}`}
    >
      {emails[activeIndex].label}
    </a>
  );
};

export default AnimatedEmailScroller;
