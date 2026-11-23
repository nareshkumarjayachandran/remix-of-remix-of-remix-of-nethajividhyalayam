import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import posts from "@/data/blogPosts.json";

const categories = ["All", "Academic", "School Life", "Announcements", "Achievement"];
export const formatBlogDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

const Blog = () => {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const list = posts.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (!q || (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="bg-muted/40 min-h-screen pb-20">
      <section className="relative h-[360px] overflow-hidden">
        <img src="/photos/blog/Best_Learning_Games_for_Preschool_Children.jpg" alt="Blog banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/70 flex flex-col items-center justify-center text-center px-4 text-primary-foreground">
          <span className="py-1 px-4 rounded-full bg-primary-foreground/20 font-semibold mb-4">Nethaji Vidhyalayam</span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">Blog & News</h1>
          <p className="text-lg md:text-xl max-w-2xl opacity-90">Stories, updates, and highlights from our vibrant school community.</p>
        </div>
      </section>
      <div className="container-custom -mt-10 relative z-10">
        <div className="bg-card rounded-xl shadow-lg p-4 mb-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${cat === c ? "bg-accent text-accent-foreground shadow-md" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
        </div>
        {list.length === 0 ? (
          <p className="text-center py-24 text-muted-foreground">No posts match your filter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((p) => (
              <div key={p.id} className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border flex flex-col">
                <Link to={`/blog/${p.slug}`} className="block h-52 overflow-hidden relative">
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">{p.category}</span>
                </Link>
                <div className="p-6 flex flex-col grow">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-accent" />{formatBlogDate(p.published_date)}</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-accent" />{p.author}</span>
                  </div>
                  <Link to={`/blog/${p.slug}`}><h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent line-clamp-2">{p.title}</h3></Link>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 grow">{p.excerpt}</p>
                  <Link to={`/blog/${p.slug}`} className="w-full py-3 px-4 bg-primary text-primary-foreground hover:bg-accent font-semibold rounded-xl flex items-center justify-center gap-2">
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Blog;
