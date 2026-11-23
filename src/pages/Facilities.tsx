import { Book, Dumbbell, Bus, Shield, Wifi, Users, Monitor, Beaker, Music, Utensils, Camera, Heart, Eye, BadgeCheck, UserCheck } from "lucide-react";
import DuotoneIcon, { type DuotoneTone } from "@/components/common/DuotoneIcon";

const facilities = [
  { icon: Book, title: "Library", tone: "teal" as DuotoneTone, subtitle: "Where Stories Come Alive", description: "A calm and cozy reading corner with 500+ books, magazines and digital resources — where children discover stories, grow imagination, and fall in love with reading.", image: "/photos/facilities/library-overview.jpg", highlights: ["500+ books", "Reading programs", "Quiet study zones"] },
  { icon: Dumbbell, title: "Sports Complex", tone: "emerald" as DuotoneTone, subtitle: "Play, Grow, Shine", description: "A lively sports ground where children stay active and healthy through regular games, guided with care by trained coaches.", image: "/photos/facilities/sports-complex-overview.jpg", highlights: ["Annual sports meet", "Art and craft activities"] },
  { icon: Bus, title: "Transport", tone: "sky" as DuotoneTone, subtitle: "Safe Journeys, Happy Children", description: "Safe, reliable and supervised transport for field trips and outings — so every journey is comfortable and worry-free.", image: "/photos/facilities/school-transport.jpg", highlights: ["GPS tracking", "Trained staff", "Attender present", "5–10 km radius"] },
  { icon: Monitor, title: "Smart Classrooms", tone: "violet" as DuotoneTone, subtitle: "Where Lessons Come Alive", description: "Modern classrooms with interactive boards, projectors and audio-visual tools — making every lesson clear, colourful and joyful.", image: "/photos/facilities/smart-classrooms.jpg", highlights: ["Interactive boards", "Projectors", "Audio-visual aids"] },
  { icon: Beaker, title: "Science Lab", tone: "cyan" as DuotoneTone, description: "Well-equipped labs for hands-on experiments and scientific exploration.", image: "/photos/facilities/science-lab.jpg", highlights: ["Practical experiments", "Modern equipment"] },
  { icon: Monitor, title: "Computer Lab", tone: "indigo" as DuotoneTone, subtitle: "Explore, Learn, Create", description: "A bright, modern lab with new computers and software — where children learn, explore and create with confidence.", image: "/photos/facilities/computer-lab.jpg", highlights: ["Latest hardware", "Digital literacy"] },
  { icon: Music, title: "Music & Dance Room", tone: "rose" as DuotoneTone, subtitle: "Where Rhythm Meets Joy", description: "A cheerful space for music, dance and cultural practice — where children sing, move, perform and shine with confidence.", image: "/photos/facilities/music-and-dance-room.jpg", highlights: ["Music training", "Dance practice"] },
  { icon: Utensils, title: "Canteen & Cafeteria", tone: "orange" as DuotoneTone, description: "Hygienic canteen serving nutritious and delicious meals for students and staff.", image: "/photos/facilities/canteen-and-cafeteria.jpg", highlights: ["Hygienic food", "Nutritious meals"] },
  { icon: Heart, title: "Medical Room", tone: "pink" as DuotoneTone, description: "First-aid facility with trained staff to handle medical emergencies.", image: "/photos/facilities/medical-room.jpg", highlights: ["First-aid", "Trained staff"] },
];

const safetyFeatures = [
  { icon: Camera, title: "24/7 CCTV", tone: "indigo" as DuotoneTone, desc: "Complete surveillance across campus" },
  { icon: BadgeCheck, title: "Visitor ID Badges", tone: "emerald" as DuotoneTone, desc: "Controlled campus access for all visitors" },
  { icon: UserCheck, title: "Staff Verification", tone: "sky" as DuotoneTone, desc: "Thorough background checks for all staff" },
  { icon: Shield, title: "Emergency Protocols", tone: "red" as DuotoneTone, desc: "Regular drills and safety procedures" },
];

const Facilities = () => {
  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Our Facilities</h1>
          <p className="text-lg text-primary-foreground/80">World-class infrastructure for holistic development</p>
        </div>
      </section>

      {/* Main Facilities */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Infrastructure</p>
            <h2 className="section-title">Where Learning Meets Excellence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              At Nethaji Vidyalayam, we believe that a conducive learning environment is essential 
              for academic and personal growth. Safety, hygiene, and accessibility are our top priorities.
            </p>
          </div>

          <div className="space-y-16">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-8 items-center animate-fade-up ${
                  index % 2 === 1 ? "md:[direction:rtl]" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`relative overflow-hidden rounded-2xl shadow-lg ${index % 2 === 1 ? "md:[direction:ltr]" : ""}`}>
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className={index % 2 === 1 ? "md:[direction:ltr]" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <DuotoneIcon icon={facility.icon} tone={facility.tone} />
                    <h3 className="font-serif text-2xl font-bold text-primary">{facility.title}</h3>
                  </div>
                  {"subtitle" in facility && facility.subtitle && (
                    <p className="text-accent font-semibold italic mb-2">{facility.subtitle}</p>
                  )}
                  <p className="text-muted-foreground mb-4">{facility.description}</p>
                  {facility.highlights && (
                    <div className="flex flex-wrap gap-2">
                      {facility.highlights.map((h, i) => (
                        <span key={i} className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Security */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Your Child's Safety</p>
            <h2 className="section-title">Safety & Security Measures</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-4">
              Campus-wide protocols ensuring peace of mind for every parent.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {safetyFeatures.map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-lg text-center card-hover">
                <DuotoneIcon icon={item.icon} tone={item.tone} size="lg" className="mx-auto mb-4" />
                <h3 className="font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Facilities;
