import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Eye, Heart, Lightbulb, Shield, Target, Users } from "lucide-react";
import { getYearsOfExcellence } from "@/lib/schoolDates";

const About = () => {
  const topics = [
    { title: "History", description: "Explore the school’s founding and the milestones of its journey.", path: "/about/history", icon: BookOpen },
    { title: "Our Story", description: "Discover the beginnings and journey of Nethaji Vidhyalayam.", path: "/about/story", icon: BookOpen },
    { title: "Vision & Mission", description: "Explore the purpose and principles guiding our school.", path: "/about/vision", icon: Eye },
    { title: "Leadership Team", description: "Meet the people who guide and support our students.", path: "/about/leadership", icon: Users },
    { title: "Chairman's Message", description: "Read a message from our Chairman, Mr. J.J. Nareshkumar.", path: "/about/chairman", icon: Target },
    { title: "Principal's Message", description: "Read a message from our Principal, Mrs. P.S. Janani.", path: "/about/principal", icon: Heart },
  ];

  return (
    <>
      <section className="relative bg-primary text-primary-foreground py-24">
        <div className="container-custom text-center relative z-10">
          <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Who We Are</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            A Legacy of <span className="text-accent">Wisdom</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Since 2002, we are a devoted family of mentors and dreamers. Our heritage is trust, our path is enlightenment, our joy is watching children flourish.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {topics.map((topic) => (
              <Link key={topic.path} to={topic.path} className="group bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <topic.icon className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-serif text-xl font-bold text-primary mb-2">{topic.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Ethos</p>
            <h2 className="section-title">Core Values</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Integrity", desc: "Truthful in thought. Sincere in speech. Principled in conduct." },
              { icon: Lightbulb, title: "Innovation", desc: "Imaginative in ideas. Adventurous in methods. Curious in exploration." },
              { icon: Users, title: "Inclusivity", desc: "Warm in welcome. Respectful in difference. Equal in opportunity." },
              { icon: BookOpen, title: "Excellence", desc: "Dedicated in effort. Graceful in work. Committed in pursuit." },
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

      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: `${getYearsOfExcellence()}+`, label: "Years of Excellence" },
              { number: "5000+", label: "Alumni Network" },
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
