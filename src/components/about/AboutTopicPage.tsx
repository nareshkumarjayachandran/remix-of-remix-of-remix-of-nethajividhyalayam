import { Link } from "react-router-dom";
import { Eye, Target } from "lucide-react";
import useScrollToHash from "@/hooks/useScrollToHash";
import { getYearsOfExcellence } from "@/lib/schoolDates";

export type AboutTopic = "history" | "story" | "vision" | "leadership" | "principal" | "chairman";

const topics: Record<AboutTopic, { title: string; eyebrow: string; intro: string }> = {
  history: {
    title: "Our History",
    eyebrow: "Est. 2002",
    intro: "From a small classroom to a leading institution, explore the milestones that define our legacy.",
  },
  story: {
    title: "Our Story",
    eyebrow: "Who We Are",
    intro: "A legacy of learning, care, and opportunity for every child since 2002.",
  },
  vision: {
    title: "Vision & Mission",
    eyebrow: "Our Purpose",
    intro: "The principles that guide how we help every student learn, grow, and contribute.",
  },
  leadership: {
    title: "Leadership Team",
    eyebrow: "Our Leaders",
    intro: "Meet the dedicated team guiding Nethaji Vidhyalayam and its students.",
  },
  principal: {
    title: "Principal's Message",
    eyebrow: "From the Principal",
    intro: "A message from Mrs. P.S. Janani, Principal of Nethaji Vidhyalayam.",
  },
  chairman: {
    title: "Chairman's Message",
    eyebrow: "From the Correspondent",
    intro: "A message from Mr. J.J. Nareshkumar, Chairman of Nethaji Vidhyalayam.",
  },
};

const leadership = [
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

const TopicBanner = ({ topic }: { topic: AboutTopic }) => (
  <section className="bg-primary text-primary-foreground py-16 md:py-20">
    <div className="container-custom text-center">
      <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">{topics[topic].eyebrow}</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{topics[topic].title}</h1>
      <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">{topics[topic].intro}</p>
    </div>
  </section>
);

const StoryContent = () => (
  <section className="section-padding bg-background">
    <div className="container-custom grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Our Story</p>
        <h2 className="section-title">From a Small Seed to a Beautiful Garden</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <em>"A school is not built with bricks. It is built with dreams, values and the smiles of children."</em>
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nethaji Vidhyalayam was born on 8th June 2002 with a simple and meaningful dream - to give every child a joyful education filled with knowledge and values. We started small, but with a big heart. Rooted in Bharatiya culture and guided by modern learning, we grew step by step, child by child.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Today, from <strong>Pre-KG</strong> to <strong>5th Grade</strong>, Nethaji Vidhyalayam is a warm and vibrant place where children learn by doing, grow with love, and lead with kindness.
        </p>
        <div className="flex gap-8 mt-6">
          <div className="border-l-4 border-accent pl-4">
            <p className="text-3xl font-bold text-primary">{getYearsOfExcellence()}+</p>
            <p className="text-sm text-muted-foreground">Years of Service</p>
          </div>
          <div className="border-l-4 border-accent pl-4">
            <p className="text-3xl font-bold text-primary">5000+</p>
            <p className="text-sm text-muted-foreground">Alumni Network</p>
          </div>
        </div>
      </div>
      <img src="/photos/about/our-story-campus.jpg" alt="School campus" className="rounded-xl shadow-xl w-full" />
    </div>
  </section>
);

const HistoryContent = () => (
  <section className="section-padding bg-background">
    <div className="container-custom max-w-4xl">
      <article className="border-l-4 border-accent pl-6 md:pl-10">
        <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">8 June 2002</p>
        <h2 className="section-title">The Birth of Nethaji Vidhyalayam</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nethaji Vidhyalayam blossomed into existence on 8th June 2002, inaugurated by Shri. S. Thirunavukarasar, Former Central Minister of Information and Technology, Tamil Nadu. Affiliated to VIDYA BHARATI, TAMIL NADU - an All India Educational Organisation guiding over 29,000 schools across Bharat - our institution has flourished into one of the most trusted centres of learning in this locality, where rising student strength reflects heartfelt devotion to quality.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Our vision is wholesome learning through English medium, nurturing values rooted in Bharatiya culture while building a strong academic foundation. Our mission is to offer modern, value-rooted instruction that blossoms the all-round growth of every child.
        </p>
      </article>
    </div>
  </section>
);

const VisionContent = () => (
  <section className="section-padding bg-secondary">
    <div className="container-custom grid md:grid-cols-2 gap-8">
      <div className="bg-card p-8 rounded-xl shadow-lg">
        <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6"><Eye className="h-8 w-8 text-accent" /></div>
        <h2 className="font-serif text-2xl font-bold text-primary mb-4">Our Vision</h2>
        <p className="text-muted-foreground leading-relaxed">To nurture every child into a wise, kind, disciplined and responsible citizen, who thinks clearly, learns joyfully and works selflessly for the growth of our nation.</p>
      </div>
      <div className="bg-card p-8 rounded-xl shadow-lg">
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6"><Target className="h-8 w-8 text-primary" /></div>
        <h2 className="font-serif text-2xl font-bold text-primary mb-4">Our Mission</h2>
        <ul className="text-muted-foreground space-y-3">
          <li className="flex items-start gap-2"><span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />To build a strong, self-reliant and caring centre of excellence.</li>
          <li className="flex items-start gap-2"><span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />To give joyful, quality and value-based education.</li>
          <li className="flex items-start gap-2"><span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />To shape confident, compassionate and courageous citizens who serve the nation with love and pride.</li>
        </ul>
      </div>
    </div>
  </section>
);

const LeadershipContent = () => (
  <section className="section-padding bg-secondary">
    <div className="container-custom">
      <div className="grid md:grid-cols-3 gap-8">
        {leadership.map((leader) => (
          <article key={leader.name} className="bg-card rounded-xl overflow-hidden shadow-lg text-center">
            <img src={leader.image} alt={leader.name} className="w-full h-auto aspect-[3/2] object-contain bg-muted" />
            <div className="p-6">
              <h2 className="font-serif text-xl font-bold text-primary">{leader.name}</h2>
              <p className="text-accent font-semibold text-sm mb-3 uppercase">{leader.role}</p>
              <p className="text-muted-foreground text-sm">{leader.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const ChairmanContent = () => (
  <section className="section-padding bg-secondary">
    <div className="container-custom grid md:grid-cols-2 gap-12 items-center">
      <img src="/photos/leadership/chairman.jpg" alt="Mr. J.J. NARESHKUMAR - Chairman" className="rounded-xl shadow-xl w-full" />
      <div>
        <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">“Every child is a lamp waiting to be lit. Our duty is not just to teach, but to ignite.”</blockquote>
        <p className="text-muted-foreground leading-relaxed mb-4">Our commitment to providing world-class education remains unwavering. We believe every child deserves the opportunity to learn, grow, and excel in a supportive environment.</p>
        <p className="text-muted-foreground leading-relaxed mb-4">Since the inception of Nethaji Vidhyalayam in 2002, our vision has been to create an educational institution that stands apart in its dedication to student welfare and academic achievement. We continue to invest in infrastructure, technology, and faculty development to ensure the best learning experience for every child.</p>
        <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">“We do not build buildings here. We build character, confidence, and the future of our nation.”</blockquote>
        <p className="font-serif font-bold text-primary">— Mr. J.J. NARESHKUMAR, Chairman</p>
      </div>
    </div>
  </section>
);

const PrincipalContent = () => (
  <section className="section-padding bg-background">
    <div className="container-custom grid md:grid-cols-2 gap-12 items-center">
      <div>
        <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">“Education is the most powerful weapon which you can use to change the world. At Nethaji, we don't just teach; we inspire.”</blockquote>
        <p className="text-muted-foreground leading-relaxed mb-4">As the Principal of Nethaji Vidhyalayam, I am proud to lead an institution that values both academic excellence and character development. Our dedicated team of educators works tirelessly to ensure that every student receives personalized attention and guidance.</p>
        <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-6 mb-6">“Every child who enters our school is unique. Our promise is to see that uniqueness, nurture it, and let it shine.”</blockquote>
        <p className="font-serif font-bold text-primary">— Mrs. P.S. JANANI, Principal</p>
      </div>
      <img src="/photos/leadership/principal.jpg" alt="Mrs. P.S. JANANI - Principal" className="rounded-xl shadow-xl w-full" />
    </div>
  </section>
);

const content: Record<AboutTopic, () => JSX.Element> = {
  history: HistoryContent,
  story: StoryContent,
  vision: VisionContent,
  leadership: LeadershipContent,
  principal: PrincipalContent,
  chairman: ChairmanContent,
};

const AboutTopicPage = ({ topic }: { topic: AboutTopic }) => {
  useScrollToHash();
  const Content = content[topic];

  return (
    <>
      <TopicBanner topic={topic} />
      <Content />
      <section className="bg-background border-t">
        <div className="container-custom py-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {Object.entries(topics).map(([key, value]) => (
            <Link key={key} to={`/about/${key}`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">{value.title}</Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default AboutTopicPage;