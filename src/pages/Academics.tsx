import useScrollToHash from "@/hooks/useScrollToHash";
import { BookOpen, GraduationCap, Palette, Award, Star } from "lucide-react";
import { getYearsOfExcellence } from "@/lib/schoolDates";

const Academics = () => {
  useScrollToHash();

  return (
    <>
      {/* Banner */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Academics</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            A well-rounded curriculum designed to nurture young minds from Pre KG to 5th Grade
          </p>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section id="curriculum" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Approach</p>
            <h2 className="section-title">Academic Program Overview</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At Nethaji Vidhyalayam, we follow a comprehensive curriculum that balances academic excellence with
                experiential learning. Our approach is designed to develop critical thinking, creativity, and strong
                moral values in every student.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From <strong>Pre KG</strong> to <strong>5th Grade</strong>, we emphasize experiential learning and
                grooming of young children, making them responsible citizens and leaders with a difference.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our curriculum integrates modern teaching methodologies with Bharat cultural traditions, ensuring
                students receive a wholesome education through the English medium.
              </p>
            </div>
            <div className="relative">
              <img
                src="/photos/academics/nursery-classroom.jpg"
                alt="Classroom learning"
                className="rounded-2xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold">{getYearsOfExcellence()}+</p>
                <p className="text-sm">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Primary 
      <section id="pre-primary" className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Early Years</p>
            <h2 className="section-title">Pre-Primary (Pre KG – UKG)</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/photos/academics/classroom-1.jpg"
                alt="Pre-primary children"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our pre-primary program provides a warm, safe, and stimulating environment where young 
                learners develop foundational skills through play-based and activity-driven learning.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Palette, title: "Activity-Based Learning", desc: "Hands-on activities, storytelling, art, and music for holistic development" },
                  { icon: Star, title: "Phonics & Language Skills", desc: "Strong foundation in English with phonics-based reading and writing" },
                  { icon: BookOpen, title: "Number Readiness", desc: "Fun and interactive approach to mathematical concepts" },
                  { icon: Award, title: "Social Skills", desc: "Group activities and value education for character development" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-primary">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Primary 
      <section id="primary" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Foundation Years</p>
            <h2 className="section-title">Primary (Grade 1 – Grade 5)</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The primary curriculum builds on the pre-primary foundation, introducing structured 
                academic subjects while maintaining an engaging and child-friendly approach.
              </p>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, title: "Core Subjects", desc: "English, Tamil, Mathematics, Environmental Science, and General Knowledge" },
                  { icon: GraduationCap, title: "Computer Education", desc: "Introduction to computers and digital literacy from Grade 1" },
                  { icon: Palette, title: "Co-curricular Activities", desc: "Art, craft, music, dance, yoga, and physical education" },
                  { icon: Award, title: "Assessments", desc: "Regular evaluations with unit tests, term exams, and continuous assessment" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-primary">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="/photos/academics/classroom-learning.jpg"
                alt="Primary students learning"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Age Criteria Table */}
      <section className="section-padding bg-secondary">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Admission Guide</p>
            <h2 className="section-title">Age Criteria (as of March 31st)</h2>
          </div>
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-6 py-4 text-left font-serif font-bold">Class</th>
                  <th className="px-6 py-4 text-left font-serif font-bold">Minimum Age</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cls: "Pre-KG", age: "3 Years" },
                  { cls: "LKG", age: "3-4 Years" },
                  { cls: "UKG", age: "4-5 Years" },
                  { cls: "Grade 1", age: "5-6 Years" },
                  { cls: "Grade 2", age: "6-7 Years" },
                  { cls: "Grade 3", age: "7-8 Years" },
                  { cls: "Grade 4", age: "8-9 Years" },
                  { cls: "Grade 5", age: "9-10 Years" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                    <td className="px-6 py-3 font-semibold text-foreground">{row.cls}</td>
                    <td className="px-6 py-3 text-muted-foreground">{row.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-6 py-3 text-xs text-muted-foreground italic">
              * Age relaxation may be considered based on the child's readiness and Principal's discretion.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Academics;
