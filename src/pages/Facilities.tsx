import { Book, Dumbbell, Bus, Shield, Wifi, Users, Monitor, Beaker, Music, Utensils, Camera, Heart, Eye, BadgeCheck, UserCheck } from "lucide-react";

const facilities = [
  { icon: Book, title: "Library", description: "A vast collection of 500+ books, digital resources, magazines, and a quiet reading zone for students.", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop", highlights: ["500+ books", "Reading programs", "Quiet study zones"] },
  { icon: Dumbbell, title: "Sports Complex", description: "Regular sports activities are conducted in the complex. The complex helps students stay active and healthy. Trained coaches guide students during practice sessions.", image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=400&fit=crop", highlights: ["Annual sports meet", "Art and craft activities"] },
  { icon: Bus, title: "Transport", description: "Safe and reliable transport facility ensuring student safety. Provides convenient and supervised travel for students.", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop", highlights: ["GPS tracking", "Trained staff", "Attender present", "5–10 km radius"] },
  { icon: Monitor, title: "Smart Classrooms", description: "Digitally equipped classrooms with interactive boards, projectors, and audio-visual aids for engaging learning.", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop", highlights: ["Interactive boards", "Projectors", "Audio-visual aids"] },
  { icon: Beaker, title: "Science Lab", description: "Well-equipped labs for hands-on experiments and scientific exploration.", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop", highlights: ["Practical experiments", "Modern equipment"] },
  { icon: Monitor, title: "Computer Lab", description: "Modern computer lab with latest hardware and software for developing digital skills.", image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&h=400&fit=crop", highlights: ["Latest hardware", "Digital literacy"] },
  { icon: Music, title: "Music & Dance Room", description: "Dedicated space for music classes, dance practice, and cultural activity rehearsals.", image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&h=400&fit=crop", highlights: ["Music training", "Dance practice"] },
  { icon: Utensils, title: "Canteen & Cafeteria", description: "Hygienic canteen serving nutritious and delicious meals for students and staff.", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop", highlights: ["Hygienic food", "Nutritious meals"] },
  { icon: Heart, title: "Medical Room", description: "First-aid facility with trained staff to handle medical emergencies.", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop", highlights: ["First-aid", "Trained staff"] },
];

const safetyFeatures = [
  { icon: Camera, title: "24/7 CCTV", desc: "Complete surveillance across campus" },
  { icon: BadgeCheck, title: "Visitor ID Badges", desc: "Controlled campus access for all visitors" },
  { icon: UserCheck, title: "Staff Verification", desc: "Thorough background checks for all staff" },
  { icon: Shield, title: "Emergency Protocols", desc: "Regular drills and safety procedures" },
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

      {/* Stats */}
      <section className="bg-accent text-accent-foreground py-10">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10+", label: "Transports" },
            { value: "100%", label: "Child Safety Coverage" },
            { value: "12+", label: "Qualified Teaching Staff" },
            { value: "100%", label: "Hygiene & Cleanliness" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          ))}
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
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <facility.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-primary">{facility.title}</h3>
                  </div>
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
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
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
