import { ReactNode } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import SocialSidebar from "./SocialSidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar />
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
