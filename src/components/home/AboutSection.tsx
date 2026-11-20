import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { getYearsOfExcellence } from "@/lib/schoolDates";

const AboutSection = () => {
  const stats = [
    { icon: Award, value: `${getYearsOfExcellence()}+`, label: "Years of Excellence" },
    { icon: Users, value: "5000+", label: "Happy Alumni" },
    { icon: BookOpen, value: "50+", label: "Expert Teachers" },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="/photos/academics/classroom-learning.jpg"
                    alt="Students in classroom"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="/photos/activities/school-activities.jpg"
                    alt="School activities"
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="pt-8 space-y-4">
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="/photos/facilities/library.jpg"
                    alt="Library"
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="/photos/sports/sports-activities.jpg"
                    alt="Sports activities"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground px-6 py-4 rounded-xl shadow-lg">
              <p className="text-3xl font-bold font-serif">Since</p>
              <p className="text-4xl font-bold">2002</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <p className="text-accent font-medium mb-2 uppercase tracking-wider text-sm">
                Welcome to Nethaji
              </p>
              <h2 className="section-title">
                Nurturing the <span className="text-accent">Future Leaders</span>
              </h2>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Nethaji Vidyalayam has been in the field of education for over two decades. 
              With a rich experience in moulding the young generation, we provide quality 
              education of international standard.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              From <strong>Pre KG</strong> to <strong>5th Grade</strong> the aim of the school 
              is to lay emphasis on experiential learning and grooming of young children thereby 
              making them responsible citizens and leaders with a difference.
            </p>


            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-primary font-serif">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link to="/about">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                Discover Our Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
