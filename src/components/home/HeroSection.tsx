import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play, X, ChevronLeft, ChevronRight as ChevronRightIcon, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { heroVideos } from "@/data/schoolVideos";

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: 0=Jan, 5=Jun
  // Academic year runs June to May. Before June, show previous year's session.
  const startYear = month < 5 ? year - 1 : year; // month < 5 means Jan-May
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const HeroSection = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const nextVideo = useCallback(() => setCurrentVideo((prev) => (prev + 1) % heroVideos.length), []);
  const prevVideo = () => setCurrentVideo((prev) => (prev - 1 + heroVideos.length) % heroVideos.length);

  // Listen for YouTube video end via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.event === "onStateChange" && data.info === 0 && isAutoPlay && showGallery) {
          nextVideo();
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAutoPlay, showGallery, nextVideo]);

  return (
    <>
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/placeholder.svg"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/60 to-primary/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Admissions Open for {getAcademicYear()}</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Welcome to <span className="text-accent">Nethaji Vidhyalayam</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
              Empowering young minds with quality education, distinctive character building, and holistic development for a brighter tomorrow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/about">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-6 text-lg">
                  Read More
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/admissions#apply">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-6 text-lg">
                  Apply Now
                </Button>
              </Link>
            </div>

            {/* Watch Tour Button */}
            <div className="pt-8">
              <button
                onClick={() => { setShowGallery(true); setCurrentVideo(0); }}
                className="group inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                aria-label="Watch school tour videos"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent transition-colors">
                  <Play className="h-6 w-6 fill-current" />
                </div>
                <span className="text-sm font-medium">Watch Our School Tour ({heroVideos.length} Videos)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/80 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Interactive Video Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fade-up">
          {/* Close & Auto-play toggle */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors ${isAutoPlay ? "bg-accent text-accent-foreground" : "bg-white/10 text-white/80 hover:text-white"}`}
            >
              {isAutoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isAutoPlay ? "Auto-play ON" : "Auto-play OFF"}
            </button>
            <button
              onClick={() => setShowGallery(false)}
              className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 backdrop-blur-sm transition-colors"
              aria-label="Close video gallery"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Title */}
          <h2 className="text-white font-serif text-xl md:text-2xl font-bold mb-4">
            {heroVideos[currentVideo].title}
          </h2>

          {/* Video Player */}
          <div className="relative w-full max-w-4xl aspect-video mx-4">
            <iframe
              ref={iframeRef}
              key={currentVideo}
              src={`${heroVideos[currentVideo].url}?autoplay=1&rel=0&enablejsapi=1&origin=${window.location.origin}`}
              title={heroVideos[currentVideo].title}
              className="w-full h-full rounded-xl shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Nav Arrows */}
            <button
              onClick={prevVideo}
              className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-accent transition-colors"
              aria-label="Previous video"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextVideo}
              className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-accent transition-colors"
              aria-label="Next video"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Counter */}
          <p className="text-white/70 text-sm mt-3">
            {currentVideo + 1} / {heroVideos.length}
          </p>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 mt-4 px-4 overflow-x-auto max-w-full pb-2">
            {heroVideos.map((video, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentVideo(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  idx === currentVideo
                    ? "bg-accent text-accent-foreground scale-105"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {video.title}
              </button>
            ))}
          </div>

          {/* Mobile Nav */}
          <div className="flex gap-4 mt-4 md:hidden">
            <button onClick={prevVideo} className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-accent transition-colors">
              ← Previous
            </button>
            <button onClick={nextVideo} className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-accent transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;
