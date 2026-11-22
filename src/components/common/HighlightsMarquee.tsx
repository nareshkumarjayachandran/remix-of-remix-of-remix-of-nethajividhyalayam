import { Award, GraduationCap, ShieldCheck, Monitor, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getYearsOfExcellence } from "@/lib/schoolDates";

const HighlightsMarquee = () => (
  <section className="bg-background border-t overflow-hidden">
    <div className="py-3 flex animate-marquee w-max">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex flex-nowrap items-center gap-x-8 pr-8" aria-hidden={copy === 1}>
          {[
            { to: "/about/story", Icon: Award, label: `${getYearsOfExcellence()}+ Years of Excellence`, color: "bg-orange-100 text-orange-600" },
            { to: "/about/story", Icon: GraduationCap, label: "5000+ Happy Alumni", color: "bg-sky-100 text-sky-600" },
            { to: "/facilities", Icon: ShieldCheck, label: "100% Child Safety", color: "bg-emerald-100 text-emerald-600" },
            { to: "/facilities", Icon: Monitor, label: "Smart Classrooms", color: "bg-violet-100 text-violet-600" },
            { to: "/about/leadership", Icon: UserCheck, label: "Expert Faculty", color: "bg-rose-100 text-rose-600" },
          ].map(({ to, Icon, label, color }) => (
            <Link key={label} to={to} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors whitespace-nowrap shrink-0">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></span>
              {label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  </section>
);

export default HighlightsMarquee;
