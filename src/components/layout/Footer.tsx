import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Send, Clock, ExternalLink } from "lucide-react";
import logo from "@/assets/nethaji_logo2_circle.webp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AnimatedEmailScroller from "@/components/ui/AnimatedEmailScroller";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About Us", path: "/about" },
    { label: "Admissions", path: "/admissions" },
    { label: "Gallery", path: "/gallery" },
    { label: "Career", path: "/career" },
    { label: "Contact Us", path: "/contact" },
    { label: "Vidhyalayam Worksheet Maker", path: "/worksheet-maker" },
    { label: "Spoken English Practice", path: "/spoken-english" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/nethajividhyalayam", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/nethajividhyalayam", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/nethajividhya", label: "X" },
    { icon: Youtube, href: "https://www.youtube.com/@nethajividhyalayam", label: "YouTube" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-custom py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                alt="Nethaji Vidhyalayam Logo"
                className="w-[80px] h-[80px] object-contain brightness-110 contrast-105 animate-logo-pulse-footer"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
                src={logo}
              />
              <div>
                <h3 className="font-serif font-bold text-xl">Nethaji Vidhyalayam</h3>
                <p className="text-xs text-primary-foreground/70">Nurturing Tomorrow's Leaders</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Nethaji Vidhyalayam is committed to providing quality education that nurtures young minds and prepares
              them for a bright future. Established on 8th June 2002, we have been a beacon of academic excellence.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-primary-foreground/80 leading-snug block">
                    5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai&nbsp;-&nbsp;600129
                  </span>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam,+S.Kolathur,+Kovilambakkam,+Chennai+600129"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-xs inline-flex items-center gap-1 mt-1"
                  >
                    Get Directions <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <div className="text-sm text-primary-foreground/80">
                  <a href="tel:+919841594945" className="hover:text-accent transition-colors">
                    9841594945
                  </a>
                  {" / "}
                  <a href="tel:+916380967675" className="hover:text-accent transition-colors">
                    +91 6380967675
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="min-w-0 overflow-hidden">
                  <AnimatedEmailScroller className="text-sm text-primary-foreground/80 hover:text-accent transition-colors" />
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm text-primary-foreground/80">Mon - Sat: 8:50 AM - 3:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Subscribe to our newsletter for updates on events, admissions, and more.
            </p>
            <p className="text-xs text-primary-foreground/60 mb-2 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <AnimatedEmailScroller className="hover:text-accent transition-colors underline" />
            </p>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput?.value) {
                  const subject = encodeURIComponent("Newsletter Subscription");
                  const body = encodeURIComponent(
                    `Please subscribe me to the newsletter.\n\nMy email: ${emailInput.value}`,
                  );
                  window.open(
                    `https://mail.google.com/mail/?view=cm&to=nethajividhyalayam@gmail.com&su=${subject}&body=${body}`,
                    "_blank",
                  );
                  emailInput.value = "";
                }
              }}
            >
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 pr-12"
                />

                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent/90 h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            {/* FeeDesk Link */}
            <div className="mt-6 p-4 bg-accent/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Login FeeDesk For Office Use </p>
              <Link to="/feedesk" className="inline-flex items-center gap-2 text-accent hover:underline text-sm">
                Visit FeeDesk Portal →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/70 text-center md:text-left">
            © {currentYear} Nethaji Vidhyalayam. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/70 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/70 hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
