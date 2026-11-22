import DuotoneIcon, { toneAt } from "@/components/common/DuotoneIcon";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Dumbbell, Bus, Shield, Wifi, Users } from "lucide-react";

const facilities = [
  {
    icon: Book,
    title: "Library",
    description: "Well-stocked library with thousands of books and digital resources",
    image: "/photos/facilities/library-books.jpg",
  },
  {
    icon: Dumbbell,
    title: "Sports Complex",
    description: "Modern sports facilities for various indoor and outdoor activities",
    image: "/photos/facilities/sports-complex.jpg",
  },
  {
    icon: Bus,
    title: "Transport",
    description: "Safe and comfortable transportation covering major routes",
    image: "/photos/facilities/transport.jpg",
  },
];

const features = [
  { icon: Shield, label: "100% Child Safety" },
  { icon: Wifi, label: "Smart Classrooms" },
  { icon: Users, label: "Expert Faculty" },
];

const FacilitiesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-medium mb-2 uppercase tracking-wider text-sm">
            Our Infrastructure
          </p>
          <h2 className="section-title">World-Class Facilities</h2>
          <p className="section-subtitle">
            State-of-the-art infrastructure designed to enhance learning experiences
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={feature.label} className="flex items-center justify-center gap-3">
                <DuotoneIcon icon={feature.icon} tone={toneAt(i)} size="sm" />
                <span className="font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Facility Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {facilities.map((facility, i) => (
            <div
              key={facility.title}
              className="group bg-card rounded-2xl overflow-hidden shadow-lg card-hover"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={facility.image}
                  alt={facility.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <DuotoneIcon icon={facility.icon} tone={toneAt(i)} size="sm" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-primary mb-2">
                  {facility.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {facility.description}
                </p>
                <Link
                  to="/facilities"
                  className="inline-flex items-center text-accent font-medium hover:gap-2 transition-all"
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/facilities">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Explore All Facilities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
