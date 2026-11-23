import DuotoneIcon, { toneAt } from "@/components/common/DuotoneIcon";
import useScrollToHash from "@/hooks/useScrollToHash";
import { BookOpen, Cpu, ClipboardList, FlaskConical, Globe, CheckCircle, Lightbulb, BarChart2 } from "lucide-react";

const AcademicsPrimary = () => {
  useScrollToHash();

  const subjects = [
    {
      icon: BookOpen,
      title: "Languages",
      items: [
        "English",
        "Tamil / Hindi (as second or third language)",
        "Focus on reading, writing, speaking, and comprehension",
      ],
    },
    {
      icon: BarChart2,
      title: "Mathematics",
      items: [
        "Numbers and operations",
        "Fractions, measurements, time, and money",
        "Logical thinking and problem-solving skills",
      ],
    },
    {
      icon: Globe,
      title: "Environmental Studies",
      subtitle: "(Classes 1–3)",
      items: [
        "Family, neighbourhood, and community",
        "Plants, animals, and environment",
        "Health, hygiene, and safety",
      ],
    },
    {
      icon: FlaskConical,
      title: "Science",
      subtitle: "(Classes 4–5)",
      items: [
        "Living and non-living things",
        "Plants, animals, and human body",
        "Matter, energy, and basic experiments",
      ],
    },
    {
      icon: Globe,
      title: "Social Studies",
      subtitle: "(Classes 4–5)",
      items: [
        "History, geography, and civics (basic concepts)",
        "Our country, culture, and values",
        "Responsible citizenship",
      ],
    },
  ];

  const teachingApproaches = [
    {
      icon: Lightbulb,
      title: "Experiential Learning",
      desc: "Hands-on activities, field trips, and real-world projects to make learning meaningful.",
    },
    {
      icon: Cpu,
      title: "Technology Integration",
      desc: "Smart classrooms with digital boards, educational apps, and computer literacy.",
    },
    {
      icon: ClipboardList,
      title: "Continuous Assessment",
      desc: "Regular formative assessments to track progress and provide timely feedback.",
    },
  ];

  const coActivities = [
    "Sports & Athletics",
    "Music & Dance",
    "Art & Craft",
    "Physical Education",
    "Library",
    "Health Education",
    "Yoga & Meditation",
  ];

  return (
    <>
      {/* Banner */}
      <section className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #1a3a7a 100%)" }}>
        <div className="absolute inset-0 opacity-10 bg-[url('/photos/academics/classroom-learning.jpg')] bg-cover bg-center" />
        <div className="container-custom text-center relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
            Primary School (Grade 1 – 5)
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Building Strong Academic Foundations
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <img
                src="/photos/academics/primary-classroom.jpg"
                alt="Primary Classroom"
                className="rounded-2xl shadow-xl w-full object-cover"
                style={{ maxHeight: 420 }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/photos/academics/classroom-learning.jpg"; }}
              />
              <div className="absolute -bottom-6 -right-4 bg-accent text-accent-foreground p-5 rounded-xl shadow-lg text-center">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs font-semibold">Pass Rate<br />5 Years Running</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Primary Education</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
                Academic Excellence with Character Building
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Upper Primary years (Grades 3–5) are a beautiful turning point in a child's learning
                journey. It is the time when children move from learning to read, to reading to learn,
                from simple answers to asking thoughtful questions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our curriculum is thoughtfully designed to strengthen reading, writing, mathematics, and
                independent thinking, while keeping curiosity alive and learning joyful. We follow a
                child-centred approach with experiential learning, meaningful projects, and teamwork.
                Our caring teachers guide each child with patience and encouragement, helping them grow
                with confidence, discipline, values, and a true love for learning.
              </p>
              <div className="flex gap-6 mt-6">
                <div className="bg-secondary rounded-xl p-4 text-center flex-1">
                  <p className="text-2xl font-bold text-accent">500+</p>
                  <p className="text-xs text-muted-foreground font-semibold">Books Read<br />Reading Program</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Subjects */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Syllabus</p>
            <h2 className="section-title">Core Subject Areas</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A balanced education that nurtures intellect, curiosity, and ethics across all disciplines.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((s, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <DuotoneIcon icon={s.icon} tone={toneAt(i)} size="sm" className="mb-4" />
                <h3 className="font-serif font-bold text-primary mb-1">{s.title}</h3>
                {s.subtitle && <p className="text-xs text-muted-foreground mb-2 italic">{s.subtitle}</p>}
                <ul className="space-y-1 mt-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-accent mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Approach */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Pedagogy</p>
            <h2 className="section-title">Our Teaching Approach</h2>
            <p className="text-muted-foreground">Modern pedagogy for 21st-century learners.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {teachingApproaches.map((t, i) => (
              <div key={i} className="flex gap-4 items-start bg-secondary rounded-2xl p-6 shadow-sm">
                <DuotoneIcon icon={t.icon} tone={toneAt(i)} size="sm" />
                <div>
                  <h3 className="font-serif font-bold text-primary mb-1">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond the Classroom */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Co-Curricular</p>
            <h2 className="section-title">Beyond the Classroom</h2>
            <p className="text-muted-foreground">Diverse co-curricular activities for holistic development.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {coActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-card rounded-xl px-4 py-3 shadow-sm">
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm font-semibold text-foreground">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AcademicsPrimary;
