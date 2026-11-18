import { useState } from "react";
import { Calendar, MapPin, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

const events = [
  { title: "Annual Day Celebration", date: "March 15, 2025", time: "9:00 AM - 4:00 PM", location: "School Auditorium", description: "A grand celebration showcasing student talents through performances, awards, and cultural programs. Parents and guests are invited to witness the extraordinary skills of our students across dance, drama, music, and public speaking. Prize distribution ceremony honours outstanding achievements in academics, sports, and extracurricular activities.", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop", status: "Upcoming" },
  { title: "Science Exhibition", date: "February 20, 2025", time: "10:00 AM - 2:00 PM", location: "Science Lab & Hall", description: "Students present innovative science projects and experiments to judges and parents. From working models to creative experiments, young scientists demonstrate their understanding of scientific concepts through hands-on exhibits.", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop", status: "Upcoming" },
  { title: "Sports Day", date: "January 26, 2025", time: "8:00 AM - 5:00 PM", location: "School Ground", description: "Inter-house sports competitions featuring track events, team sports, and prize distribution. Students compete in athletics, relay races, cricket, football, and traditional games, fostering sportsmanship and teamwork.", image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop", status: "Completed" },
  { title: "School Annual Picnic", date: "November 15, 2024", time: "8:00 AM - 5:00 PM", location: "Outdoor Venue", description: "A fun-filled outing for students and teachers to relax, play games, and enjoy nature together. Activities include group games, treasure hunts, cultural performances, and a delicious outdoor lunch. A perfect day for bonding and creating lasting memories.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Art & Craft Exhibition", date: "October 20, 2024", time: "10:00 AM - 3:00 PM", location: "School Exhibition Hall", description: "Students display their creative artwork, paintings, handicrafts, clay models, and sculptures for parents and visitors. A showcase of imagination and artistic talent nurtured throughout the academic year.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Teachers' Day Celebration", date: "September 5, 2024", time: "9:00 AM - 12:00 PM", location: "School Auditorium", description: "Students honour their beloved teachers with performances, speeches, and heartfelt gratitude. Senior students take over as teachers for the day, conducting fun classes and activities.", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Career Guidance Workshop", date: "August 10, 2024", time: "10:00 AM - 1:00 PM", location: "Seminar Hall", description: "Expert sessions to guide students on career paths, higher education options, and skill development. Professionals from various fields share their experiences and insights to help students make informed decisions about their future.", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Yoga & Wellness Day", date: "June 21, 2024", time: "7:00 AM - 10:00 AM", location: "School Ground", description: "Promoting physical and mental well-being through yoga sessions, meditation, and wellness workshops. Students and staff participate in guided yoga, breathing exercises, and mindfulness activities on International Yoga Day.", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Parent-Teacher Meeting", date: "January 10, 2025", time: "10:00 AM - 1:00 PM", location: "Respective Classrooms", description: "Interactive session for parents and teachers to discuss student progress, address concerns, and plan for academic improvement. Individual progress reports are shared with parents.", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Christmas & Pongal Celebrations", date: "December 22, 2024", time: "9:00 AM - 12:00 PM", location: "School Campus", description: "Festive celebrations with cultural performances, rangoli, and traditional activities. Students participate in carol singing, traditional games, kolam competitions, and enjoy festive treats.", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=600&fit=crop", status: "Completed" },
  { title: "Independence Day Celebration", date: "August 15, 2024", time: "8:00 AM - 11:00 AM", location: "School Ground", description: "Flag hoisting ceremony followed by patriotic performances, speeches, and cultural programs celebrating India's freedom and unity.", image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop", status: "Completed" },
];

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const openEvent = (index: number) => setSelectedEvent(index);
  const closeEvent = () => setSelectedEvent(null);
  const prevEvent = () => setSelectedEvent((p) => p !== null ? (p - 1 + events.length) % events.length : 0);
  const nextEvent = () => setSelectedEvent((p) => p !== null ? (p + 1) % events.length : 0);

  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-lg text-primary-foreground/80">Celebrating achievements and creating memories</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="space-y-8">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row animate-fade-up cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openEvent(index)}
              >
                <div className="md:w-1/3 relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-56 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${event.status === "Upcoming" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    {event.status}
                  </span>
                </div>
                <div className="md:w-2/3 p-8">
                  <h3 className="font-serif text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">{event.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-accent" /> {event.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-accent" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-accent" /> {event.location}</span>
                  </div>
                  <p className="text-accent text-sm font-semibold mt-4">Click to read more →</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Detail Lightbox */}
      {selectedEvent !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={closeEvent}>
          <div
            className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={events[selectedEvent].image}
                alt={events[selectedEvent].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={closeEvent} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${events[selectedEvent].status === "Upcoming" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {events[selectedEvent].status}
                </span>
                <h2 className="text-white font-serif text-2xl md:text-3xl font-bold">{events[selectedEvent].title}</h2>
              </div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto max-h-[40vh]">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-accent" /> {events[selectedEvent].date}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-accent" /> {events[selectedEvent].time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-accent" /> {events[selectedEvent].location}</span>
              </div>
              <p className="text-foreground text-lg leading-relaxed">{events[selectedEvent].description}</p>
            </div>
            {/* Nav arrows */}
            <div className="flex justify-between p-4 border-t">
              <button onClick={prevEvent} className="flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors">
                <ChevronLeft className="h-5 w-5" /> Previous
              </button>
              <button onClick={nextEvent} className="flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors">
                Next <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Events;
