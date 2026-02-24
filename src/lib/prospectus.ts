import jsPDF from "jspdf";

// ─── Color Palette ───
const NAVY = [30, 58, 95] as const;
const ORANGE = [255, 107, 53] as const;
const WHITE = [255, 255, 255] as const;
const GOLD = [212, 168, 67] as const;
const LIGHT_BLUE = [225, 240, 255] as const;
const LIGHT_ORANGE = [255, 242, 230] as const;
const LIGHT_GREEN = [215, 250, 225] as const;
const LIGHT_PURPLE = [232, 225, 255] as const;
const LIGHT_ROSE = [255, 225, 230] as const;
const LIGHT_YELLOW = [255, 248, 210] as const;
const DARK_TEXT = [30, 41, 59] as const;
const MUTED = [71, 85, 105] as const;
const TEAL = [13, 148, 136] as const;
const ROSE = [200, 30, 70] as const;
const EMERALD = [5, 150, 105] as const;
const VIOLET = [110, 50, 220] as const;
const CRIMSON = [180, 20, 50] as const;

type RGB = readonly [number, number, number];

function setColor(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]); }
function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }

const PW = 210;
const PH = 297;
const M = 18;
const CW = PW - M * 2;

function drawBackgroundPattern(doc: jsPDF, variant: number = 0) {
  const patterns = [
    // Soft circles
    () => {
      doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
      setFill(doc, ORANGE);
      for (let i = 0; i < 12; i++) {
        const cx = 20 + (i % 4) * 55;
        const cy = 30 + Math.floor(i / 4) * 95;
        doc.circle(cx, cy, 18 + (i % 3) * 8, "F");
      }
      setFill(doc, NAVY);
      for (let i = 0; i < 8; i++) {
        const cx = 45 + (i % 3) * 60;
        const cy = 70 + Math.floor(i / 3) * 80;
        doc.circle(cx, cy, 12 + (i % 2) * 6, "F");
      }
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    },
    // Dots grid
    () => {
      doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
      setFill(doc, GOLD);
      for (let x = 15; x < PW - 10; x += 12) {
        for (let yp = 20; yp < PH - 20; yp += 12) {
          doc.circle(x, yp, 1, "F");
        }
      }
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    },
    // Diagonal lines
    () => {
      doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
      setDraw(doc, ORANGE);
      doc.setLineWidth(0.5);
      for (let i = -PH; i < PW + PH; i += 20) {
        doc.line(i, 0, i + PH, PH);
      }
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    },
    // Corner flourishes + scattered diamonds
    () => {
      doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
      setFill(doc, TEAL);
      // Top-right arc
      doc.circle(PW, 0, 40, "F");
      // Bottom-left arc
      doc.circle(0, PH, 40, "F");
      setFill(doc, GOLD);
      // Scattered small diamonds
      const pts = [[30, 50], [80, 120], [150, 80], [60, 200], [170, 230], [100, 260], [40, 150], [130, 170]];
      for (const [px, py] of pts) {
        doc.rect(px - 2, py - 2, 4, 4, "F");
      }
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    },
  ];
  patterns[variant % patterns.length]();
}

function drawPageBorder(doc: jsPDF) {
  setDraw(doc, NAVY);
  doc.setLineWidth(1);
  doc.rect(7, 7, PW - 14, PH - 14);
  setDraw(doc, GOLD);
  doc.setLineWidth(0.4);
  doc.rect(9, 9, PW - 18, PH - 18);
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  setFill(doc, NAVY);
  doc.rect(0, PH - 15, PW, 15, "F");
  setFill(doc, ORANGE);
  doc.rect(0, PH - 15, PW, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setColor(doc, WHITE);
  doc.text("Nethaji Vidhyalayam  --  Nurturing Tomorrow's Leaders", PW / 2, PH - 5.5, { align: "center" });
  setColor(doc, GOLD);
  doc.text(`${pageNum} / ${totalPages}`, PW - 15, PH - 5.5, { align: "right" });
}

function drawSectionHeader(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  // Colored accent bar on left
  setFill(doc, ORANGE);
  doc.rect(M, y, 4, 12, "F");
  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text(title, M + 10, y + 9);
  // Underline
  setFill(doc, GOLD);
  doc.rect(M + 10, y + 12, 50, 0.8, "F");
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    setColor(doc, MUTED);
    doc.text(subtitle, M + 10, y + 19);
    return y + 26;
  }
  return y + 18;
}

function wrapText(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW);
}

function drawWrapped(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH = 6): number {
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
  // Accent top bar
  setFill(doc, titleColor);
  doc.rect(x, y, w, 3, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  setColor(doc, titleColor);
  doc.text(title, x + w / 2, y + 12, { align: "center" });
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  const lines = wrapText(doc, body, w - 10);
  let cy = y + 19;
  for (const line of lines) {
    doc.text(line, x + w / 2, cy, { align: "center" });
    cy += 5;
  }
}

function drawBullet(doc: jsPDF, x: number, y: number, text: string, maxW: number, bulletColor: RGB = ORANGE): number {
  setFill(doc, bulletColor);
  doc.circle(x + 2, y - 1.5, 1.8, "F");
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  return drawWrapped(doc, text, x + 8, y, maxW - 8, 5.5);
}

function drawQuote(doc: jsPDF, y: number, quote: string, author: string): number {
  setFill(doc, LIGHT_BLUE);
  doc.roundedRect(M + 4, y, CW - 8, 24, 3, 3, "F");
  setFill(doc, CRIMSON);
  doc.rect(M + 4, y, 4, 24, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bolditalic");
  setColor(doc, NAVY);
  const qLines = wrapText(doc, `"${quote}"`, CW - 24);
  let qy = y + 9;
  for (const l of qLines) { doc.text(l, M + 14, qy); qy += 5.5; }
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  setColor(doc, MUTED);
  doc.text(`-- ${author}`, M + 14, qy + 1);
  return y + 30;
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
  const TOTAL = 12;
  let logoData: string;
  try { logoData = await loadLogoBase64(); } catch { logoData = ""; }

  // Helper to add logo cleanly — white circle mask removes any image background
  function addLogo(x: number, y: number, size: number, maskBg: RGB = WHITE) {
    if (!logoData) return;
    // Draw circular mask behind logo to blend cleanly
    setFill(doc, maskBg);
    doc.circle(x + size / 2, y + size / 2, size / 2, "F");
    try { doc.addImage(logoData, "WEBP", x, y, size, size); } catch { /* skip */ }
  }

  // ═══════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, PH, "F");

  // Corner accents
  setFill(doc, ORANGE);
  doc.triangle(0, 0, 50, 0, 0, 50, "F");
  doc.triangle(PW, PH, PW - 50, PH, PW, PH - 50, "F");
  setFill(doc, GOLD);
  doc.triangle(PW, 0, PW - 35, 0, PW, 35, "F");
  doc.triangle(0, PH, 35, PH, 0, PH - 35, "F");

  // Decorative lines
  setDraw(doc, GOLD);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, PW - 30, PH - 30);

  // Logo (large, centered, no box behind it)
  addLogo(PW / 2 - 32, 30, 64, NAVY);

  // School name
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  setColor(doc, WHITE);
  doc.text("NETHAJI", PW / 2, 115, { align: "center" });
  doc.text("VIDHYALAYAM", PW / 2, 132, { align: "center" });

  // Divider
  setFill(doc, ORANGE);
  doc.rect(PW / 2 - 35, 139, 70, 2.5, "F");

  // Tagline
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  setColor(doc, GOLD);
  doc.text("Nurturing Tomorrow's Leaders", PW / 2, 155, { align: "center" });

  // Prospectus title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  setColor(doc, ORANGE);
  doc.text("SCHOOL PROSPECTUS", PW / 2, 178, { align: "center" });
  doc.setFontSize(14);
  setColor(doc, WHITE);
  doc.text("Academic Year 2025 - 26", PW / 2, 190, { align: "center" });

  // Feature cards
  const coverFeatures = [
    "Pre-KG to Grade 5",
    "Established 2002",
    "Holistic Education",
    "Value-Based Learning",
  ];
  const cfW = 40;
  const cfGap = 5;
  const cfTotalW = cfW * 4 + cfGap * 3;
  const cfStart = (PW - cfTotalW) / 2;
  coverFeatures.forEach((label, i) => {
    const fx = cfStart + i * (cfW + cfGap);
    setFill(doc, [40, 70, 115]);
    doc.roundedRect(fx, 205, cfW, 22, 3, 3, "F");
    setFill(doc, ORANGE);
    doc.rect(fx, 205, cfW, 3, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(doc, GOLD);
    doc.text(label, fx + cfW / 2, 220, { align: "center" });
  });

  // Bottom contact
  doc.setFontSize(11);
  setColor(doc, WHITE);
  doc.text("5/325, Rajiv Nagar, S.Kolathur Main Road, Chennai - 600129", PW / 2, 252, { align: "center" });
  doc.setFontSize(10);
  setColor(doc, GOLD);
  doc.text("Phone: 9841594945 / 6380967675  |  info@nethajividhyalayam.org", PW / 2, 262, { align: "center" });

  // ═══════════════════════════════════════
  // PAGE 2 — CHAIRMAN'S MESSAGE
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 1);
  drawPageBorder(doc);
  let y = 22;
  y = drawSectionHeader(doc, y, "Chairman's Message", "From the Desk of Mr. J.J. Nareshkumar");
  y += 4;

  addLogo(PW / 2 - 14, y, 28);
  y += 34;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);

  const chairmanMsg = [
    "Dear Parents and Well-wishers,",
    "",
    "It gives me immense pleasure to welcome you to Nethaji Vidhyalayam. Since our founding on 11th June 2002, we have been committed to providing an educational environment that nurtures not just academic excellence, but also the moral, social, and emotional growth of every child.",
    "",
    "At Nethaji Vidhyalayam, we believe that every child is a unique individual with boundless potential. Our dedicated team of educators works tirelessly to create a learning atmosphere that inspires curiosity, fosters creativity, and builds strong character.",
    "",
    "We are proud of our state-of-the-art facilities, innovative teaching methodologies, and a curriculum that seamlessly blends traditional values with modern education. Our school is not just a place of learning -- it is a second home where children feel safe, valued, and empowered.",
    "",
    "I invite you to explore this prospectus and discover why Nethaji Vidhyalayam is the ideal choice for your child's educational journey.",
    "",
    "With warm regards,",
    "Mr. J.J. Nareshkumar",
    "Chairman, Nethaji Vidhyalayam"
  ];

  for (const para of chairmanMsg) {
    if (para === "") { y += 4; continue; }
    y = drawWrapped(doc, para, M, y, CW, 6);
    y += 1;
  }
  y += 8;
  y = drawQuote(doc, y, "Education is the most powerful weapon which you can use to change the world.", "Nelson Mandela");
  drawFooter(doc, 2, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 3 — ABOUT & VISION
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 2);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "About Our School", "A Legacy of Excellence Since 2002");
  y += 4;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "Nethaji Vidhyalayam, established in 2002, stands as a beacon of quality education in Chennai. Located in the heart of S.Kolathur, our institution has consistently delivered academic excellence while nurturing well-rounded individuals who contribute meaningfully to society.", M, y, CW, 6);
  y += 3;
  y = drawWrapped(doc, "Our school is named after the great freedom fighter Nethaji Subhas Chandra Bose, embodying his spirit of courage, determination, and selfless service. We strive to instil these same values in our students.", M, y, CW, 6);
  y += 10;

  // Vision & Mission cards
  drawColorCard(doc, M, y, CW / 2 - 4, 45, LIGHT_BLUE, "Our Vision", NAVY,
    "To be a centre of educational excellence that inspires lifelong learning, innovation, and responsible global citizenship.");
  drawColorCard(doc, M + CW / 2 + 4, y, CW / 2 - 4, 45, LIGHT_ORANGE, "Our Mission", ORANGE,
    "Empower students with knowledge, skills, and values to become confident, compassionate, and capable leaders of tomorrow.");
  y += 54;

  // Core Values
  y = drawSectionHeader(doc, y, "Our Core Values");
  y += 4;
  const coreValues = [
    { color: TEAL, label: "Excellence", desc: "Striving for the highest standards in everything we do" },
    { color: ROSE, label: "Integrity", desc: "Building character through honesty, respect, and responsibility" },
    { color: EMERALD, label: "Innovation", desc: "Embracing modern methods and creative problem-solving" },
    { color: VIOLET, label: "Compassion", desc: "Fostering empathy, kindness, and social awareness" },
    { color: ORANGE, label: "Discipline", desc: "Cultivating self-discipline and time management" },
    { color: NAVY, label: "Unity", desc: "Celebrating diversity and building a strong community" },
  ];
  const cvW = (CW - 10) / 3;
  const bgs: RGB[] = [LIGHT_GREEN, LIGHT_ROSE, LIGHT_BLUE, LIGHT_PURPLE, LIGHT_ORANGE, LIGHT_YELLOW];
  coreValues.forEach((v, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const cx = M + col * (cvW + 5);
    const cy = y + row * 30;
    drawColorCard(doc, cx, cy, cvW, 26, bgs[i], v.label, v.color, v.desc);
  });
  y += 66;

  y = drawQuote(doc, y, "The function of education is to teach one to think intensively and to think critically.", "Martin Luther King Jr.");
  drawFooter(doc, 3, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 4 — FOUNDATIONAL & PREPARATORY
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 3);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Academic Programme", "Foundational & Preparatory Stages");
  y += 4;

  // Foundational Stage header
  setFill(doc, LIGHT_YELLOW);
  doc.roundedRect(M, y, CW, 8, 2, 2, "F");
  setFill(doc, [180, 100, 20]);
  doc.rect(M, y, 4, 8, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setColor(doc, [146, 64, 14]);
  doc.text("Foundational Stage -- Pre-KG (Play-Based Learning)", M + 10, y + 6);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "Our Pre-KG programme focuses on experiential, play-based learning that develops curiosity and foundational skills in a nurturing environment.", M, y, CW, 5.5);
  y += 4;

  const foundSubjects = [
    "Language Development: Listening skills, action songs, rhymes, vocabulary building",
    "Number Concepts: Number recognition, counting 1-10, shapes and patterns",
    "Environmental Awareness: Self, family, colours, fruits, animals, seasons",
    "Motor Skills: Scribbling, finger movements, bead threading, clay modelling",
    "Creative Arts: Colouring, tearing and pasting, free art expression",
    "Physical Activities: Free play, music and movement, outdoor games",
    "Social Skills: Sharing, following instructions, group activities",
  ];
  for (const s of foundSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, [180, 100, 20]); y += 2; }
  y += 8;

  // Preparatory Stage header
  setFill(doc, LIGHT_BLUE);
  doc.roundedRect(M, y, CW, 8, 2, 2, "F");
  setFill(doc, NAVY);
  doc.rect(M, y, 4, 8, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text("Preparatory Stage -- LKG (Discovery Learning)", M + 10, y + 6);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "The LKG programme builds on foundational skills with structured learning across core subjects while maintaining the joy of discovery.", M, y, CW, 5.5);
  y += 4;

  const prepSubjects = [
    "English: Phonics blending, simple sentences, picture reading, basic writing",
    "Tamil: Vowels, consonants, simple words and basic letter formation",
    "Mathematics: Numbers 1-50, shapes, patterns, addition concept",
    "EVS: My body, seasons, plants, transport, community helpers",
    "Art and Craft: Craft activities, drawing, colouring, paper folding",
    "Physical Education: Group games, exercises, yoga for kids",
    "Value Education: Respect, honesty, caring for others",
  ];
  for (const s of prepSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, NAVY); y += 2; }
  y += 4;

  y = drawQuote(doc, y, "Play is the highest form of research.", "Albert Einstein");
  drawFooter(doc, 4, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 5 — MIDDLE & SECONDARY STAGES
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 0);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Academic Programme", "Middle & Secondary Stages");
  y += 4;

  // Middle Stage
  setFill(doc, LIGHT_GREEN);
  doc.roundedRect(M, y, CW, 8, 2, 2, "F");
  setFill(doc, EMERALD);
  doc.rect(M, y, 4, 8, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setColor(doc, [22, 101, 52]);
  doc.text("Middle Stage -- UKG (Critical Thinking & Projects)", M + 10, y + 6);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "UKG students engage in deeper subject exploration with emphasis on critical thinking, creativity, and collaborative project work.", M, y, CW, 5.5);
  y += 4;

  const midSubjects = [
    "English: Reading passages, comprehension, creative writing, grammar basics",
    "Tamil: Combined letters, simple words, sentences, short stories",
    "Mathematics: Numbers up to 100, addition and subtraction with carry, tables 1-5",
    "Science: Living vs non-living, plants and animals, our environment",
    "Social Studies: Our school, neighbourhood, festivals, maps introduction",
    "Art and Craft: Project-based art, model-making, display work",
    "Computer Science: Introduction to computers, keyboard and mouse, basic software",
  ];
  for (const s of midSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, EMERALD); y += 2; }
  y += 8;

  // Secondary Stage
  setFill(doc, LIGHT_PURPLE);
  doc.roundedRect(M, y, CW, 8, 2, 2, "F");
  setFill(doc, VIOLET);
  doc.rect(M, y, 4, 8, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setColor(doc, [91, 33, 182]);
  doc.text("Secondary Stage -- Grades 1 to 5 (Holistic Growth)", M + 10, y + 6);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "Our primary programme delivers comprehensive academic rigour alongside life skills, creative expression, and physical development.", M, y, CW, 5.5);
  y += 4;

  const secSubjects = [
    "English: Grammar, comprehension, creative writing, literature, vocabulary",
    "Tamil: Prose, poetry, grammar, composition and language enrichment",
    "Mathematics: Number operations, fractions, decimals, geometry, data handling",
    "Science: Living things, matter, force and energy, Earth and environment",
    "Social Studies: History, civics, geography, map skills, cultural heritage",
    "Computer Science: MS Office basics, internet safety, programming logic",
    "Physical Education: Outdoor sports, yoga, health and hygiene, team activities",
    "Art and Music: Creative arts, visual expression, Indian classical music",
  ];
  for (const s of secSubjects) { y = drawBullet(doc, M + 2, y, s, CW - 4, VIOLET); y += 2; }

  drawFooter(doc, 5, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 6 — TEACHING METHODOLOGY
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 1);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Teaching Methodology", "Innovative Approaches to Learning");
  y += 6;

  const methods = [
    { title: "Activity-Based Learning", desc: "Hands-on experiments, role-plays, and real-world problem solving make learning engaging and memorable. Children learn by doing, not just listening.", bg: LIGHT_YELLOW, c: [146, 64, 14] as RGB },
    { title: "Inquiry-Based Approach", desc: "We encourage students to ask questions, investigate, and discover answers independently. This builds critical thinking and scientific temperament.", bg: LIGHT_BLUE, c: NAVY },
    { title: "Collaborative Learning", desc: "Group projects, peer teaching, and team activities develop communication skills, leadership, and the ability to work effectively with others.", bg: LIGHT_GREEN, c: EMERALD },
    { title: "Technology-Enhanced Learning", desc: "Smart boards, digital content, and computer labs integrate technology seamlessly into the learning process for a future-ready education.", bg: LIGHT_PURPLE, c: VIOLET },
    { title: "Creative Expression", desc: "Art, music, dance, and drama provide outlets for self-expression and develop aesthetic sensibility and emotional intelligence.", bg: LIGHT_ROSE, c: ROSE },
    { title: "Continuous Assessment", desc: "Regular formative assessments, portfolios, and feedback ensure every child's progress is monitored and supported consistently.", bg: LIGHT_ORANGE, c: ORANGE },
  ];

  const mW = (CW - 8) / 2;
  methods.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = M + col * (mW + 8);
    const my = y + row * 40;
    drawColorCard(doc, mx, my, mW, 36, m.bg, m.title, m.c, m.desc);
  });
  y += 126;

  y = drawQuote(doc, y, "Tell me and I forget. Teach me and I remember. Involve me and I learn.", "Benjamin Franklin");
  y += 4;
  y = drawQuote(doc, y, "Every child is an artist. The problem is how to remain an artist once we grow up.", "Pablo Picasso");

  drawFooter(doc, 6, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 7 — FACILITIES
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 2);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "World-Class Facilities", "Infrastructure Designed for Excellence");
  y += 6;

  const facilities = [
    { title: "Smart Classrooms", desc: "Interactive digital boards, projectors, and audio-visual aids create an immersive learning environment.", bg: LIGHT_BLUE },
    { title: "Library & Reading Room", desc: "Well-stocked library with thousands of books in Tamil and English, reference materials, and a reading corner.", bg: LIGHT_GREEN },
    { title: "Science Laboratory", desc: "Fully equipped science lab for hands-on experiments and scientific discovery.", bg: LIGHT_YELLOW },
    { title: "Computer Lab", desc: "Modern computer laboratory with internet, educational software, and programming tools.", bg: LIGHT_PURPLE },
    { title: "Sports Complex", desc: "Spacious playground with cricket, football, athletics, indoor games, and regular coaching.", bg: LIGHT_ROSE },
    { title: "Safe Transport", desc: "GPS-tracked school buses with trained drivers, attendants, and strict safety protocols.", bg: LIGHT_ORANGE },
    { title: "Art & Music Room", desc: "Dedicated spaces for visual arts, music practice, and dance with professional instruments.", bg: LIGHT_BLUE },
    { title: "Health & Safety", desc: "On-campus first aid, regular health check-ups, CCTV surveillance, and fire safety equipment.", bg: LIGHT_GREEN },
  ];

  const fW = (CW - 8) / 2;
  facilities.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = M + col * (fW + 8);
    const fy = y + row * 32;
    drawColorCard(doc, fx, fy, fW, 28, f.bg, f.title, NAVY, f.desc);
  });

  drawFooter(doc, 7, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 8 — CO-CURRICULAR ACTIVITIES
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 3);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Co-Curricular Activities", "Beyond the Classroom");
  y += 4;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "At Nethaji Vidhyalayam, we believe that true education extends far beyond textbooks. Our rich co-curricular programme helps students discover their talents, build confidence, and develop skills for life.", M, y, CW, 6);
  y += 6;

  const activities = [
    { cat: "Arts & Culture", items: ["Drawing and painting competitions", "Craft workshops and exhibitions", "Cultural programme performances", "Traditional dance (Bharatanatyam)", "Music and choir practice"], bg: LIGHT_ORANGE, c: ORANGE },
    { cat: "Sports & Fitness", items: ["Annual Sports Day celebrations", "Yoga and meditation sessions", "Karate and self-defense training", "Cricket, football, and athletics", "Indoor games and chess club"], bg: LIGHT_GREEN, c: EMERALD },
    { cat: "Language & Communication", items: ["Spoken English programme", "Tamil literary club", "Elocution and debate competitions", "Story-telling and drama", "Creative writing workshops"], bg: LIGHT_PURPLE, c: VIOLET },
    { cat: "STEM & Innovation", items: ["Science exhibitions and model-making", "Mathematics olympiad preparation", "Basic robotics and coding", "Nature study and eco-club", "Educational field trips"], bg: LIGHT_ROSE, c: ROSE },
  ];

  const aW = (CW - 8) / 2;
  activities.forEach((act, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = M + col * (aW + 8);
    const ay = y + row * 60;
    setFill(doc, act.bg);
    doc.roundedRect(ax, ay, aW, 55, 3, 3, "F");
    setFill(doc, act.c);
    doc.rect(ax, ay, aW, 3, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    setColor(doc, act.c);
    doc.text(act.cat, ax + aW / 2, ay + 13, { align: "center" });
    let by = ay + 20;
    for (const item of act.items) {
      by = drawBullet(doc, ax + 6, by, item, aW - 14, act.c);
      by += 1.5;
    }
  });
  y += 128;

  y = drawQuote(doc, y, "Education is not preparation for life; education is life itself.", "John Dewey");
  drawFooter(doc, 8, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 9 — ASSESSMENT & ACHIEVEMENTS
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 0);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Assessment Framework", "Continuous Evaluation for Holistic Growth");
  y += 6;

  drawColorCard(doc, M, y, CW / 2 - 4, 38, LIGHT_ORANGE, "40% -- Formative", ORANGE,
    "Quizzes, projects, class participation, assignments, portfolios, and observations throughout the term.");
  drawColorCard(doc, M + CW / 2 + 4, y, CW / 2 - 4, 38, LIGHT_BLUE, "60% -- Summative", NAVY,
    "Mid-term examinations and final assessments with comprehensive evaluation across all subjects.");
  y += 46;

  y = drawSectionHeader(doc, y, "Key Assessment Features");
  y += 4;
  const assessFeatures = [
    "Activity-based and experiential learning assessments",
    "Regular worksheets, projects, and hands-on evaluations",
    "Periodic progress reports shared with parents",
    "Continuous observation and constructive feedback",
    "Parent-teacher meetings for collaborative growth planning",
    "Portfolio-based assessment for creative subjects",
  ];
  for (const f of assessFeatures) { y = drawBullet(doc, M + 2, y, f, CW - 4); y += 2.5; }
  y += 8;

  y = drawSectionHeader(doc, y, "Our Achievements");
  y += 4;
  const achievements = [
    "22+ years of educational excellence serving Chennai community",
    "Consistently high academic performance across all standards",
    "Award-winning students in inter-school competitions",
    "Successful alumni pursuing higher education in top institutions",
    "Recognition for innovative teaching methodologies",
    "Strong parent-teacher-student community bond",
    "Active participation in national events and celebrations",
    "Regular community outreach and social service initiatives",
  ];
  for (const a of achievements) { y = drawBullet(doc, M + 2, y, a, CW - 4, EMERALD); y += 2.5; }

  drawFooter(doc, 9, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 10 — SPECIAL PROGRAMMES
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 1);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Special Programmes", "Unique Offerings That Set Us Apart");
  y += 6;

  const specials = [
    { title: "Spoken English Programme", desc: "Comprehensive English fluency programme with interactive sessions, pronunciation practice, vocabulary building, role-plays, and confidence-building exercises.", bg: LIGHT_BLUE, c: NAVY },
    { title: "Yoga & Wellness", desc: "Regular yoga sessions, meditation practice, and wellness education help students maintain physical fitness, mental clarity, and emotional balance.", bg: LIGHT_GREEN, c: EMERALD },
    { title: "Life Skills Education", desc: "Critical thinking, decision-making, time management, financial literacy basics, and interpersonal skills that prepare students for real-world challenges.", bg: LIGHT_PURPLE, c: VIOLET },
    { title: "Environmental Awareness", desc: "Eco-club activities, tree planting drives, waste management awareness, and nature study excursions build environmental consciousness.", bg: LIGHT_YELLOW, c: [146, 64, 14] as RGB },
    { title: "Digital Literacy", desc: "Age-appropriate technology introduction, internet safety, basic programming concepts, and responsible digital citizenship.", bg: LIGHT_ROSE, c: ROSE },
    { title: "Cultural Heritage", desc: "Tamil culture appreciation, festival celebrations, traditional art forms, and heritage awareness activities connect students with their roots.", bg: LIGHT_ORANGE, c: ORANGE },
  ];

  const sW = (CW - 8) / 2;
  specials.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = M + col * (sW + 8);
    const sy = y + row * 38;
    drawColorCard(doc, sx, sy, sW, 34, s.bg, s.title, s.c, s.desc);
  });
  y += 120;

  y = drawQuote(doc, y, "The beautiful thing about learning is that no one can take it away from you.", "B.B. King");
  drawFooter(doc, 10, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 11 — ADMISSIONS
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 2);
  drawPageBorder(doc);
  y = 22;
  y = drawSectionHeader(doc, y, "Admissions 2025-26", "Join the Nethaji Vidhyalayam Family");
  y += 4;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  y = drawWrapped(doc, "We warmly welcome applications for Pre-KG through Grade 5. Our admission process is designed to be simple, transparent, and parent-friendly. We believe every child deserves quality education.", M, y, CW, 6);
  y += 6;

  y = drawSectionHeader(doc, y, "Admission Process");
  y += 4;
  const steps = [
    "Step 1: Visit our campus or contact us for an initial enquiry and school tour",
    "Step 2: Collect and fill the admission application form (also available online)",
    "Step 3: Submit the form with required documents at the school office",
    "Step 4: Interactive session / observation for the child (age-appropriate)",
    "Step 5: Confirmation of admission and fee payment",
    "Step 6: Orientation programme for parents and students",
  ];
  for (const s of steps) { y = drawBullet(doc, M + 2, y, s, CW - 4, TEAL); y += 2.5; }
  y += 6;

  y = drawSectionHeader(doc, y, "Documents Required");
  y += 4;
  const docs = [
    "Birth Certificate (original + photocopy)",
    "Aadhaar Card of the child and parents",
    "4 recent passport-size photographs of the child",
    "Transfer Certificate from previous school (if applicable)",
    "Report card / progress report (if applicable)",
    "Community Certificate (if applicable)",
    "Address proof (Aadhaar / utility bill / rental agreement)",
  ];
  for (const d of docs) { y = drawBullet(doc, M + 2, y, d, CW - 4, NAVY); y += 2; }
  y += 6;

  // Fee info
  setFill(doc, LIGHT_YELLOW);
  doc.roundedRect(M, y, CW, 26, 3, 3, "F");
  setDraw(doc, GOLD);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, y, CW, 26, 3, 3, "S");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text("Fee Structure", M + 8, y + 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, DARK_TEXT);
  doc.text("Our fee structure is affordable and competitive. Payment via cash, bank transfer, or UPI.", M + 8, y + 17);
  doc.text("UPI: nethajividhyalayam@upi  |  Contact office for detailed fee breakup.", M + 8, y + 23);

  drawFooter(doc, 11, TOTAL);

  // ═══════════════════════════════════════
  // PAGE 12 — CONTACT & BACK COVER
  // ═══════════════════════════════════════
  doc.addPage();
  drawBackgroundPattern(doc, 3);
  drawPageBorder(doc);

  // Navy header with logo
  setFill(doc, NAVY);
  doc.roundedRect(10, 10, PW - 20, 45, 0, 0, "F");
  setFill(doc, ORANGE);
  doc.rect(10, 52, PW - 20, 3, "F");

  addLogo(PW / 2 - 16, 14, 32, NAVY);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(doc, GOLD);
  doc.text("Get in Touch with Us", PW / 2, 68, { align: "center" });
  y = 78;

  const contacts = [
    { title: "Visit Us", detail: "5/325, Rajiv Nagar, S.Kolathur Main Road,\nS.Kolathur, Kovilambakkam Post,\nChennai - 600129, Tamil Nadu, India", bg: LIGHT_BLUE },
    { title: "Call Us", detail: "Primary: 9841594945\nAlternate: 6380967675\nMon-Sat: 8:50 AM - 3:30 PM", bg: LIGHT_GREEN },
    { title: "Email Us", detail: "info@nethajividhyalayam.org\nnethajividhyalayam@gmail.com", bg: LIGHT_ORANGE },
    { title: "Website", detail: "nethajividhyalayam.org\nFollow us on social media for updates", bg: LIGHT_PURPLE },
  ];

  const ctW = (CW - 8) / 2;
  contacts.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = M + col * (ctW + 8);
    const cy = y + row * 42;
    setFill(doc, c.bg);
    doc.roundedRect(cx, cy, ctW, 38, 3, 3, "F");
    setFill(doc, NAVY);
    doc.rect(cx, cy, ctW, 3, "F");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    setColor(doc, NAVY);
    doc.text(c.title, cx + 8, cy + 13);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    setColor(doc, DARK_TEXT);
    const lines = c.detail.split("\n");
    lines.forEach((l, j) => doc.text(l, cx + 8, cy + 22 + j * 6));
  });
  y += 92;

  y = drawQuote(doc, y, "A child is not a vase to be filled, but a fire to be kindled.", "Francois Rabelais");
  y += 6;

  // Big invitation box
  setFill(doc, ORANGE);
  doc.roundedRect(M, y, CW, 32, 4, 4, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(doc, WHITE);
  doc.text("Admissions Open -- Pre-KG to Grade 5", PW / 2, y + 14, { align: "center" });
  doc.setFontSize(11);
  doc.text("Visit our campus today for a personalised tour!", PW / 2, y + 25, { align: "center" });
  y += 40;

  // Chairman line
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(doc, NAVY);
  doc.text("Chairman: Mr. J.J. Nareshkumar", PW / 2, y, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, MUTED);
  doc.text("Established: 11th June 2002  |  Over 22 Years of Educational Excellence", PW / 2, y + 8, { align: "center" });

  drawFooter(doc, 12, TOTAL);

  // ─── SAVE ───
  doc.save("Nethaji_Vidhyalayam_Prospectus_2025-26.pdf");
}
