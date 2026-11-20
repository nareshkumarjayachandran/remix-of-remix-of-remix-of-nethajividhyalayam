import { Phone, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedEmailScroller from "@/components/ui/AnimatedEmailScroller";

const TopBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm hidden md:block relative">
      <div className="container-custom flex justify-between items-center lg:justify-end">
        {/* Contact Info */}
        <div className="flex items-center gap-6 pl-[110px] lg:absolute lg:left-[170px] lg:top-1/2 lg:-translate-y-1/2 lg:pl-0">
          <a 
            href="tel:+919841594945" 
            className="flex items-center gap-2 hover:text-accent transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>+91 9841594945 / 6380967675</span>
          </a>
          <div className="flex items-center gap-2 hover:text-accent transition-colors">
            <Mail className="h-4 w-4" />
            <AnimatedEmailScroller />
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-4 pr-10">
          <a 
            href="https://mail.google.com/mail/u/nethajividhyalayam@gmail.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors font-semibold"
          >
            Login
          </a>
          <span className="text-primary-foreground/50">|</span>
          <Link 
            to="/feedesk"
            className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded font-bold hover:bg-accent/90 transition-colors"
          >
            <span>FeeDesk</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
