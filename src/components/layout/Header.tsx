import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/nethaji_logo2_circle.webp";

const navItems = [
  { label: "Home", path: "/" },
  {
    label: "About Us",
    path: "/about",
    children: [
      { label: "Our Story", path: "/about#story" },
      { label: "Vision & Mission", path: "/about#vision" },
      { label: "Leadership Team", path: "/about#team" },
      { label: "Principal's Message", path: "/about#message" },
      { label: "Chairman's Message", path: "/about#correspondent" },
    ],
  },
  {
    label: "Admissions",
    path: "/admissions",
    children: [
      { label: "Admission Process", path: "/admissions" },
      { label: "Fee Payment", path: "/admissions#fees" },
      { label: "Apply Now", path: "/admissions#apply" },
    ],
  },
  {
    label: "Academics",
    path: "/academics",
    children: [
      { label: "Curriculum", path: "/academics/curriculum" },
      { label: "Nursery (Pre-KG – UKG)", path: "/academics/nursery" },
      { label: "Primary (Grade 1–5)", path: "/academics/primary" },
    ],
  },
  {
    label: "Facilities",
    path: "/facilities",
    children: [
      { label: "Our Facilities", path: "/facilities" },
      { label: "Worksheet Maker", path: "/worksheet-maker" },
      { label: "Spoken English", path: "/spoken-english" },
    ],
  },
  {
    label: "Gallery",
    path: "/gallery",
    children: [
      { label: "Photo Gallery", path: "/gallery" },
      { label: "Video Gallery", path: "/video-gallery" },
      { label: "Events", path: "/events" },
      { label: "School Calendar", path: "/calendar" },
    ],
  },
  { label: "Career", path: "/career" },
  { label: "Contact Us", path: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("#")[0]);
  };

  return (
    <header
      className={cn(
        "w-full transition-all duration-500",
        isScrolled ? "bg-primary/95 backdrop-blur-md shadow-lg" : "bg-primary",
      )}
      style={{ overflow: "visible" }}
    >
      <div className="w-full px-4 lg:px-6" style={{ overflow: "visible" }}>
        <div className="flex items-center justify-between h-[60px] flex-nowrap" style={{ overflow: "visible" }}>
          {/* Logo */}
          {/* Logo - moves independently */}
          <Link to="/" className="shrink-0" style={{ overflow: "visible" }}>
            <div
              className="w-[160px] h-[110px] shrink-0 flex items-start justify-center pt-1"
              style={{ overflow: "visible", position: "relative", zIndex: 10 }}
            >
              <img
                alt="Nethaji Vidhyalayam Logo"
                className="w-[130px] h-[130px] object-contain drop-shadow-lg brightness-110 contrast-105 animate-logo-pulse-header"
                style={{ imageRendering: "-webkit-optimize-contrast", position: "relative" }}
                src={logo}
              />
            </div>
          </Link>
          {/* School Name - stays fixed, does not move with logo */}
          <div className="hidden sm:block text-center shrink-0">
            <Link to="/" className="no-underline">
              <h1 className="font-serif font-extrabold text-[23px] text-primary-foreground leading-tight tracking-tight">
                NETHAJI VIDHYALAYAM
              </h1>
              <p className="font-sans font-bold text-accent text-[11px] tracking-widest">
                Nurturing Tomorrow's Leaders
              </p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-2 min-w-0 overflow-visible">
            <div className="flex items-center gap-0.5 flex-nowrap">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "nav-link-animated flex items-center gap-0.5 px-2.5 py-2 text-sm font-bold rounded-md transition-all duration-300 whitespace-nowrap",
                      isActive(item.path)
                        ? "text-accent bg-primary-foreground/10"
                        : "text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/10 hover:scale-105",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", openDropdown === item.label && "rotate-180")}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && (
                    <div
                      className={cn(
                        "absolute top-full left-0 w-56 bg-background rounded-lg shadow-xl border py-2 transition-all duration-200",
                        openDropdown === item.label
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2",
                      )}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.path}
                          className="block px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary hover:text-accent transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {/* Phone icon only on mobile/tablet */}
            <a
              href="tel:+919841594945"
              className="flex md:hidden items-center justify-center w-10 h-10 bg-accent text-accent-foreground rounded-lg shadow-md hover:bg-accent/90 hover:shadow-lg hover:scale-105 transition-all duration-200 border border-accent-foreground/10"
              aria-label="Call Us"
            >
              <Phone className="h-4 w-4" />
            </a>
            {/* Full Call Us button on desktop */}
            <a
              href="tel:+919841594945"
              className="hidden md:flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md font-bold hover:bg-accent/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call Us</span>
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-accent bg-accent/15 rounded-md hover:bg-accent/25 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 bg-background border-t shadow-lg transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-screen" : "max-h-0",
        )}
      >
        <nav className="container-custom py-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 text-sm font-bold rounded-md transition-colors",
                      isActive(item.path) ? "text-accent bg-secondary" : "text-foreground hover:bg-secondary",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", openDropdown === item.label && "rotate-180")}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      openDropdown === item.label ? "max-h-64" : "max-h-0",
                    )}
                  >
                    <div className="pl-4 py-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.path}
                          className="block px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-accent transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    "block px-4 py-3 text-sm font-bold rounded-md transition-colors",
                    isActive(item.path) ? "text-accent bg-secondary" : "text-foreground hover:bg-secondary",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile CTA */}
          <div className="pt-4 border-t">
            <a
              href="tel:+919841594945"
              className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground px-4 py-3 rounded-md font-bold hover:bg-accent/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call Us Now</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
