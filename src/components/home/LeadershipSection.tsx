import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    name: "Mr. J.J. NARESHKUMAR",
    role: "Chairman",
    image: "/photos/leadership/chairman.jpg",
    message:
      "Every child is a lamp waiting to be lit. Our duty is not just to teach, but to ignite.",
  },
  {
    name: "Mrs. P.S. JANANI",
    role: "Principal",
    image: "/photos/leadership/principal.jpg",
    message:
      "At Nethaji, we don't just teach; we inspire. Every child who enters our school is unique. Our promise is to see that uniqueness, nurture it, and let it shine.",
  },
  {
    name: "Mrs. M. DEVIKALA",
    role: "Vice Principal",
    image: "/photos/leadership/vice-principal.jpg",
    message:
      "We are committed to ensuring smooth administration and upholding the values of our institution with dedication and integrity.",
  },
];

const LeadershipSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % teamMembers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teamMembers.length);
  };

  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-medium mb-2 uppercase tracking-wider text-sm">Meet Our Leaders</p>
          <h2 className="section-title">Leadership & Guidance</h2>
          <p className="section-subtitle">Dedicated professionals guiding our institution towards excellence</p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl bg-background shadow-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {teamMembers.map((member, index) => (
                <div key={member.name} className="w-full flex-shrink-0">
                  <div className="grid md:grid-cols-2">
                    {/* Image */}
                    <div className="relative h-64 md:h-96 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover brightness-110 contrast-[1.05] saturate-[1.15]"
                      />
                      {/* Soft light sheen instead of a dark vignette */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/25 pointer-events-none" />
                      {/* Warm glow rim */}
                      <div className="absolute inset-0 ring-1 ring-inset ring-accent/30 pointer-events-none" />
                      <div className="absolute inset-0 shadow-[inset_0_0_45px_rgba(255,107,53,0.18)] pointer-events-none" />
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <p className="text-accent font-medium uppercase tracking-wider text-sm mb-2">{member.role}</p>
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary">{member.name}</h3>
                      </div>

                      <blockquote className="text-muted-foreground text-lg leading-relaxed italic border-l-4 border-accent pl-4">
                        "{member.message}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-accent" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="rounded-full"
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
