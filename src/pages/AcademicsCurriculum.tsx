import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Globe, Zap, ChevronDown, ChevronUp } from "lucide-react";
import useScrollToHash from "@/hooks/useScrollToHash";

const stagesData = [
  {
    title: "Foundational Stage (Pre-KG)",
    summary: "Play-based Learning, Phonics, Basic Numeracy, Motor Skills",
    link: "/academics/nursery",
    subjects: [
      { name: "Language", detail: "Listening skills, action songs, rhymes, vocabulary" },
      { name: "Numbers", detail: "Number recognition, counting (1–10)" },
      { name: "Environmental Awareness", detail: "Self, family, colours, fruits, animals" },
      { name: "Motor Skills", detail: "Scribbling, finger movements, play activities" },
      { name: "Art & Craft", detail: "Colouring, tearing & pasting" },
      { name: "Physical Activities", detail: "Free play, music & movement" },
      { name: "Social Skills", detail: "Sharing, following instructions" },
    ],
  },
  {
    title: "Preparatory Stage (LKG)",
    summary: "Core Subjects (Languages, Math, EVS), Discovery Learning, Reading Habits",
    link: "/academics/nursery",
    subjects: [
      { name: "English", detail: "Phonics blending, simple sentences, picture reading, basic writing" },
      { name: "Tamil", detail: "Vowels (உயிர் எழுத்து), consonants (மெய் எழுத்து), simple words" },
      { name: "Mathematics", detail: "Numbers 1–50, shapes, patterns, addition concept" },
      { name: "EVS", detail: "My body, seasons, plants, transport, community helpers" },
      { name: "Art & Craft", detail: "Craft activities, drawing, colouring, paper folding" },
      { name: "Physical Education", detail: "Group games, exercises, yoga for kids" },
      { name: "Value Education", detail: "Respect, honesty, caring for others" },
    ],
  },
  {
    title: "Middle Stage (UKG)",
    summary: "Subject Specialization (Science, Social Studies), Critical Thinking, Project Work",
    link: "/academics/nursery",
    subjects: [
      { name: "English", detail: "Reading passages, comprehension, creative writing, grammar basics" },
      { name: "Tamil", detail: "Uyir-mei letters, simple words, sentences, short stories" },
      { name: "Mathematics", detail: "Numbers up to 100, addition & subtraction with carry, multiplication tables (1–5)" },
      { name: "Science", detail: "Living vs non-living, plants & animals, our environment" },
      { name: "Social Studies", detail: "Our school, neighbourhood, festivals, maps introduction" },
      { name: "Art & Craft", detail: "Project-based art, model-making, display work" },
      { name: "Computer Science", detail: "Introduction to computers, keyboard & mouse, basic software" },
    ],
  },
  {
    title: "Secondary Stage (Grade 1 to 5)",
    summary: "Core Academics, Life Skills, Holistic Growth",
    link: "/academics/primary",
    subjects: [
      { name: "English", detail: "Grammar, comprehension, creative writing, literature reading, vocabulary building" },
      { name: "Tamil", detail: "Prose, poetry, grammar, composition and language enrichment" },
      { name: "Mathematics", detail: "Number operations, fractions, decimals, geometry, data handling" },
      { name: "Science", detail: "Living things, matter, force & energy, Earth and environment, basic experiments" },
      { name: "Social Studies", detail: "History, civics, geography, map skills, cultural heritage" },
      { name: "Computer Science", detail: "MS Office basics, internet safety, programming logic introduction" },
      { name: "Physical Education", detail: "Outdoor sports, yoga, health & hygiene, team activities" },
      { name: "Art & Craft / Music", detail: "Creative arts, visual expression, Indian classical music basics" },
    ],
  },
];

const pillars = [
  { icon: BookOpen, title: "Academic Rigor", desc: "Challenging, research-based curriculum aligned with CBSE standards." },
  { icon: Heart, title: "Character Development", desc: "Emphasis on values, ethics, and social responsibility." },
  { icon: Globe, title: "Global Perspective", desc: "Exposure to diverse cultures, languages, and worldviews." },
  { icon: Zap, title: "Skill-Based Learning", desc: "Focus on critical thinking, creativity, and problem-solving." },
];

const AcademicsCurriculum = () => {
  useScrollToHash();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      {/* Banner */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, #c0392b 30%, #8e44ad 70%, #6c3483 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('/photos/academics/classroom-learning.jpg')] bg-cover bg-center" />
        <div className="container-custom text-center relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
            Nethaji Vidhyalayam Curriculum
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            A Modern, Holistic Approach to Education
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl text-center">
          <div className="inline-block bg-accent/10 text-accent font-semibold uppercase tracking-wider text-xs px-4 py-1.5 rounded-full mb-4">
            Educational Philosophy
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Learning for Life</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our curriculum is designed to foster critical thinking, creativity, and a global mindset through
            innovative teaching methodologies and value-based education.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our approach is student-centered, inquiry-based, and rooted in the principles of constructivism.
            We aim to cultivate lifelong learners who are curious, compassionate, and confident.
          </p>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Foundation</p>
            <h2 className="section-title">Four Pillars of Our Curriculum</h2>
            <p className="text-muted-foreground">Education that balances intellect, emotion, and ethics.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <p.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif font-bold text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Structure */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Structure</p>
            <h2 className="section-title">Curriculum Structure</h2>
            <p className="text-muted-foreground">Comprehensive coverage across all grade levels.</p>
          </div>

          <div className="space-y-4">
            {stagesData.map((stage, i) => (
              <div key={i} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
                {/* Header row */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-primary text-lg mb-1">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground">{stage.summary}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggle(i)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                        openIndex === i
                          ? "bg-accent text-accent-foreground hover:bg-accent/80"
                          : "bg-primary text-primary-foreground hover:bg-primary/80"
                      }`}
                    >
                      {openIndex === i ? (
                        <><ChevronUp className="h-4 w-4" /> Hide Details</>
                      ) : (
                        <><ChevronDown className="h-4 w-4" /> Show Details</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable subjects */}
                {openIndex === i && (
                  <div className="border-t border-border px-6 pb-6 pt-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {stage.subjects.map((sub, j) => (
                        <div key={j} className="flex gap-3 items-start">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                          <div>
                            <span className="font-semibold text-sm text-foreground">{sub.name}: </span>
                            <span className="text-sm text-muted-foreground">{sub.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Framework */}
      <section className="section-padding bg-secondary">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Evaluation</p>
            <h2 className="section-title">Assessment Framework</h2>
            <p className="text-muted-foreground">Continuous evaluation for holistic growth.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-card rounded-2xl p-6 shadow-md text-center">
              <div className="text-5xl font-bold text-accent mb-2">40%</div>
              <h3 className="font-serif font-bold text-primary mb-1">Formative Assessment</h3>
              <p className="text-sm text-muted-foreground">Quizzes, Projects, Class Participation</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-md text-center">
              <div className="text-5xl font-bold text-primary mb-2">60%</div>
              <h3 className="font-serif font-bold text-primary mb-1">Summative Assessment</h3>
              <p className="text-sm text-muted-foreground">Mid-Term & Final Exams</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <h4 className="font-serif font-bold text-primary mb-4">Key Assessment Features</h4>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "Activity-based learning",
                "Worksheets and projects",
                "Periodic assessments",
                "Continuous observation and feedback",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* School Prospectus Brochure CTA */}
      <section className="section-padding bg-primary text-primary-foreground text-center">
        <div className="container-custom max-w-2xl">
          <h2 className="font-serif text-3xl font-bold mb-4">School Prospectus</h2>
          <p className="text-primary-foreground/80 mb-8">
            Download the official Nethaji Vidhyalayam prospectus brochure — a colourful overview of our curriculum, facilities, co-curricular activities, admissions, and contact details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { import("@/lib/prospectus").then(m => m.generateProspectusPDF()); }}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-full font-bold hover:bg-accent/90 transition-colors"
            >
              <BookOpen className="h-5 w-5" /> Download Brochure
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors"
            >
              Contact Us for Details
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AcademicsCurriculum;
