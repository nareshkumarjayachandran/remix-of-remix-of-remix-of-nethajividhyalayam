import { ReactNode, useState, useEffect } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import SocialSidebar from "./SocialSidebar";
import ConnectivityBanner from "@/components/ui/ConnectivityBanner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [autoHide, setAutoHide] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHide = autoHide && isScrolled;

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <ConnectivityBanner />
      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className={`relative transition-all duration-300 overflow-hidden ${shouldHide ? "max-h-0" : "max-h-[40px]"}`}
        >
          <TopBar />
          <button
            onClick={() => setAutoHide(!autoHide)}
            title={autoHide ? "Auto-hide ON" : "Auto-hide OFF"}
            className="absolute top-1/2 -translate-y-1/2 right-2 z-[60] flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider transition-all duration-200 shadow-sm border border-white/20 backdrop-blur-sm cursor-pointer"
            style={{
              background: autoHide
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
            }}
          >
            <span
              className="block h-2 w-2 rounded-full bg-white shadow transition-transform duration-200"
            />
            <span className="text-white/90 leading-none pr-0.5">
              {autoHide ? "on" : "off"}
            </span>
          </button>
        </div>
        <Header />
      </div>
      <main className="flex-1 mt-[60px] md:mt-[100px]">{children}</main>
      <Footer />
      <ChatWidget />
      <SocialSidebar />
    </div>
  );
};

export default Layout;
