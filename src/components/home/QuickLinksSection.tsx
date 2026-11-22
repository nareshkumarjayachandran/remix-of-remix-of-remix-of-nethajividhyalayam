import DuotoneIcon, { toneAt } from "@/components/common/DuotoneIcon";
import { Link } from "react-router-dom";
import { GraduationCap, CreditCard, Calendar, Phone } from "lucide-react";

const quickLinks = [
  {
    icon: GraduationCap,
    title: "Admissions",
    description: "Join our school family",
    path: "/admissions",
    color: "bg-accent",
  },
  {
    icon: CreditCard,
    title: "Pay Fees",
    description: "Online fee payment",
    path: "/admissions#fees",
    color: "bg-school-green",
  },
  {
    icon: Calendar,
    title: "School Calendar",
    description: "View academic calendar",
    path: "/calendar",
    color: "bg-school-gold",
  },
  {
    icon: Phone,
    title: "Contact Us",
    description: "Get in touch with us",
    path: "/contact",
    color: "bg-primary",
  },
];

const QuickLinksSection = () => {
  return (
    <section className="relative z-20 -mt-20 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((item, index) => {
            const content = (
              <div 
                className={`${item.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <DuotoneIcon icon={item.icon} tone={toneAt(index)} size="sm" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.description}</p>
                  </div>
                </div>
              </div>
            );

            if ('external' in item && item.external) {
              return (
                <a
                  key={item.title}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="animate-fade-up"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.title}
                to={item.path}
                className="animate-fade-up"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinksSection;
