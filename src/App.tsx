import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Admissions from "./pages/Admissions";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import SchoolCalendar from "./pages/SchoolCalendar";
import Facilities from "./pages/Facilities";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import Academics from "./pages/Academics";
import AcademicsNursery from "./pages/AcademicsNursery";
import AcademicsPrimary from "./pages/AcademicsPrimary";
import AcademicsCurriculum from "./pages/AcademicsCurriculum";
import FeeDesk from "./pages/FeeDesk";
import VideoGallery from "./pages/VideoGallery";
import WorksheetMaker from "./pages/WorksheetMaker";
import SpokenEnglish from "./pages/SpokenEnglish";
import QuestionPaper from "./pages/QuestionPaper";
import Layout from "./components/layout/Layout";
import useFaviconPulse from "./hooks/useFaviconPulse";
import faviconLogo from "./assets/nethaji_logo2_circle.webp";

const queryClient = new QueryClient();

const App = () => {
  useFaviconPulse(faviconLogo);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
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
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
