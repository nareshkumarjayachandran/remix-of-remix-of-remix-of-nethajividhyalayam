import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { getYearsOfExcellence } from "@/lib/schoolDates";

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/photos/events/cta-background.jpg"
          alt="Students"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Join Our <span className="text-accent">Family</span>?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Give your child the gift of quality education. Join Nethaji Vidhyalayam 
            and be a part of our journey towards excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/admissions">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8"
              >
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+919841594945">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-accent text-white bg-accent/20 hover:bg-accent hover:text-accent-foreground font-medium px-8"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              <span>{getYearsOfExcellence()}+ Years of Excellence</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              <span>2000+ Happy Alumni</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              <span>100% Child Safety</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
