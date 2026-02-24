import jsPDF from "jspdf";

// ─── Color Palette ───
const NAVY = [30, 58, 95] as const;     // #1e3a5f
const ORANGE = [255, 107, 53] as const;  // #FF6B35
const WHITE = [255, 255, 255] as const;
const GOLD = [212, 168, 67] as const;
const LIGHT_BLUE = [235, 245, 255] as const;
const LIGHT_ORANGE = [255, 247, 237] as const;
const LIGHT_GREEN = [220, 252, 231] as const;
const LIGHT_PURPLE = [237, 233, 254] as const;
const LIGHT_ROSE = [255, 228, 230] as const;
const LIGHT_YELLOW = [254, 243, 199] as const;
const DARK_TEXT = [30, 41, 59] as const;
const MUTED = [71, 85, 105] as const;
const TEAL = [13, 148, 136] as const;
const ROSE = [225, 29, 72] as const;
const EMERALD = [5, 150, 105] as const;
const VIOLET = [124, 58, 237] as const;

type RGB = readonly [number, number, number];

// ─── Helpers ───
function setColor(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]); }
function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }

const PW = 210; // A4 width mm
const PH = 297; // A4 height mm
const M = 18;   // margin
const CW = PW - M * 2; // content width

function drawPageBorder(doc: jsPDF) {
  setDraw(doc, NAVY);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, PW - 16, PH - 16);
  setDraw(doc, ORANGE);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, PW - 20, PH - 20);
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  setFill(doc, NAVY);
  doc.rect(0, PH - 14, PW, 14, "F");
  doc.setFontSize(8);
  setColor(doc, WHITE);
  doc.text("Nethaji Vidhyalayam — Nurturing Tomorrow's Leaders", PW / 2, PH - 6, { align: "center" });
  setColor(doc, GOLD);
  doc.text(`Page ${pageNum} of ${totalPages}`, PW - 15, PH - 6, { align: "right" });
}

function drawAccentBar(doc: jsPDF, y: number) {
  setFill(doc, ORANGE);
  doc.rect(0, y, PW, 3, "F");
}

function drawSectionHeader(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  // Orange left accent
  setFill(doc, ORANGE);
  doc.rect(M, y, 3, 10, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text(title, M + 8, y + 8);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    setColor(doc, MUTED);
    doc.text(subtitle, M + 8, y + 15);
    return y + 22;
  }
  return y + 16;
}

function wrapText(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW);
}

function drawWrapped(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH = 5): number {
  const lines = wrapText(doc, text, maxW);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

function drawColorCard(doc: jsPDF, x: number, y: number, w: number, h: number, bg: RGB, title: string, titleColor: RGB, body: string) {
  setFill(doc, bg);
  doc.roundedRect(x, y, w, h, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, titleColor);
  doc.text(title, x + w / 2, y + 10, { align: "center" });
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, MUTED);
  const lines = wrapText(doc, body, w - 8);
  let cy = y + 17;
  for (const line of lines) {
    doc.text(line, x + w / 2, cy, { align: "center" });
    cy += 4;
  }
}

function drawBullet(doc: jsPDF, x: number, y: number, text: string, maxW: number, bulletColor: RGB = ORANGE): number {
  setFill(doc, bulletColor);
  doc.circle(x + 2, y - 1.2, 1.5, "F");
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  return drawWrapped(doc, text, x + 7, y, maxW - 7, 4.5);
}

function drawQuote(doc: jsPDF, y: number, quote: string, author: string): number {
  setFill(doc, LIGHT_BLUE);
  doc.roundedRect(M + 5, y, CW - 10, 22, 3, 3, "F");
  setFill(doc, ORANGE);
  doc.rect(M + 5, y, 3, 22, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bolditalic");
  setColor(doc, NAVY);
  doc.text(`"${quote}"`, M + 14, y + 9);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  setColor(doc, MUTED);
  doc.text(`— ${author}`, M + 14, y + 17);
  return y + 28;
}

// ─── LOGO LOADER ───
async function loadLogoBase64(): Promise<string> {
  const resp = await fetch("/nethaji_logo_print.webp");
  const blob = await resp.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// ─── MAIN GENERATOR ───
export async function generateProspectusPDF() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const TOTAL_PAGES = 12;
  let logoData: string;
  try {
    logoData = await loadLogoBase64();
  } catch {
    logoData = "";
  }

  // ═══════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════
  // Full navy background
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, PH, "F");

  // Decorative corners
  setFill(doc, ORANGE);
  doc.triangle(0, 0, 40, 0, 0, 40, "F");
  doc.triangle(PW, PH, PW - 40, PH, PW, PH - 40, "F");
  setFill(doc, [212, 168, 67]);
  doc.triangle(PW, 0, PW - 30, 0, PW, 30, "F");
  doc.triangle(0, PH, 30, PH, 0, PH - 30, "F");

  // Logo centered large
  if (logoData) {
    try { doc.addImage(logoData, "WEBP", PW / 2 - 30, 35, 60, 60); } catch { /* skip */ }
  }

  // School name
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  setColor(doc, WHITE);
  doc.text("NETHAJI", PW / 2, 115, { align: "center" });
  doc.text("VIDHYALAYAM", PW / 2, 130, { align: "center" });

  // Divider
  setFill(doc, ORANGE);
  doc.rect(PW / 2 - 30, 137, 60, 2, "F");

  // Tagline
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  setColor(doc, GOLD);
  doc.text("✦  Nurturing Tomorrow's Leaders  ✦", PW / 2, 150, { align: "center" });

  // Subtitle
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  setColor(doc, ORANGE);
  doc.text("SCHOOL PROSPECTUS", PW / 2, 175, { align: "center" });
  doc.setFontSize(12);
  setColor(doc, WHITE);
  doc.text("Academic Year 2025–26", PW / 2, 185, { align: "center" });

  // Feature boxes on cover
  const coverFeatures = [
    { emoji: "📚", label: "Pre-KG to Grade 5" },
    { emoji: "🏫", label: "Est. 2002" },
    { emoji: "🎯", label: "Holistic Education" },
    { emoji: "🌟", label: "Value-Based Learning" },
  ];
  const cfW = 38;
  const cfStart = (PW - (cfW * 4 + 12)) / 2;
  coverFeatures.forEach((f, i) => {
    const fx = cfStart + i * (cfW + 4);
    setFill(doc, [40, 70, 110]);
    doc.roundedRect(fx, 200, cfW, 30, 3, 3, "F");
    doc.setFontSize(16);
    setColor(doc, WHITE);
    doc.text(f.emoji, fx + cfW / 2, 213, { align: "center" });
    doc.setFontSize(7.5);
    setColor(doc, GOLD);
    doc.text(f.label, fx + cfW / 2, 223, { align: "center" });
  });

  // Bottom contact
  doc.setFontSize(10);
  setColor(doc, WHITE);
  doc.text("5/325, Rajiv Nagar, S.Kolathur Main Road, Chennai – 600129", PW / 2, 255, { align: "center" });
  doc.setFontSize(9);
  setColor(doc, GOLD);
  doc.text("📞 9841594945 / 6380967675  |  ✉ info@nethajividhyalayam.org", PW / 2, 263, { align: "center" });

  // ═══════════════════════════════════════
  // PAGE 2 — CHAIRMAN'S MESSAGE
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  let y = 20;
  y = drawSectionHeader(doc, y, "Chairman's Message", "From the Desk of Mr. J.J. Nareshkumar");
  y += 4;

  if (logoData) {
    try { doc.addImage(logoData, "WEBP", PW / 2 - 12, y, 24, 24); } catch { /* skip */ }
  }
  y += 30;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);

  const chairmanMsg = [
    "Dear Parents and Well-wishers,",
    "",
    "It gives me immense pleasure to welcome you to Nethaji Vidhyalayam. Since our founding on 11th June 2002, we have been committed to providing an educational environment that nurtures not just academic excellence, but also the moral, social, and emotional growth of every child.",
    "",
    "At Nethaji Vidhyalayam, we believe that every child is a unique individual with boundless potential. Our dedicated team of educators works tirelessly to create a learning atmosphere that inspires curiosity, fosters creativity, and builds strong character.",
    "",
    "We are proud of our state-of-the-art facilities, innovative teaching methodologies, and a curriculum that seamlessly blends traditional values with modern education. Our school is not just a place of learning — it is a second home where children feel safe, valued, and empowered.",
    "",
    "I invite you to explore this prospectus and discover why Nethaji Vidhyalayam is the ideal choice for your child's educational journey.",
    "",
    "With warm regards,",
    "Mr. J.J. Nareshkumar",
    "Chairman, Nethaji Vidhyalayam"
  ];

  for (const para of chairmanMsg) {
    if (para === "") { y += 3; continue; }
    y = drawWrapped(doc, para, M, y, CW, 5);
    y += 1;
  }
  y += 6;
  y = drawQuote(doc, y, "Education is the most powerful weapon which you can use to change the world.", "Nelson Mandela");
  drawFooter(doc, 2, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 3 — ABOUT & VISION
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "About Our School", "A Legacy of Excellence Since 2002");
  y += 2;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "Nethaji Vidhyalayam, established in 2002, stands as a beacon of quality education in Chennai. Located in the heart of S.Kolathur, our institution has consistently delivered academic excellence while nurturing well-rounded individuals who contribute meaningfully to society.", M, y, CW, 5);
  y += 4;
  y = drawWrapped(doc, "Our school is named after the great freedom fighter Nethaji Subhas Chandra Bose, embodying his spirit of courage, determination, and selfless service. We strive to instil these same values in our students.", M, y, CW, 5);
  y += 8;

  // Vision & Mission cards
  drawColorCard(doc, M, y, CW / 2 - 3, 42, LIGHT_BLUE, "🎯 Our Vision", NAVY,
    "To be a centre of educational excellence that inspires lifelong learning, innovation, and responsible global citizenship.");
  drawColorCard(doc, M + CW / 2 + 3, y, CW / 2 - 3, 42, LIGHT_ORANGE, "🚀 Our Mission", ORANGE,
    "Empower students with knowledge, skills, and values to become confident, compassionate, and capable leaders of tomorrow.");
  y += 50;

  // Core Values
  y = drawSectionHeader(doc, y, "Our Core Values");
  y += 2;
  const coreValues = [
    { color: TEAL, label: "Excellence", desc: "Striving for the highest standards in everything we do" },
    { color: ROSE, label: "Integrity", desc: "Building character through honesty, respect, and responsibility" },
    { color: EMERALD, label: "Innovation", desc: "Embracing modern methods and creative problem-solving" },
    { color: VIOLET, label: "Compassion", desc: "Fostering empathy, kindness, and social awareness" },
    { color: ORANGE, label: "Discipline", desc: "Cultivating self-discipline and time management" },
    { color: NAVY, label: "Unity", desc: "Celebrating diversity and building a strong community" },
  ];
  const cvW = (CW - 8) / 3;
  coreValues.forEach((v, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const cx = M + col * (cvW + 4);
    const cy = y + row * 28;
    const bgs: RGB[] = [LIGHT_GREEN, LIGHT_ROSE, LIGHT_BLUE, LIGHT_PURPLE, LIGHT_ORANGE, LIGHT_YELLOW];
    drawColorCard(doc, cx, cy, cvW, 24, bgs[i], v.label, v.color, v.desc);
  });
  y += 64;

  y = drawQuote(doc, y, "The function of education is to teach one to think intensively and to think critically.", "Martin Luther King Jr.");
  drawFooter(doc, 3, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 4 — FOUNDATIONAL & PREPARATORY
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Academic Programme", "Foundational & Preparatory Stages");
  y += 2;

  // Foundational Stage
  setFill(doc, LIGHT_YELLOW);
  doc.roundedRect(M, y, CW, 6, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, [146, 64, 14]);
  doc.text("🌱 Foundational Stage — Pre-KG (Play-Based Learning)", M + 4, y + 4.5);
  y += 10;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "Our Pre-KG programme focuses on experiential, play-based learning that develops curiosity and foundational skills in a nurturing environment.", M, y, CW, 4.5);
  y += 3;

  const foundSubjects = [
    "Language Development: Listening skills, action songs, rhymes, vocabulary building",
    "Number Concepts: Number recognition, counting 1–10, shapes and patterns",
    "Environmental Awareness: Self, family, colours, fruits, animals, seasons",
    "Motor Skills: Scribbling, finger movements, bead threading, clay modelling",
    "Creative Arts: Colouring, tearing & pasting, free art expression",
    "Physical Activities: Free play, music & movement, outdoor games",
    "Social Skills: Sharing, following instructions, group activities",
  ];
  for (const s of foundSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, [146, 64, 14]); y += 1; }
  y += 6;

  // Preparatory Stage
  setFill(doc, LIGHT_BLUE);
  doc.roundedRect(M, y, CW, 6, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text("📖 Preparatory Stage — LKG (Discovery Learning)", M + 4, y + 4.5);
  y += 10;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "The LKG programme builds on foundational skills with structured learning across core subjects while maintaining the joy of discovery.", M, y, CW, 4.5);
  y += 3;

  const prepSubjects = [
    "English: Phonics blending, simple sentences, picture reading, basic writing",
    "Tamil: Vowels (உயிர் எழுத்து), consonants (மெய் எழுத்து), simple words",
    "Mathematics: Numbers 1–50, shapes, patterns, addition concept",
    "EVS: My body, seasons, plants, transport, community helpers",
    "Art & Craft: Craft activities, drawing, colouring, paper folding",
    "Physical Education: Group games, exercises, yoga for kids",
    "Value Education: Respect, honesty, caring for others",
  ];
  for (const s of prepSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, NAVY); y += 1; }
  y += 4;

  y = drawQuote(doc, y, "Play is the highest form of research.", "Albert Einstein");
  drawFooter(doc, 4, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 5 — MIDDLE & SECONDARY STAGES
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Academic Programme", "Middle & Secondary Stages");
  y += 2;

  // Middle Stage
  setFill(doc, LIGHT_GREEN);
  doc.roundedRect(M, y, CW, 6, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, [22, 101, 52]);
  doc.text("🔬 Middle Stage — UKG (Critical Thinking & Projects)", M + 4, y + 4.5);
  y += 10;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "UKG students engage in deeper subject exploration with emphasis on critical thinking, creativity, and collaborative project work.", M, y, CW, 4.5);
  y += 3;

  const midSubjects = [
    "English: Reading passages, comprehension, creative writing, grammar basics",
    "Tamil: Uyir-mei letters, simple words, sentences, short stories",
    "Mathematics: Numbers up to 100, addition & subtraction with carry, multiplication tables 1–5",
    "Science: Living vs non-living, plants & animals, our environment",
    "Social Studies: Our school, neighbourhood, festivals, maps introduction",
    "Art & Craft: Project-based art, model-making, display work",
    "Computer Science: Introduction to computers, keyboard & mouse, basic software",
  ];
  for (const s of midSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, EMERALD); y += 1; }
  y += 6;

  // Secondary Stage
  setFill(doc, LIGHT_PURPLE);
  doc.roundedRect(M, y, CW, 6, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, [91, 33, 182]);
  doc.text("🎓 Secondary Stage — Grades 1 to 5 (Holistic Growth)", M + 4, y + 4.5);
  y += 10;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "Our primary programme delivers comprehensive academic rigour alongside life skills, creative expression, and physical development.", M, y, CW, 4.5);
  y += 3;

  const secSubjects = [
    "English: Grammar, comprehension, creative writing, literature reading, vocabulary",
    "Tamil: Prose, poetry, grammar, composition and language enrichment",
    "Mathematics: Number operations, fractions, decimals, geometry, data handling",
    "Science: Living things, matter, force & energy, Earth and environment, experiments",
    "Social Studies: History, civics, geography, map skills, cultural heritage",
    "Computer Science: MS Office basics, internet safety, programming logic",
    "Physical Education: Outdoor sports, yoga, health & hygiene, team activities",
    "Art & Music: Creative arts, visual expression, Indian classical music basics",
  ];
  for (const s of secSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, VIOLET); y += 1; }

  drawFooter(doc, 5, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 6 — TEACHING METHODOLOGY
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Our Teaching Methodology", "Innovative Approaches to Learning");
  y += 4;

  const methods = [
    { title: "🎮 Activity-Based Learning", desc: "Hands-on experiments, role-plays, and real-world problem solving make learning engaging and memorable. Children learn by doing, not just listening.", bg: LIGHT_YELLOW, c: [146, 64, 14] as RGB },
    { title: "🧠 Inquiry-Based Approach", desc: "We encourage students to ask questions, investigate, and discover answers independently. This builds critical thinking and scientific temperament.", bg: LIGHT_BLUE, c: NAVY },
    { title: "🤝 Collaborative Learning", desc: "Group projects, peer teaching, and team activities develop communication skills, leadership, and the ability to work effectively with others.", bg: LIGHT_GREEN, c: EMERALD },
    { title: "💻 Technology-Enhanced Learning", desc: "Smart boards, digital content, and computer labs integrate technology seamlessly into the learning process for a future-ready education.", bg: LIGHT_PURPLE, c: VIOLET },
    { title: "🎨 Creative Expression", desc: "Art, music, dance, and drama provide outlets for self-expression and develop aesthetic sensibility and emotional intelligence.", bg: LIGHT_ROSE, c: ROSE },
    { title: "📊 Continuous Assessment", desc: "Regular formative assessments, portfolios, and feedback ensure every child's progress is monitored and supported consistently.", bg: LIGHT_ORANGE, c: ORANGE },
  ];

  const mW = (CW - 6) / 2;
  methods.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = M + col * (mW + 6);
    const my = y + row * 38;
    drawColorCard(doc, mx, my, mW, 34, m.bg, m.title, m.c, m.desc);
  });
  y += 120;

  y = drawQuote(doc, y, "Tell me and I forget. Teach me and I remember. Involve me and I learn.", "Benjamin Franklin");
  y += 4;
  y = drawQuote(doc, y, "Every child is an artist. The problem is how to remain an artist once we grow up.", "Pablo Picasso");

  drawFooter(doc, 6, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 7 — FACILITIES
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "World-Class Facilities", "Infrastructure Designed for Excellence");
  y += 4;

  const facilities = [
    { icon: "🏫", title: "Smart Classrooms", desc: "Interactive digital boards, projectors, and audio-visual aids create an immersive learning environment that makes complex concepts easy to understand.", bg: LIGHT_BLUE },
    { icon: "📚", title: "Library & Reading Room", desc: "A well-stocked library with thousands of books in Tamil and English, reference materials, periodicals, and a dedicated reading corner for quiet study.", bg: LIGHT_GREEN },
    { icon: "🔬", title: "Science Laboratory", desc: "Fully equipped science lab where students conduct experiments, explore scientific concepts hands-on, and develop a passion for discovery.", bg: LIGHT_YELLOW },
    { icon: "💻", title: "Computer Lab", desc: "Modern computer laboratory with internet connectivity, educational software, and age-appropriate programming tools for digital literacy.", bg: LIGHT_PURPLE },
    { icon: "🏟️", title: "Sports Complex", desc: "Spacious playground with facilities for cricket, football, athletics, and indoor games. Regular sports coaching and inter-school competitions.", bg: LIGHT_ROSE },
    { icon: "🚌", title: "Safe Transport", desc: "GPS-tracked school buses covering major routes across Chennai with trained drivers, attendants, and strict safety protocols.", bg: LIGHT_ORANGE },
    { icon: "🎨", title: "Art & Music Room", desc: "Dedicated spaces for visual arts, music practice, and dance with professional instruments and art supplies for creative expression.", bg: LIGHT_BLUE },
    { icon: "🏥", title: "Health & Safety", desc: "On-campus first aid facility, regular health check-ups, CCTV surveillance throughout campus, and fire safety equipment for complete safety.", bg: LIGHT_GREEN },
  ];

  const fW = (CW - 6) / 2;
  facilities.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = M + col * (fW + 6);
    const fy = y + row * 30;
    drawColorCard(doc, fx, fy, fW, 27, f.bg, `${f.icon} ${f.title}`, NAVY, f.desc);
  });

  drawFooter(doc, 7, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 8 — CO-CURRICULAR & ACTIVITIES
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Co-Curricular Activities", "Beyond the Classroom");
  y += 2;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "At Nethaji Vidhyalayam, we believe that true education extends far beyond textbooks. Our rich co-curricular programme helps students discover their talents, build confidence, and develop skills for life.", M, y, CW, 5);
  y += 6;

  const activities = [
    { cat: "🎨 Arts & Culture", items: ["Drawing and painting competitions", "Craft workshops and exhibitions", "Cultural programme performances", "Traditional dance (Bharatanatyam)", "Music and choir practice"] },
    { cat: "🏅 Sports & Fitness", items: ["Annual Sports Day celebrations", "Yoga and meditation sessions", "Karate and self-defense training", "Cricket, football, and athletics", "Indoor games and chess club"] },
    { cat: "🗣️ Language & Communication", items: ["Spoken English programme", "Tamil literary club", "Elocution and debate competitions", "Story-telling and drama", "Creative writing workshops"] },
    { cat: "🔬 STEM & Innovation", items: ["Science exhibitions and model-making", "Mathematics olympiad preparation", "Basic robotics and coding", "Nature study and eco-club", "Educational field trips"] },
  ];

  const aW = (CW - 6) / 2;
  activities.forEach((act, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = M + col * (aW + 6);
    const ay = y + row * 56;
    const bgs: RGB[] = [LIGHT_ORANGE, LIGHT_GREEN, LIGHT_PURPLE, LIGHT_ROSE];
    const colors: RGB[] = [ORANGE, EMERALD, VIOLET, ROSE];
    setFill(doc, bgs[i]);
    doc.roundedRect(ax, ay, aW, 52, 3, 3, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    setColor(doc, colors[i]);
    doc.text(act.cat, ax + aW / 2, ay + 9, { align: "center" });
    let by = ay + 16;
    for (const item of act.items) {
      by = drawBullet(doc, ax + 4, by, item, aW - 10, colors[i]);
      by += 1;
    }
  });
  y += 120;

  y = drawQuote(doc, y, "Education is not preparation for life; education is life itself.", "John Dewey");
  drawFooter(doc, 8, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 9 — ASSESSMENT & ACHIEVEMENTS
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Assessment Framework", "Continuous Evaluation for Holistic Growth");
  y += 4;

  // Assessment split
  drawColorCard(doc, M, y, CW / 2 - 3, 35, LIGHT_ORANGE, "40% — Formative", ORANGE,
    "Quizzes, projects, class participation, assignments, portfolios, and observations throughout the term.");
  drawColorCard(doc, M + CW / 2 + 3, y, CW / 2 - 3, 35, LIGHT_BLUE, "60% — Summative", NAVY,
    "Mid-term examinations and final assessments with comprehensive evaluation across all subjects.");
  y += 42;

  y = drawSectionHeader(doc, y, "Key Assessment Features");
  y += 2;
  const assessFeatures = [
    "Activity-based and experiential learning assessments",
    "Regular worksheets, projects, and hands-on evaluations",
    "Periodic progress reports shared with parents",
    "Continuous observation and constructive feedback",
    "Parent-teacher meetings for collaborative growth planning",
    "Portfolio-based assessment for creative subjects",
  ];
  for (const f of assessFeatures) { y = drawBullet(doc, M + 2, y, f, CW - 4); y += 1.5; }
  y += 6;

  // Achievements
  y = drawSectionHeader(doc, y, "Our Achievements & Milestones");
  y += 2;
  const achievements = [
    "22+ years of educational excellence serving the Chennai community",
    "Consistently high academic performance across all standards",
    "Award-winning students in inter-school competitions — academics, sports, and arts",
    "Successful alumni pursuing higher education in top institutions",
    "Recognition for innovative teaching methodologies",
    "Strong parent-teacher-student community bond",
    "Active participation in national events — Independence Day, Republic Day, Children's Day",
    "Regular community outreach and social service initiatives",
  ];
  for (const a of achievements) { y = drawBullet(doc, M + 2, y, a, CW - 4, EMERALD); y += 1.5; }

  drawFooter(doc, 9, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 10 — SPOKEN ENGLISH & SPECIAL PROGRAMMES
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Special Programmes", "Unique Offerings That Set Us Apart");
  y += 4;

  const specials = [
    { title: "🗣️ Spoken English Programme", desc: "Comprehensive English fluency programme with interactive sessions, pronunciation practice, vocabulary building, role-plays, and confidence-building exercises. Students develop communication skills essential for the modern world.", bg: LIGHT_BLUE, c: NAVY },
    { title: "🧘 Yoga & Wellness", desc: "Regular yoga sessions, meditation practice, and wellness education help students maintain physical fitness, mental clarity, and emotional balance. International Yoga Day celebrations are a highlight.", bg: LIGHT_GREEN, c: EMERALD },
    { title: "💡 Life Skills Education", desc: "Structured programme covering critical thinking, decision-making, time management, financial literacy basics, and interpersonal skills that prepare students for real-world challenges.", bg: LIGHT_PURPLE, c: VIOLET },
    { title: "🌍 Environmental Awareness", desc: "Eco-club activities, tree planting drives, waste management awareness, and nature study excursions build environmental consciousness and responsibility in students.", bg: LIGHT_YELLOW, c: [146, 64, 14] as RGB },
    { title: "📱 Digital Literacy", desc: "Age-appropriate introduction to technology, internet safety, basic programming concepts, and responsible digital citizenship prepare students for the digital age.", bg: LIGHT_ROSE, c: ROSE },
    { title: "🎭 Cultural Heritage Programme", desc: "Tamil culture appreciation, festival celebrations, traditional art forms, and heritage awareness activities connect students with their rich cultural roots.", bg: LIGHT_ORANGE, c: ORANGE },
  ];

  const sW = (CW - 6) / 2;
  specials.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = M + col * (sW + 6);
    const sy = y + row * 36;
    drawColorCard(doc, sx, sy, sW, 33, s.bg, s.title, s.c, s.desc);
  });
  y += 114;

  y = drawQuote(doc, y, "The beautiful thing about learning is that no one can take it away from you.", "B.B. King");
  drawFooter(doc, 10, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 11 — ADMISSIONS
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;
  y = drawSectionHeader(doc, y, "Admissions — 2025–26", "Join the Nethaji Vidhyalayam Family");
  y += 4;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "We warmly welcome applications for Pre-KG through Grade 5. Our admission process is designed to be simple, transparent, and parent-friendly. We believe every child deserves quality education, and we are committed to making the admission journey smooth for families.", M, y, CW, 5);
  y += 6;

  // Admission process
  y = drawSectionHeader(doc, y, "Admission Process");
  y += 2;
  const steps = [
    "Step 1: Visit our campus or contact us for an initial enquiry and school tour",
    "Step 2: Collect and fill the admission application form (also available online)",
    "Step 3: Submit the form with required documents at the school office",
    "Step 4: Interactive session / observation for the child (age-appropriate)",
    "Step 5: Confirmation of admission and fee payment",
    "Step 6: Orientation programme for parents and students",
  ];
  for (const s of steps) { y = drawBullet(doc, M + 2, y, s, CW - 4, TEAL); y += 2; }
  y += 4;

  // Documents
  y = drawSectionHeader(doc, y, "Documents Required");
  y += 2;
  const docs = [
    "Birth Certificate (original + photocopy)",
    "Aadhaar Card of the child and parents",
    "4 recent passport-size photographs of the child",
    "Transfer Certificate from previous school (if applicable)",
    "Report card / progress report from previous school (if applicable)",
    "Community Certificate (if applicable)",
    "Address proof (Aadhaar / utility bill / rental agreement)",
  ];
  for (const d of docs) { y = drawBullet(doc, M + 2, y, d, CW - 4, NAVY); y += 1.5; }
  y += 6;

  // Fee info box
  setFill(doc, LIGHT_YELLOW);
  doc.roundedRect(M, y, CW, 24, 3, 3, "F");
  setDraw(doc, ORANGE);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, CW, 24, 3, 3, "S");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text("💰 Fee Structure", M + 6, y + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, MUTED);
  doc.text("Our fee structure is affordable and competitive. Payment can be made via cash, bank transfer, or UPI.", M + 6, y + 15);
  doc.text("UPI: nethajividhyalayam@upi  |  Contact office for detailed fee breakup.", M + 6, y + 21);

  drawFooter(doc, 11, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 12 — CONTACT & BACK COVER
  // ═══════════════════════════════════════
  doc.addPage();
  drawPageBorder(doc);
  y = 20;

  // Navy header on final page
  setFill(doc, NAVY);
  doc.rect(10, 10, PW - 20, 40, "F");
  drawAccentBar(doc, 50);
  if (logoData) {
    try { doc.addImage(logoData, "WEBP", PW / 2 - 15, 14, 30, 30); } catch { /* skip */ }
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  setColor(doc, GOLD);
  doc.text("Get in Touch with Us", PW / 2, 62, { align: "center" });
  y = 72;

  // Contact cards
  const contacts = [
    { icon: "📍", title: "Visit Us", detail: "5/325, Rajiv Nagar, S.Kolathur Main Road,\nS.Kolathur, Kovilambakkam Post,\nChennai – 600129, Tamil Nadu, India", bg: LIGHT_BLUE },
    { icon: "📞", title: "Call Us", detail: "Primary: 9841594945\nAlternate: 6380967675\nMon–Sat: 8:50 AM – 3:30 PM", bg: LIGHT_GREEN },
    { icon: "✉️", title: "Email Us", detail: "info@nethajividhyalayam.org\nnethajividhyalayam@gmail.com", bg: LIGHT_ORANGE },
    { icon: "🌐", title: "Website", detail: "nethajividhyalayam.org\nFollow us on social media for updates", bg: LIGHT_PURPLE },
  ];

  const ctW = (CW - 6) / 2;
  contacts.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = M + col * (ctW + 6);
    const cy = y + row * 40;
    setFill(doc, c.bg);
    doc.roundedRect(cx, cy, ctW, 36, 3, 3, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    setColor(doc, NAVY);
    doc.text(`${c.icon} ${c.title}`, cx + 6, cy + 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor(doc, MUTED);
    const lines = c.detail.split("\n");
    lines.forEach((l, j) => doc.text(l, cx + 6, cy + 18 + j * 5));
  });
  y += 88;

  // Final quote
  y = drawQuote(doc, y, "A child is not a vase to be filled, but a fire to be kindled.", "François Rabelais");
  y += 4;

  // Big invitation box
  setFill(doc, ORANGE);
  doc.roundedRect(M, y, CW, 30, 4, 4, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  setColor(doc, WHITE);
  doc.text("✨ Admissions Open — Pre-KG to Grade 5 ✨", PW / 2, y + 13, { align: "center" });
  doc.setFontSize(10);
  doc.text("Visit our campus today for a personalised tour!", PW / 2, y + 23, { align: "center" });
  y += 38;

  // Chairman line
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text("Chairman: Mr. J.J. Nareshkumar", PW / 2, y, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(doc, MUTED);
  doc.text("Established: 11th June 2002  |  Over 22 Years of Educational Excellence", PW / 2, y + 7, { align: "center" });

  drawFooter(doc, 12, TOTAL_PAGES);

  // ─── SAVE ───
  doc.save("Nethaji_Vidhyalayam_Prospectus_2025-26.pdf");
}
