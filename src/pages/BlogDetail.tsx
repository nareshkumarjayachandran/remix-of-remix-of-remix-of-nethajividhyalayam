import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import posts from "@/data/blogPosts.json";
import { formatBlogDate } from "./Blog";
import VoiceReader from "@/components/ui/VoiceReader";
import { extractHtmlSpeechSegments, type SpeechLanguage } from "@/lib/speechText";
import { getBlogTranslation } from "@/data/blogTranslations";

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Source+Serif+4:wght@400;600&family=IBM+Plex+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"><base target="_top">`;

const BlogDetail = () => {
  const { slug } = useParams();
  const idx = posts.findIndex((p) => p.slug === slug);
  const post = posts[idx];
  const frame = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(1200);

  useEffect(() => {
    window.scrollTo(0, 0);
    const el = frame.current;
    if (!el) return;
    const fit = () => { const d = el.contentDocument; if (d) setH(d.documentElement.scrollHeight); };
    el.addEventListener("load", fit);
    const t = setInterval(fit, 1000);
    return () => { el.removeEventListener("load", fit); clearInterval(t); };
  }, [slug]);

  const getBlogSpeechSegments = useCallback(
    (_includeAnswers: boolean, language: SpeechLanguage = "en") => {
      if (!post) return [];
      if (language === "ta" || language === "hi") {
        const translated = getBlogTranslation(post.slug, language);
        if (translated && translated.length > 0) return translated;
      }
      return extractHtmlSpeechSegments(post.content, post.title);
    },
    [post],
  );

  if (!post) return (
    <div className="container-custom py-24 text-center">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <Link to="/blog" className="text-accent underline">Back to Blog</Link>
    </div>
  );
  const prev = posts[idx - 1], next = posts[idx + 1];
  return (
    <div className="bg-muted/40">
      <section className="relative h-[340px] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/70 flex flex-col items-center justify-center text-center px-4 text-primary-foreground">
          <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-4">{post.category}</span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold max-w-4xl mb-4">{post.title}</h1>
          <div className="flex gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatBlogDate(post.published_date)}</span>
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
          </div>
        </div>
      </section>
      <div className="container-custom py-8">
        <div className="mb-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent py-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <VoiceReader
            key={post.slug}
            getTextSegments={getBlogSpeechSegments}
            showAnswersToggle={false}
            availableLanguages={["en", "ta", "hi"]}
            align="full"
            className="mt-2"
          />
        </div>
        <iframe ref={frame} title={post.title} srcDoc={fonts + post.content} style={{ height: h }}
          className="w-full border-0 rounded-2xl shadow-lg bg-card" />
        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          {prev ? <Link to={`/blog/${prev.slug}`} className="p-5 bg-card rounded-xl border border-border hover:border-accent"><span className="text-xs text-muted-foreground">← Newer</span><p className="font-semibold">{prev.title}</p></Link> : <div />}
          {next && <Link to={`/blog/${next.slug}`} className="p-5 bg-card rounded-xl border border-border hover:border-accent text-right"><span className="text-xs text-muted-foreground">Older →</span><p className="font-semibold">{next.title}</p></Link>}
        </div>
      </div>
    </div>
  );
};
export default BlogDetail;
