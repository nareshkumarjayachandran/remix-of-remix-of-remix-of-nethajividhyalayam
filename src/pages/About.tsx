import useScrollToHash from "@/hooks/useScrollToHash";
import { getYearsOfExcellence } from "@/lib/schoolDates";
import { cn } from "@/lib/utils";
import { ArrowRight, Award, Eye, Lightbulb, Shield, Target, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const aboutTabs = [
  { id: "story", label: "Our Story" },
  { id: "vision", label: "Vision and Mission" },
  { id: "team", label: "Leadership Team" },
  { id: "message", label: "Principal's Message" },
  { id: "correspondent", label: "Chairman's Message" },
  { id: "history", label: "History" },
];

const leaders = [
  {
    name: "Mr. J.J. NARESHKUMAR",
    role: "Correspondent / Chairman",
    image: "/photos/leadership/chairman.jpg",
    description: "Leading the institution with decades of experience in education and a vision for holistic student development.",
  },
  {
    name: "Mrs. P.S. JANANI",
    role: "Principal",
    image: "/photos/leadership/principal.jpg",
    description: "An accomplished educator committed to academic excellence and holistic student development.",
  },
  {
    name: "Mrs. M. DEVIKALA",
    role: "Vice Principal",
    image: "/photos/leadership/vice-principal.jpg",
    description: "Ensuring smooth administration and upholding the values of the institution with dedication and integrity.",
  },
];

const About = () => {
  useScrollToHash();
  const { hash } = useLocation();
  const activeTab = aboutTabs.some((tab) => `#${tab.id}` === hash)
    ? hash.slice(1)
    : "story";

  return (
    <>
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container-custom text-center">
          <p className="text-accent font-semibold mb-2 uppercase text-sm">Who We Are</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            A Legacy of <span className="text-accent">Excellence</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Since 2002, Nethaji Vidhyalayam has been a beacon of knowledge, shaping young minds into global leaders.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
            <nav aria-label="About Us sections" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 border border-border rounded-lg overflow-hidden bg-card">
              {aboutTabs.map((tab, index) => (
                <Link
                  key={tab.id}
                  to={`/about#${tab.id}`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 items-center gap-3 border-border px-4 py-3 text-sm font-semibold transition-colors",
                    "border-b last:border-b-0 lg:border-b",
                    index % 2 === 0 && "border-r sm:border-r-0",
                    index % 3 !== 2 && "sm:border-r lg:border-r-0",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary hover:text-accent",
                  )}
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                    activeTab === tab.id ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-muted-foreground",
                  )}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>

            <div className="min-w-0">
              {activeTab === "story" && (
                <section id="story" aria-labelledby="story-title" className="scroll-mt-24">
                  <p className="text-accent font-semibold mb-2 uppercase text-sm">Our Story</p>
                  <h2 id="story-title" className="section-title">From Humble Beginnings to Educational Excellence</h2>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Nethaji Vidhyalayam was established on 11th June 2002 with the vision of providing wholesome education through the English medium. The school aims to offer a strong academic foundation while nurturing values rooted in Bharat culture, with special emphasis on Bharath cultural traditions.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Our mission is to provide modern, value-based education that supports the overall development of every child. From <strong>Pre KG</strong> to <strong>5th Grade</strong>, we emphasize experiential learning and help young children grow into responsible citizens and leaders with a difference.
                      </p>
                    </div>
                    <img
                      src="/photos/academics/classroom-1.jpg"
                      alt="Students learning together in a Nethaji Vidhyalayam classroom"
                      className="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="mt-8 flex flex-wrap gap-8">
                    <div className="border-l-4 border-accent pl-4">
                      <p className="text-3xl font-bold text-primary">{getYearsOfExcellence()}+</p>
                      <p className="text-sm text-muted-foreground">Years of Service</p>
                    </div>
                    <div className="border-l-4 border-accent pl-4">
                      <p className="text-3xl font-bold text-primary">2000+</p>
                      <p className="text-sm text-muted-foreground">Alumni Network</p>
                    </div>
                  </div>
                  <div className="mt-12 border-t border-border pt-8">
                    <h3 className="font-serif text-2xl font-bold text-primary mb-6">Core Values</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {[
                        { icon: Shield, title: "Integrity", desc: "We uphold the highest standards of honesty and ethics in all our actions." },
                        { icon: Lightbulb, title: "Innovation", desc: "We embrace change and constantly seek better ways to teach and learn." },
                        { icon: Users, title: "Inclusivity", desc: "We celebrate diversity and ensure every voice is heard and valued." },
                        { icon: Award, title: "Excellence", desc: "We strive for the highest quality in everything we do." },
                      ].map((value) => (
                        <div key={value.title} className="flex gap-4 border-t border-border pt-4">
                          <value.icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                          <div>
                            <h4 className="font-semibold text-primary">{value.title}</h4>
                            <p className="text-sm text-muted-foreground">{value.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "vision" && (
                <section id="vision" aria-labelledby="vision-title" className="scroll-mt-24">
                  <p className="text-accent font-semibold mb-2 uppercase text-sm">Our Purpose</p>
                  <h2 id="vision-title" className="section-title">Vision and Mission</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <article className="border-t-4 border-accent bg-card p-6 md:p-8 rounded-lg shadow-sm">
                      <Eye className="h-8 w-8 text-accent mb-5" aria-hidden="true" />
                      <h3 className="font-serif text-2xl font-bold text-primary mb-4">Our Vision</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Holistic development of the student into a responsible, morally upright citizen capable of thinking, learning and striving for national development.
                      </p>
                    </article>
                    <article className="border-t-4 border-primary bg-card p-6 md:p-8 rounded-lg shadow-sm">
                      <Target className="h-8 w-8 text-primary mb-5" aria-hidden="true" />
                      <h3 className="font-serif text-2xl font-bold text-primary mb-4">Our Mission</h3>
                      <ul className="text-muted-foreground space-y-3">
                        <li>Establish a self-reliant center of excellence dedicated to imparting knowledge.</li>
                        <li>Foster quality consciousness and holistic development among learners.</li>
                        <li>Develop ideal citizens who actively contribute to nation-building.</li>
                      </ul>
                    </article>
                  </div>
                </section>
              )}

              {activeTab === "team" && (
                <section id="team" aria-labelledby="team-title" className="scroll-mt-24">
                  <p className="text-accent font-semibold mb-2 uppercase text-sm">Our Leaders</p>
                  <h2 id="team-title" className="section-title">Leadership Team</h2>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {leaders.map((leader) => (
                      <article key={leader.name} className="bg-card border border-border rounded-lg overflow-hidden">
                        <img src={leader.image} alt={leader.name} className="w-full aspect-[4/3] object-cover" />
                        <div className="p-5">
                          <h3 className="font-serif text-xl font-bold text-primary">{leader.name}</h3>
                          <p className="text-accent font-semibold text-sm mb-3 uppercase">{leader.role}</p>
                          <p className="text-muted-foreground text-sm">{leader.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "message" && (
                <section id="message" aria-labelledby="principal-title" className="scroll-mt-24">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1">
                      <p className="text-accent font-semibold mb-2 uppercase text-sm">From the Principal</p>
                      <h2 id="principal-title" className="section-title">Principal's Message</h2>
                      <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-5 mb-5">
                        “Education is the most powerful weapon which you can use to change the world. At Nethaji, we don't just teach; we inspire.”
                      </blockquote>
                      <p className="text-muted-foreground leading-relaxed mb-5">
                        As the Principal of Nethaji Vidhyalayam, I am proud to lead an institution that values both academic excellence and character development. Our dedicated team of educators works tirelessly to ensure that every student receives personalized attention and guidance.
                      </p>
                      <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-5 mb-5">
                        “Every child who enters our school is unique. Our promise is to see that uniqueness, nurture it, and let it shine.”
                      </blockquote>
                      <p className="font-serif font-bold text-primary">— Mrs. P.S. JANANI, Principal</p>
                    </div>
                    <img src="/photos/leadership/principal.jpg" alt="Mrs. P.S. JANANI, Principal" className="order-1 md:order-2 w-full aspect-[4/3] object-cover rounded-lg shadow-md" />
                  </div>
                </section>
              )}

              {activeTab === "correspondent" && (
                <section id="correspondent" aria-labelledby="chairman-title" className="scroll-mt-24">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <img src="/photos/leadership/chairman.jpg" alt="Mr. J.J. NARESHKUMAR, Chairman" className="w-full aspect-[4/3] object-cover rounded-lg shadow-md" />
                    <div>
                      <p className="text-accent font-semibold mb-2 uppercase text-sm">From the Correspondent</p>
                      <h2 id="chairman-title" className="section-title">Chairman's Message</h2>
                      <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-5 mb-5">
                        “Every child is a lamp waiting to be lit. Our duty is not just to teach, but to ignite.”
                      </blockquote>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Our commitment to providing world-class education remains unwavering. We believe every child deserves the opportunity to learn, grow, and excel in a supportive environment.
                      </p>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Since the inception of Nethaji Vidhyalayam in 2002, our vision has been to create an educational institution that stands apart in its dedication to student welfare and academic achievement. We continue to invest in infrastructure, technology, and faculty development to ensure the best learning experience for every child.
                      </p>
                      <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-5 mb-5">
                        “We do not build buildings here. We build character, confidence, and the future of our nation.”
                      </blockquote>
                      <p className="font-serif font-bold text-primary">— Mr. J.J. NARESHKUMAR, Chairman</p>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "history" && (
                <section id="history" aria-labelledby="history-title" className="scroll-mt-24">
                  <div className="bg-primary text-primary-foreground rounded-lg px-6 py-10 md:px-10 text-center mb-8">
                    <p className="inline-flex items-center rounded-full border border-primary-foreground/30 px-4 py-1 text-sm font-semibold">EST. 2001</p>
                    <h2 id="history-title" className="font-serif text-4xl md:text-5xl font-bold mt-5 mb-4">Our Journey</h2>
                    <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                      From a small classroom to a leading institution, explore the milestones that define our legacy.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <article className="border-t-4 border-accent bg-card rounded-lg p-6 md:p-8 shadow-sm">
                      <p className="text-5xl font-bold text-muted/50 mb-3">2001</p>
                      <h3 className="font-serif text-2xl font-bold text-primary mb-4">The Birth of Nethaji Vidhyalayam</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Nethaji Vidhyalayam was established on 7th June 2001. The school was inaugurated by Shri Rama Gopalan, the founder-organizer of Hindu Munnani, Tamil Nadu. Nethaji Vidhyalayam is affiliated with Vidya Bharati, Tamil Nadu, an All India Educational Organization with over 28,720 schools across the country.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Over the years, the school has grown significantly and earned recognition as one of the leading institutions in the locality. The consistent growth in student strength is a testament to our commitment to quality education.
                      </p>
                      <p className="mt-6 text-sm font-semibold uppercase text-accent">Milestone Achieved</p>
                    </article>
                    <img
                      src="/photos/history/milestones.jpg"
                      alt="Students gathered for a school milestone at Nethaji Vidhyalayam"
                      className="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="mt-10 border-t border-border pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary mb-2">Be Part of Our Future</h3>
                      <p className="text-muted-foreground max-w-2xl">
                        The story of Nethaji Vidhyalayam is still being written. Join us and help shape the next chapter of excellence.
                      </p>
                    </div>
                    <Link to="/admissions" className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                      Apply for Admission <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;