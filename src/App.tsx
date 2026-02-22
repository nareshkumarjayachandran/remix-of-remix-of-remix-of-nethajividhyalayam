import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import useFaviconPulse from "./hooks/useFaviconPulse";
import faviconLogo from "./assets/nethaji_logo2_circle.webp";

// Lazy-loaded pages for code splitting
const About = lazy(() => import("./pages/About"));
const Admissions = lazy(() => import("./pages/Admissions"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Events = lazy(() => import("./pages/Events"));
const SchoolCalendar = lazy(() => import("./pages/SchoolCalendar"));
const Facilities = lazy(() => import("./pages/Facilities"));
const Career = lazy(() => import("./pages/Career"));
const Contact = lazy(() => import("./pages/Contact"));
const Academics = lazy(() => import("./pages/Academics"));
const AcademicsNursery = lazy(() => import("./pages/AcademicsNursery"));
const AcademicsPrimary = lazy(() => import("./pages/AcademicsPrimary"));
const AcademicsCurriculum = lazy(() => import("./pages/AcademicsCurriculum"));
const FeeDesk = lazy(() => import("./pages/FeeDesk"));
const VideoGallery = lazy(() => import("./pages/VideoGallery"));
const WorksheetMaker = lazy(() => import("./pages/WorksheetMaker"));
const SpokenEnglish = lazy(() => import("./pages/SpokenEnglish"));
const QuestionPaper = lazy(() => import("./pages/QuestionPaper"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => {
  useFaviconPulse(faviconLogo);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/calendar" element={<SchoolCalendar />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/academics/nursery" element={<AcademicsNursery />} />
              <Route path="/academics/primary" element={<AcademicsPrimary />} />
              <Route path="/academics/curriculum" element={<AcademicsCurriculum />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/career" element={<Career />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedesk" element={<FeeDesk />} />
              <Route path="/video-gallery" element={<VideoGallery />} />
              <Route path="/worksheet-maker" element={<WorksheetMaker />} />
              <Route path="/spoken-english" element={<SpokenEnglish />} />
              <Route path="/question-paper" element={<QuestionPaper />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
