import { ReactNode, useState, useEffect } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import SocialSidebar from "./SocialSidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className={`transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0" : "max-h-[40px]"}`}
        >
          <TopBar />
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
