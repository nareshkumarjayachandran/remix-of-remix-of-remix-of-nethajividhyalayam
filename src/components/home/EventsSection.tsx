import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Calendar, ArrowRight } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Annual Sports Day 2024",
    date: "March 15, 2024",
    description: "A day filled with athletic competitions, team sports, and fun activities for all students.",
    image: "/photos/annual-sports-day/sports-day.jpg",
    category: "Sports",
  },
  {
    id: 2,
    title: "Science Exhibition",
    date: "February 28, 2024",
    description: "Students showcase their innovative science projects and experiments to judges and parents.",
    image: "/photos/science-exhibition/science-expo.jpg",
    category: "Academic",
  },
  {
    id: 3,
    title: "Cultural Festival",
    date: "January 20, 2024",
    description: "Celebrating the rich cultural heritage through dance, music, and art performances.",
    image: "/photos/cultural-festival/cultural-event.jpg",
    category: "Cultural",
  },
  {
    id: 4,
    title: "Parent-Teacher Meeting",
    date: "April 10, 2024",
    description: "An opportunity for parents to discuss their child's progress with teachers.",
    image: "/photos/parent-teacher/ptm.jpg",
    category: "Meeting",
  },
  {
    id: 5,
    title: "School Annual Picnic",
    date: "November 15, 2024",
    description: "A fun-filled outing for students and teachers to relax, play games, and enjoy nature together.",
    image: "/photos/school-picnic/picnic.jpg",
    category: "Recreation",
  },
  {
    id: 6,
    title: "Art & Craft Exhibition",
    date: "October 20, 2024",
    description: "Students display their creative artwork, paintings, handicrafts, and sculptures for parents and visitors.",
    image: "/photos/art-craft/art-exhibition.jpg",
    category: "Cultural",
  },
  {
    id: 7,
    title: "Teachers' Day Celebration",
    date: "September 5, 2024",
    description: "Students honour their beloved teachers with performances, speeches, and heartfelt gratitude.",
    image: "/photos/teachers-day/teachers-day.jpg",
    category: "Celebration",
  },
  {
    id: 8,
    title: "Yoga & Wellness Day",
    date: "June 21, 2024",
    description: "Promoting physical and mental well-being through yoga sessions, meditation, and wellness workshops.",
    image: "/photos/yoga-wellness/yoga-day.jpg",
    category: "Wellness",
  },
  {
    id: 9,
    title: "Career Guidance Workshop",
    date: "August 10, 2024",
    description: "Expert sessions to guide students on career paths, higher education options, and skill development.",
    image: "/photos/career-guidance/career-workshop.jpg",
    category: "Workshop",
  },
];

const EventsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % events.length);

  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <p className="text-accent font-medium mb-2 uppercase tracking-wider text-sm">What's Happening</p>
            <h2 className="section-title">Latest Events</h2>
          </div>
          <Link to="/events">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {events.map((event) => (
                <div key={event.id} className="w-full flex-shrink-0">
                  <div className="grid md:grid-cols-2 bg-background rounded-2xl overflow-hidden shadow-lg">
                    <div className="relative h-64 md:h-96 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4">{event.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">{event.description}</p>
                      <Link to="/events">
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground w-fit">
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Navigation Arrows */}
          <Button variant="outline" size="icon" onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hidden md:flex">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hidden md:flex">
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full md:hidden">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-accent w-6" : "bg-muted-foreground/30"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsAutoPlaying(!isAutoPlaying)} className="rounded-full">
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full md:hidden">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
