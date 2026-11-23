import DuotoneIcon from "@/components/common/DuotoneIcon";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Star, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { calculateTodayPanchangam, getChennaiDateParts } from "@/lib/panchangam";
import { getAcademicYearFull, getAcademicYearStartYear } from "@/lib/schoolDates";

const calendarMonths = [
  { month: "June", tamilMonth: "வைகாசி / ஆனி", events: [
    { date: "1", title: "School Reopens" }, { date: "5", title: "Orientation Day" },
    { date: "21", title: "International Yoga Day" },
  ]},
  { month: "July", tamilMonth: "ஆனி / ஆடி", events: [
    { date: "15", title: "Kamaraj Birth Anniversary (காமராஜர் பிறந்த நாள்)" },
    { date: "4", title: "Science Week Begins" }, { date: "15", title: "Parent-Teacher Meet" },
    { date: "23", title: "Bal Gangadhar Tilak Birth Anniversary" },
    { date: "28", title: "Talent Show" },
  ]},
  { month: "August", tamilMonth: "ஆடி / ஆவணி", events: [
    { date: "15", title: "Independence Day (சுதந்திர தினம்)" },
    { date: "20", title: "Inter-house Quiz" }, { date: "26", title: "Sports Week Begins" },
  ]},
  { month: "September", tamilMonth: "ஆவணி / புரட்டாசி", events: [
    { date: "5", title: "Teachers' Day (Dr. Radhakrishnan Birthday)" },
    { date: "5", title: "V.O.C. Birth Anniversary (வ.உ.சி. பிறந்த நாள்)" },
    { date: "11", title: "Bharathiar Memorial Day (பாரதியார் நினைவு நாள்)" },
    { date: "15", title: "Half-Yearly Exams Begin" },
    { date: "17", title: "Periyar Birth Anniversary (பெரியார் பிறந்த நாள்)" },
    { date: "28", title: "Results Day" },
  ]},
  { month: "October", tamilMonth: "புரட்டாசி / ஐப்பசி", events: [
    { date: "2", title: "Gandhi Jayanti (காந்தி ஜெயந்தி)" },
    { date: "10-18", title: "Dussehra / Diwali Holidays" },
    { date: "15", title: "APJ Abdul Kalam Birth Anniversary" },
    { date: "25", title: "School Resumes" },
    { date: "31", title: "Sardar Patel Birth Anniversary (ஒற்றுமை நாள்)" },
  ]},
  { month: "November", tamilMonth: "ஐப்பசி / கார்த்திகை", events: [
    { date: "5", title: "Virendranath Chattopadhyay Birth Anniversary" },
    { date: "11", title: "Maulana Azad Birth Anniversary (Education Day)" },
    { date: "14", title: "Children's Day (Nehru Jayanti)" },
    { date: "19", title: "Rani Lakshmibai Birth Anniversary" },
    { date: "18", title: "V.O.C. Memorial Day (வ.உ.சி. நினைவு நாள்)" },
    { date: "20", title: "Annual Day Rehearsals" },
  ]},
  { month: "December", tamilMonth: "கார்த்திகை / மார்கழி", events: [
    { date: "1", title: "Annual Day" },
    { date: "6", title: "Dr. B.R. Ambedkar Memorial Day (அம்பேத்கர் நினைவு நாள்)" },
    { date: "10", title: "Rajaji Birth Anniversary (ராஜாஜி பிறந்த நாள்)" },
    { date: "11", title: "Subramania Bharati Birth Anniversary" },
    { date: "15", title: "Christmas Celebrations" },
    { date: "22-31", title: "Winter Holidays" },
    { date: "24", title: "Periyar Memorial Day (பெரியார் நினைவு நாள்)" },
  ]},
  { month: "January", tamilMonth: "மார்கழி / தை", events: [
    { date: "2", title: "School Reopens" },
    { date: "12", title: "Swami Vivekananda Birthday (Youth Day)" },
    { date: "14", title: "Pongal Celebrations" },
    { date: "23", title: "Netaji Subhas Chandra Bose Birthday" },
    { date: "26", title: "Republic Day & Sports Day (குடியரசு தினம்)" },
    { date: "30", title: "Mahatma Gandhi Memorial Day (சகித தினம்)" },
  ]},
  { month: "February", tamilMonth: "தை / மாசி", events: [
    { date: "1", title: "Science Exhibition" },
    { date: "14", title: "Valentine's Week Activities" },
    { date: "20", title: "Pre-Board Exams" },
    { date: "28", title: "Rajendra Prasad Memorial Day" },
  ]},
  { month: "March", tamilMonth: "மாசி / பங்குனி", events: [
    { date: "1-15", title: "Annual Exams" },
    { date: "8", title: "International Women's Day" },
    { date: "20", title: "Results Day" },
    { date: "23", title: "Bhagat Singh, Rajguru & Sukhdev Martyrs' Day (தியாகிகள் தினம்)" },
    { date: "25", title: "Farewell Day" },
  ]},
  { month: "April", tamilMonth: "பங்குனி / சித்திரை", events: [
    { date: "1", title: "Summer Holidays Begin" },
    { date: "14", title: "Tamil New Year (புத்தாண்டு) & Dr. Ambedkar Birthday" },
  ]},
  { month: "May", tamilMonth: "சித்திரை / வைகாசி", events: [
    { date: "1", title: "May Day" },
    { date: "5", title: "Karl Marx Birthday" },
    { date: "7", title: "Rabindranath Tagore Birthday" },
    { date: "15", title: "Summer Camp (Optional)" },
    { date: "22", title: "Raja Ram Mohan Roy Birth Anniversary" },
    { date: "31", title: "Summer Holidays End" },
  ]},
];

const leaderAnniversaries = [
  { date: "Jan 12", name: "சுவாமி விவேகானந்தர் (Swami Vivekananda)", type: "பிறந்த நாள்", description: "National Youth Day — Spiritual leader & philosopher" },
  { date: "Jan 23", name: "நேதாஜி சுபாஷ் சந்திர போஸ் (Netaji Subhas Chandra Bose)", type: "பிறந்த நாள்", description: "Parakram Diwas — INA founder & freedom fighter" },
  { date: "Jan 26", name: "குடியரசு தினம் (Republic Day)", type: "தேசிய நாள்", description: "Constitution of India came into effect" },
  { date: "Jan 30", name: "மகாத்மா காந்தி (Mahatma Gandhi)", type: "நினைவு நாள்", description: "Martyrs' Day — Father of the Nation" },
  { date: "Jul 15", name: "காமராஜர் (Kamaraj)", type: "பிறந்த நாள்", description: "King maker of Indian politics — TN's beloved leader" },
  { date: "Mar 23", name: "பகத் சிங், ராஜ்குரு, சுக்தேவ் (Bhagat Singh, Rajguru, Sukhdev)", type: "தியாகிகள் தினம்", description: "Martyrs' Day — Young revolutionaries" },
  { date: "Apr 14", name: "டாக்டர் அம்பேத்கர் (Dr. B.R. Ambedkar)", type: "பிறந்த நாள்", description: "Architect of Indian Constitution" },
  { date: "May 7", name: "ரவீந்திரநாத் தாகூர் (Rabindranath Tagore)", type: "பிறந்த நாள்", description: "Nobel Laureate — National anthem composer" },
  { date: "Sep 5", name: "வ.உ.சிதம்பரனார் (V.O. Chidambaranar)", type: "பிறந்த நாள்", description: "Kappalottiya Tamilan — Maritime freedom fighter" },
  { date: "Jul 23", name: "பால கங்காதர திலகர் (Bal Gangadhar Tilak)", type: "பிறந்த நாள்", description: "'Swaraj is my birthright' — Freedom movement leader" },
  { date: "Aug 15", name: "சுதந்திர தினம் (Independence Day)", type: "தேசிய நாள்", description: "India's Independence from British rule" },
  { date: "Sep 5", name: "டாக்டர் ராதாகிருஷ்ணன் (Dr. S. Radhakrishnan)", type: "பிறந்த நாள்", description: "Teachers' Day — Philosopher & 2nd President" },
  { date: "Dec 11", name: "பாரதியார் (Mahakavi Bharathiar)", type: "பிறந்த நாள்", description: "Tamil poet, freedom fighter & social reformer" },
  { date: "Sep 17", name: "பெரியார் (Periyar E.V. Ramasamy)", type: "பிறந்த நாள்", description: "Father of Dravidian movement — Social reformer" },
  { date: "Oct 2", name: "மகாத்மா காந்தி (Mahatma Gandhi)", type: "பிறந்த நாள்", description: "Gandhi Jayanti — Father of the Nation" },
  { date: "Oct 15", name: "அப்துல் கலாம் (APJ Abdul Kalam)", type: "பிறந்த நாள்", description: "Missile Man of India — 11th President" },
  { date: "Oct 31", name: "சர்தார் படேல் (Sardar Vallabhbhai Patel)", type: "பிறந்த நாள்", description: "Rashtriya Ekta Diwas — Iron Man of India" },
  { date: "Nov 11", name: "மௌலானா அபுல் கலாம் ஆசாத் (Maulana Abul Kalam Azad)", type: "பிறந்த நாள்", description: "National Education Day — First Education Minister" },
  { date: "Nov 14", name: "ஜவஹர்லால் நேரு (Jawaharlal Nehru)", type: "பிறந்த நாள்", description: "Children's Day — First Prime Minister" },
  { date: "Nov 19", name: "ராணி லட்சுமிபாய் (Rani Lakshmibai)", type: "பிறந்த நாள்", description: "Jhansi ki Rani — Warrior queen of 1857 revolt" },
  { date: "Dec 6", name: "டாக்டர் அம்பேத்கர் (Dr. B.R. Ambedkar)", type: "நினைவு நாள்", description: "Mahaparinirvan Divas" },
  { date: "Dec 24", name: "பெரியார் (Periyar E.V. Ramasamy)", type: "நினைவு நாள்", description: "Social justice pioneer — Self-respect movement" },
];

const panchangamData = {
  tamilMonths: [
    { name: "சித்திரை (Chithirai)", english: "Apr – May", deity: "அக்னி", rashi: "மேஷம்" },
    { name: "வைகாசி (Vaikasi)", english: "May – Jun", deity: "இந்திரன்", rashi: "ரிஷபம்" },
    { name: "ஆனி (Aani)", english: "Jun – Jul", deity: "சூரியன்", rashi: "மிதுனம்" },
    { name: "ஆடி (Aadi)", english: "Jul – Aug", deity: "சந்திரன்", rashi: "கடகம்" },
    { name: "ஆவணி (Aavani)", english: "Aug – Sep", deity: "பிரம்மா", rashi: "சிம்மம்" },
    { name: "புரட்டாசி (Purattasi)", english: "Sep – Oct", deity: "விஷ்ணு", rashi: "கன்னி" },
    { name: "ஐப்பசி (Aippasi)", english: "Oct – Nov", deity: "சிவன்", rashi: "துலாம்" },
    { name: "கார்த்திகை (Karthigai)", english: "Nov – Dec", deity: "முருகன்", rashi: "விருச்சிகம்" },
    { name: "மார்கழி (Margazhi)", english: "Dec – Jan", deity: "லக்ஷ்மி", rashi: "தனுசு" },
    { name: "தை (Thai)", english: "Jan – Feb", deity: "பிரஜாபதி", rashi: "மகரம்" },
    { name: "மாசி (Maasi)", english: "Feb – Mar", deity: "துர்க்கை", rashi: "கும்பம்" },
    { name: "பங்குனி (Panguni)", english: "Mar – Apr", deity: "ஹனுமான்", rashi: "மீனம்" },
  ],
  vaaram: [
    { day: "ஞாயிறு (Sunday)", deity: "சூரியன்", color: "சிவப்பு (Red)" },
    { day: "திங்கள் (Monday)", deity: "சந்திரன்", color: "வெள்ளை (White)" },
    { day: "செவ்வாய் (Tuesday)", deity: "செவ்வாய்", color: "சிவப்பு (Red)" },
    { day: "புதன் (Wednesday)", deity: "புதன்", color: "பச்சை (Green)" },
    { day: "வியாழன் (Thursday)", deity: "குரு", color: "மஞ்சள் (Yellow)" },
    { day: "வெள்ளி (Friday)", deity: "சுக்கிரன்", color: "வெள்ளை (White)" },
    { day: "சனி (Saturday)", deity: "சனி", color: "கருப்பு (Black)" },
  ],
  tithis: [
    "பிரதமை", "த்விதீயை", "திருதீயை", "சதுர்த்தி", "பஞ்சமி",
    "ஷஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி",
    "ஏகாதசி", "த்வாதசி", "திரயோதசி", "சதுர்தசி", "பூர்ணிமை / அமாவாசை"
  ],
  nakshatras: [
    "அஸ்வினி", "பரணி", "கிருத்திகை", "ரோகிணி", "மிருகசீரிடம்",
    "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்",
    "பூரம்", "உத்திரம்", "ஹஸ்தம்", "சித்திரை", "சுவாதி",
    "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்",
    "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி",
    "உத்திரட்டாதி", "ரேவதி"
  ],
  yogams: [
    "விஷ்கம்பம்", "பிரீதி", "ஆயுஷ்மான்", "சௌபாக்யம்", "சோபனம்",
    "அதிகண்டம்", "சுகர்மா", "திருதி", "சூலம்", "கண்டம்",
    "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்",
    "சித்தி", "வியதீபாதம்", "வரியான்", "பரிகம்", "சிவம்",
    "சித்தம்", "சாத்தியம்", "சுபம்", "சுக்லம்", "பிரம்மம்",
    "ஐந்திரம்", "வைத்ருதி"
  ],
  karanams: [
    "பவம்", "பாலவம்", "கௌலவம்", "தைதுலம்", "கரம்",
    "வணிஜம்", "விஷ்டி", "சகுனி", "சதுஷ்பாதம்", "நாகம்", "கிம்ஸ்துக்னம்"
  ],
  rahuKalam: [
    { day: "ஞாயிறு", time: "4:30 PM – 6:00 PM" },
    { day: "திங்கள்", time: "7:30 AM – 9:00 AM" },
    { day: "செவ்வாய்", time: "3:00 PM – 4:30 PM" },
    { day: "புதன்", time: "12:00 PM – 1:30 PM" },
    { day: "வியாழன்", time: "1:30 PM – 3:00 PM" },
    { day: "வெள்ளி", time: "10:30 AM – 12:00 PM" },
    { day: "சனி", time: "9:00 AM – 10:30 AM" },
  ],
  importantFestivals: [
    { date: "Jan 14", name: "பொங்கல் (Pongal)", description: "Tamil Harvest Festival — 4-day celebration" },
    { date: "Apr 14", name: "தமிழ் புத்தாண்டு (Tamil New Year)", description: "Tamil New Year — Chithirai 1" },
    { date: "Jan 26", name: "குடியரசு தினம் (Republic Day)", description: "National celebration" },
    { date: "Aug 15", name: "சுதந்திர தினம் (Independence Day)", description: "National celebration" },
    { date: "Sep 5", name: "ஆசிரியர் தினம் (Teachers' Day)", description: "Honoring teachers" },
    { date: "Oct/Nov", name: "தீபாவளி (Deepavali)", description: "Festival of Lights" },
    { date: "Oct", name: "நவராத்திரி (Navaratri)", description: "9 nights of worship" },
    { date: "Nov", name: "கார்த்திகை தீபம் (Karthigai Deepam)", description: "Festival of Lamps" },
    { date: "Dec/Jan", name: "மார்கழி மாதம் (Margazhi)", description: "Month of devotion & music" },
    { date: "Mar", name: "பங்குனி உத்திரம் (Panguni Uthiram)", description: "Auspicious wedding festival" },
  ],
  ruthus: [
    { name: "சித்திரை–வைகாசி", ruthu: "வசந்த ருது (Spring)", english: "Apr–Jun" },
    { name: "ஆனி–ஆடி", ruthu: "கிரீஷ்ம ருது (Summer)", english: "Jun–Aug" },
    { name: "ஆவணி–புரட்டாசி", ruthu: "வர்ஷ ருது (Monsoon)", english: "Aug–Oct" },
    { name: "ஐப்பசி–கார்த்திகை", ruthu: "சரத் ருது (Autumn)", english: "Oct–Dec" },
    { name: "மார்கழி–தை", ruthu: "ஹேமந்த ருது (Pre-Winter)", english: "Dec–Feb" },
    { name: "மாசி–பங்குனி", ruthu: "சிசிர ருது (Winter)", english: "Feb–Apr" },
  ]
};

type TabType = "school" | "panchangam";

const SchoolCalendar = () => {
  const [activeTab, setActiveTab] = useState<TabType>("school");
  const [now, setNow] = useState(() => new Date());
  const today = useMemo(() => calculateTodayPanchangam(now), [now]);
  const current = getChennaiDateParts(now);
  const [viewMonth, setViewMonth] = useState(() => {
    const parts = getChennaiDateParts();
    return { year: parts.year, month: parts.month };
  });
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  // Follow midnight rollover only when the user is viewing the current month.
  useEffect(() => {
    setViewMonth(previous => {
      const prior = new Date(Date.UTC(current.year, current.month - 1, current.day) - 86400000);
      return previous.year === prior.getUTCFullYear() && previous.month === prior.getUTCMonth() + 1
        ? { year: current.year, month: current.month } : previous;
    });
  }, [current.year, current.month, current.day]);
  const schoolDate = new Date(current.year, current.month - 1, current.day);
  const academicYearStartYear = getAcademicYearStartYear(schoolDate);
  const monthLabel = new Date(Date.UTC(viewMonth.year, viewMonth.month - 1, 1)).toLocaleDateString("en-IN", { timeZone: "UTC", month: "long", year: "numeric" });
  const firstWeekday = new Date(Date.UTC(viewMonth.year, viewMonth.month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(viewMonth.year, viewMonth.month, 0)).getUTCDate();
  const shiftMonth = (amount: number) => {
    const date = new Date(Date.UTC(viewMonth.year, viewMonth.month - 1 + amount, 1));
    setViewMonth({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
  };

  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">School Calendar & Tamil Panchangam</h1>
          <p className="text-lg text-primary-foreground/80">Academic Year {getAcademicYearFull(schoolDate)} | கலி யுகம் {today.kaliYear} {today.tamilYear.split(" (")[0]} ஆண்டு</p>
        </div>
      </section>

      <div className="bg-card border-b py-4">
        <div className="container-custom flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-center">
          <p className="font-semibold text-foreground">{today.date}</p>
          <p className="text-primary">{today.tamilMonth} {today.tamilDate} · {today.tamilYear}</p>
          <p className="font-semibold text-primary">கலி யுகம் (Kaliyugam) {today.kaliYear}</p>
          <span className="text-xs text-muted-foreground">Chennai · IST</span>
        </div>
      </div>
      {/* Tab Switcher */}
      <div className="bg-muted border-b">
        <div className="container-custom flex gap-1 py-2">
          <Button variant="ghost"
            onClick={() => setActiveTab("school")}
            className={`h-auto whitespace-normal px-3 sm:px-6 py-3 rounded-t-lg font-semibold text-sm transition-colors ${activeTab === "school" ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Calendar className="inline-block w-4 h-4 mr-2" />
            School Calendar
          </Button>
          <Button variant="ghost"
            onClick={() => setActiveTab("panchangam")}
            className={`h-auto whitespace-normal px-3 sm:px-6 py-3 rounded-t-lg font-semibold text-sm transition-colors ${activeTab === "panchangam" ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Star className="inline-block w-4 h-4 mr-2" />
            தமிழ் பஞ்சாங்கம் (Panchangam)
          </Button>
        </div>
      </div>

      {activeTab === "school" && (
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="mb-10 mx-auto max-w-3xl">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="font-serif text-2xl font-bold text-foreground">{monthLabel}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft /></Button>
                  <Button variant="outline" onClick={() => setViewMonth({ year: current.year, month: current.month })}>Today</Button>
                  <Button variant="outline" size="icon" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-t border-l border-border" role="grid" aria-label={monthLabel}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} role="columnheader" className="text-center text-xs sm:text-sm font-semibold bg-muted text-muted-foreground py-3 border-r border-b border-border">{day}</div>)}
                {Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, i) => {
                  const day = i - firstWeekday + 1;
                  const valid = day >= 1 && day <= daysInMonth;
                  const isToday = valid && day === current.day && viewMonth.month === current.month && viewMonth.year === current.year;
                  return <div key={i} role="gridcell" aria-current={isToday ? "date" : undefined} aria-label={valid ? `${day} ${monthLabel}${isToday ? ", Today" : ""}` : undefined} className={`min-h-12 sm:min-h-16 flex flex-col items-center justify-center border-r border-b border-border ${isToday ? "bg-primary text-primary-foreground font-bold" : "bg-card text-foreground"}`}>
                    {valid ? day : ""}{isToday && <span className="text-[10px] sm:text-xs">Today</span>}
                  </div>;
                })}
              </div>
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Academic Year {getAcademicYearFull(schoolDate)}</h2>
            <p className="text-sm text-muted-foreground mb-6">School event and holiday dates are provisional; please confirm with the school.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendarMonths.map((monthData, idx) => (
                <div key={idx} className="bg-card rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="bg-accent text-accent-foreground px-6 py-4">
                    <h3 className="font-serif text-xl font-bold">{monthData.month} {academicYearStartYear + (idx >= 7 ? 1 : 0)}</h3>
                    <p className="text-xs opacity-75 mt-1">{monthData.tamilMonth}</p>
                  </div>
                  <div className="p-6 space-y-3">
                    {monthData.events.map((event, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded min-w-[40px] text-center flex-shrink-0">
                          {event.date}
                        </span>
                        <p className="text-sm text-foreground font-medium">{event.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "panchangam" && (
        <section className="section-padding bg-background">
          <div className="container-custom space-y-10">

            {/* Today's Panchangam Card */}
            <div className="bg-card rounded-2xl shadow-lg border overflow-hidden">
              <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
                <Sun className="w-6 h-6" />
                <div>
                  <h2 className="font-serif text-xl font-bold">இன்றைய பஞ்சாங்கம் — Today's Panchangam</h2>
                  <p className="text-sm opacity-80">{today.date} · Chennai · IST</p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">வாரம் (Day)</p>
                  <p className="text-sm font-bold text-foreground">{today.tamilDay}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">தமிழ் மாதம்</p>
                  <p className="text-sm font-bold text-foreground">{today.tamilMonth} {today.tamilDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">பக்ஷம் (Paksham)</p>
                  <p className="text-sm font-bold text-foreground">{today.paksham}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">திதி (Tithi)</p>
                  <p className="text-sm font-bold text-primary">{today.tithi}</p>
                  <p className="text-xs text-muted-foreground">Until {today.tithiUntil}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">நட்சத்திரம் (Nakshatra)</p>
                  <p className="text-sm font-bold text-primary">{today.nakshatra}</p>
                  <p className="text-xs text-muted-foreground">Until {today.nakshatraUntil}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">யோகம் (Yogam)</p>
                  <p className="text-sm font-bold text-foreground">{today.yogam}</p>
                  <p className="text-xs text-muted-foreground">Until {today.yogamUntil}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">கரணம் (Karanam)</p>
                  <p className="text-sm font-bold text-foreground">{today.karanam}</p>
                  <p className="text-xs text-muted-foreground">Until {today.karanamUntil}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">ராகு காலம்</p>
                  <p className="text-sm font-bold text-destructive">{today.rahuKalam}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">சூரிய உதயம்</p>
                  <p className="text-sm font-bold text-foreground">{today.sunrise}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">சூரிய அஸ்தமனம்</p>
                  <p className="text-sm font-bold text-foreground">{today.sunset}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">நிறம் (Color)</p>
                  <p className="text-sm font-bold text-foreground">{today.tamilDayColor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">தெய்வம் (Deity)</p>
                  <p className="text-sm font-bold text-foreground">{today.tamilDayDeity}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Chennai · All times in IST · Thirukanitham / Lahiri astronomical calculation. Almanac conventions may differ slightly.</p>

            {/* Kali Yugam & Year Info */}
            <div className="bg-gradient-to-br from-accent/30 to-primary/10 rounded-2xl p-8 text-center border">
              <DuotoneIcon icon={Sun} tone="teal" size="lg" className="mx-auto mb-4" />
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">கலி யுகம் {today.kaliYear}</h2>
              <p className="text-lg text-foreground/80 mb-1">தமிழ் ஆண்டு: <strong>{today.tamilYear}</strong></p>
              <p className="text-sm text-muted-foreground">{today.ayanam}</p>
            </div>

            {/* Tamil Months */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <DuotoneIcon icon={Moon} tone="indigo" size="xs" /> தமிழ் மாதங்கள் (Tamil Months)
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {panchangamData.tamilMonths.map((m, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 shadow border hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-foreground text-lg">{m.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{m.english}</p>
                    <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                      <span>தெய்வம்: {m.deity}</span>
                      <span>ராசி: {m.rashi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ruthus */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <DuotoneIcon icon={Sun} tone="orange" size="xs" /> ருதுக்கள் (Seasons)
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {panchangamData.ruthus.map((r, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 shadow border">
                    <h3 className="font-bold text-foreground">{r.ruthu}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.name} | {r.english}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vaaram */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <DuotoneIcon icon={Calendar} tone="rose" size="xs" /> வாரம் (Days of the Week)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-xl overflow-hidden">
                  <thead className="bg-accent text-accent-foreground">
                    <tr><th className="px-4 py-3 text-left">நாள்</th><th className="px-4 py-3 text-left">தெய்வம்</th><th className="px-4 py-3 text-left">நிறம்</th></tr>
                  </thead>
                  <tbody>
                    {panchangamData.vaaram.map((v, i) => (
                      <tr key={i} className="border-b last:border-0 bg-card">
                        <td className="px-4 py-3 font-medium text-foreground">{v.day}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.deity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rahu Kalam */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <DuotoneIcon icon={Clock} tone="sky" size="xs" /> ராகு காலம் (Rahu Kalam — traditional 6 AM–6 PM reference)
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {panchangamData.rahuKalam.map((r, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 shadow border text-center">
                    <p className="font-bold text-foreground">{r.day}</p>
                    <p className="text-sm text-primary font-semibold mt-1">{r.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tithis */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">திதிகள் (Tithis — Lunar Days)</h2>
              <div className="flex flex-wrap gap-2">
                {panchangamData.tithis.map((t, i) => (
                  <span key={i} className="bg-accent text-accent-foreground px-3 py-2 rounded-full text-sm font-medium">{i + 1}. {t}</span>
                ))}
              </div>
            </div>

            {/* Nakshatras */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <DuotoneIcon icon={Star} tone="violet" size="xs" /> நட்சத்திரங்கள் (27 Nakshatras)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {panchangamData.nakshatras.map((n, i) => (
                  <div key={i} className="bg-card rounded-lg px-4 py-3 shadow border text-center">
                    <span className="text-xs text-primary font-bold">{i + 1}</span>
                    <p className="text-sm font-medium text-foreground">{n}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Yogams */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">யோகங்கள் (27 Yogams)</h2>
              <div className="flex flex-wrap gap-2">
                {panchangamData.yogams.map((y, i) => (
                  <span key={i} className="bg-muted text-foreground px-3 py-2 rounded-full text-sm">{i + 1}. {y}</span>
                ))}
              </div>
            </div>

            {/* Karanams */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">கரணங்கள் (Karanams)</h2>
              <div className="flex flex-wrap gap-2">
                {panchangamData.karanams.map((k, i) => (
                  <span key={i} className="bg-accent/50 text-foreground px-3 py-2 rounded-full text-sm">{i + 1}. {k}</span>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

    </>
  );
};

export default SchoolCalendar;
