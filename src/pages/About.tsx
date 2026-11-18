import useScrollToHash from "@/hooks/useScrollToHash";
import { Users, Target, Eye, BookOpen, Award, Shield, Lightbulb, Heart, ArrowRight } from "lucide-react";
import { getYearsOfExcellence } from "@/lib/schoolDates";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  useScrollToHash();

  return (
    <>
      {/* Page Banner */}
      <section className="relative bg-primary text-primary-foreground py-24">
        <div className="container-custom text-center relative z-10">
          <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Who We Are</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            A Legacy of <span className="text-accent">Excellence</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Since 2002, Nethaji Vidhyalayam has been a beacon of knowledge, shaping young minds into global leaders.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Story</p>
              <h2 className="section-title">From Humble Beginnings to Educational Excellence</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nethaji Vidhyalayam was established on 11th June 2002 with the vision of providing 
                wholesome education through the English medium. The school aims to offer a strong 
                academic foundation while nurturing values rooted in Bharat culture, with special 
                emphasis on Bharath cultural traditions.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our mission is to provide modern, value-based education that supports the overall 
                development of every child. From <strong>Pre KG</strong> to <strong>5th Grade</strong>, 
                the aim of the school is to lay emphasis on experiential learning and grooming of 
                young children thereby making them responsible citizens and leaders with a difference.
              </p>
              <div className="flex gap-8 mt-6">
                <div className="border-l-4 border-accent pl-4">
                  <p className="text-3xl font-bold text-primary">{getYearsOfExcellence()}+</p>
                  <p className="text-sm text-muted-foreground">Years of Service</p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <p className="text-3xl font-bold text-primary">2000+</p>
                  <p className="text-sm text-muted-foreground">Alumni Network</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop"
                alt="School campus"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="vision" className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Purpose</p>
            <h2 className="section-title">Vision & Mission</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg card-hover">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                Holistic development of the student into a responsible, morally upright citizen 
                capable of thinking, learning and striving for national development.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-lg card-hover">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-4">Our Mission</h3>
              <ul className="text-muted-foreground space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  Establish a self-reliant center of excellence dedicated to imparting knowledge.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  Foster quality consciousness and holistic development among learners.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  Develop ideal citizens who actively contribute to nation-building.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Ethos</p>
            <h2 className="section-title">Core Values</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Integrity", desc: "We uphold the highest standards of honesty and ethics in all our actions." },
              { icon: Lightbulb, title: "Innovation", desc: "We embrace change and constantly seek better ways to teach and learn." },
              { icon: Users, title: "Inclusivity", desc: "We celebrate diversity and ensure every voice is heard and valued." },
              { icon: Award, title: "Excellence", desc: "We strive for the highest quality in everything we do." },
            ].map((value, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-lg text-center card-hover">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif font-bold text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="team" className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Leaders</p>
            <h2 className="section-title">Leadership & Guidance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
             {[
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
            ].map((leader) => (
              <div key={leader.name} className="bg-card rounded-2xl overflow-hidden shadow-lg card-hover text-center">
                <img src={leader.image} alt={leader.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-primary">{leader.name}</h3>
                  <p className="text-accent font-semibold text-sm mb-3 uppercase">{leader.role}</p>
                  <p className="text-muted-foreground text-sm">{leader.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Correspondent's / Chairman's Message */}
      <section id="correspondent" className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/photos/leadership/chairman.jpg"
                alt="Mr. J.J. NARESHKUMAR - Chairman"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div>
              <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">From the Correspondent</p>
              <h2 className="section-title">Chairman's Message</h2>
              <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">
                "Every child is a lamp waiting to be lit. Our duty is not just to teach, but to ignite."
              </blockquote>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our commitment to providing world-class education remains unwavering. We believe every child deserves the opportunity to learn, grow, and excel in a supportive environment.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Since the inception of Nethaji Vidhyalayam in 2002, our vision has been to create an educational institution that stands apart in its dedication to student welfare and academic achievement. We continue to invest in infrastructure, technology, and faculty development to ensure the best learning experience for every child.
              </p>
              <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">
                "We do not build buildings here. We build character, confidence, and the future of our nation."
              </blockquote>
              <p className="font-serif font-bold text-primary">— Mr. J.J. NARESHKUMAR, Chairman</p>
            </div>
          </div>
        </div>
      </section>

      {/* School History */}
      <section id="history" className="bg-background">
        <div className="bg-primary text-primary-foreground py-16 md:py-20">
          <div className="container-custom text-center">
            <p className="inline-flex items-center rounded-full border border-primary-foreground/30 px-4 py-1 text-sm font-semibold">
              EST. 2001
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-5 mb-4">Our Journey</h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              From a small classroom to a leading institution, explore the milestones that define our legacy.
            </p>
          </div>
        </div>
        <div className="section-padding bg-secondary">
          <div className="container-custom">
            <div className="grid md:grid-cols-[minmax(0,0.95fr)_3rem_minmax(0,1.05fr)] gap-8 md:gap-6 items-center">
              <article className="bg-card border-t-4 border-accent rounded-lg p-6 md:p-8 shadow-md">
                <p className="text-5xl font-bold text-muted/50 mb-3">2001</p>
                <h3 className="font-serif text-2xl font-bold text-primary mb-4">
                  The Birth of Nethaji Vidhyalayam
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nethaji Vidhyalayam was established on 7th June 2001. The school was inaugurated by Shri Rama Gopalan, the founder-organizer of Hindu Munnani, Tamil Nadu. Nethaji Vidhyalayam is affiliated with Vidya Bharati, Tamil Nadu, an All India Educational Organization with over 28,720 schools across the country.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Over the years, the school has grown significantly and earned recognition as one of the leading institutions in the locality. The consistent growth in student strength is a testament to our commitment to quality education.
                </p>
                <p className="mt-6 text-sm font-semibold uppercase text-accent">Milestone Achieved</p>
              </article>
              <div className="hidden md:flex h-full min-h-64 justify-center" aria-hidden="true">
                <div className="relative w-px bg-border">
                  <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-accent" />
                </div>
              </div>
              <figure>
                <img
                  src="/photos/history/milestones.jpg"
                  alt="Students gathered for a school milestone at Nethaji Vidhyalayam"
                  className="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="mt-16 border-t border-border pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">Be Part of Our Future</h3>
                <p className="text-muted-foreground max-w-2xl">
                  The story of Nethaji Vidhyalayam is still being written. Join us and help shape the next chapter of excellence.
                </p>
              </div>
              <Button asChild className="shrink-0 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/admissions">
                  Apply for Admission <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section id="message" className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">From the Principal</p>
              <h2 className="section-title">Principal's Message</h2>
              <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">
                "Education is the most powerful weapon which you can use to change the world. 
                At Nethaji, we don't just teach; we inspire."
              </blockquote>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As the Principal of Nethaji Vidhyalayam, I am proud to lead an institution that 
                values both academic excellence and character development. Our dedicated team of 
                educators works tirelessly to ensure that every student receives personalized 
                attention and guidance.
              </p>
              <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">
                "Every child who enters our school is unique. Our promise is to see that uniqueness, nurture it, and let it shine."
              </blockquote>
              <p className="font-serif font-bold text-primary">— Mrs. P.S. JANANI, Principal</p>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/photos/leadership/principal.jpg"
                alt="Mrs. P.S. JANANI - Principal"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: `${getYearsOfExcellence()}+`, label: "Years of Excellence" },
              { number: "2000+", label: "Alumni Network" },
              { number: "12+", label: "Qualified Teaching Staff" },
              { number: "100%", label: "Pass Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-accent mb-2">{stat.number}</p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
