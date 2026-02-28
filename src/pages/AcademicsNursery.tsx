import useScrollToHash from "@/hooks/useScrollToHash";
import { Sprout, Music, Users, BookOpen, Clock, CheckCircle } from "lucide-react";

const AcademicsNursery = () => {
  useScrollToHash();

  const schedule = [
    { time: "8:50 – 9:10", activity: "Morning Assembly" },
    { time: "9:10 – 10:00", activity: "Circle Time & Recap" },
    { time: "10:00 – 10:30", activity: "Snack Time & Free Play" },
    { time: "10:30 – 11:30", activity: "Activity-Based Learning (Phonics, Numbers)" },
    { time: "11:30 – 12:00", activity: "Writing Practice" },
    { time: "12:00 – 1:00", activity: "Lunch Break" },
    { time: "1:00 – 2:00", activity: "Story Time" },
    { time: "2:00 – 3:00", activity: "Outdoor Play & Physical Activities" },
    { time: "3:00 – 3:30", activity: "Recap of the Day" },
  ];

  const features = [
    {
      icon: Sprout,
      title: "Play-Based Learning",
      desc: "Learning through play helps children develop social, cognitive, and emotional skills.",
    },
    {
      icon: Music,
      title: "Creative Expression",
      desc: "Art, craft, and music activities to encourage creativity and self-expression.",
    },
    {
      icon: Users,
      title: "Small Class Sizes",
      desc: "Maximum 20 children per class with 2 dedicated teachers for personalized attention.",
    },
    {
      icon: BookOpen,
      title: "Montessori Approach",
      desc: "Child-centered learning environment that encourages independence and exploration.",
    },
  ];

  const learningAreas = [
    "Language & Literacy",
    "Numeracy & Math Readiness",
    "Moral Values & Good Habits",
    "Music, Dance & Rhymes",
    "Celebration of Festivals & Special Days",
  ];

  return (
    <>
      {/* Banner */}
      <section className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 60%, #3b2d8a 100%)" }}>
        <div className="absolute inset-0 opacity-10 bg-[url('/photos/academics/classroom-learning.jpg')] bg-cover bg-center" />
        <div className="container-custom text-center relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
            Nursery (Pre-KG – UKG)
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Where Little Learners Begin Their Journey
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Early Education</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
                A Joyful Beginning to Lifelong Learning
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We create a nurturing environment where children feel safe, loved, and confident—allowing
                learning to happen naturally through meaningful experiences.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Shishuvatika</strong> is the foundational stage of learning where a child's
                educational journey begins with care, play, and joyful exploration. At our school,
                Shishuvatika is thoughtfully designed to support the holistic development of every
                child, guided by the timeless Panchakosha principles.
              </p>
              <div className="bg-secondary rounded-xl p-5 border-l-4 border-accent mt-4">
                <h4 className="font-serif font-bold text-primary mb-2">Meaning of Shishuvatika</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• <strong>Shishu</strong> → Child / Infant</li>
                  <li>• <strong>Vatika</strong> → Garden / Nursery / Place of growth</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Shishuvatika means "Children's Garden"—a space where young minds blossom through care, play, values, and joyful learning.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/photos/academics/nursery-classroom.jpg"
                alt="Nursery Classroom"
                className="rounded-2xl shadow-xl w-full object-cover"
                style={{ maxHeight: 400 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Our Nursery Special */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Approach</p>
            <h2 className="section-title">What Makes Our Nursery Special</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A holistic approach to early childhood education.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif font-bold text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Typical Day */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Daily Routine</p>
            <h2 className="section-title">A Typical Day</h2>
            <p className="text-muted-foreground">Structured yet flexible schedule designed for young learners.</p>
          </div>
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
            {schedule.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i % 2 === 0 ? "bg-card" : "bg-secondary/50"}`}>
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-bold text-accent">{item.time}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Areas */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Curriculum</p>
            <h2 className="section-title">Learning Areas Covered</h2>
            <p className="text-muted-foreground">Comprehensive development across all domains.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {learningAreas.map((area, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                <span className="font-semibold text-foreground text-sm">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AcademicsNursery;
