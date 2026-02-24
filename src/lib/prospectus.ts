// School Prospectus Brochure PDF Generator

const NAVY = "#1e3a5f";
const ORANGE = "#FF6B35";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#f0f4f8";
const GOLD = "#D4A843";

function drawHeader(ctx: CanvasRenderingContext2D, w: number) {
  // Navy gradient header
  const grad = ctx.createLinearGradient(0, 0, w, 160);
  grad.addColorStop(0, NAVY);
  grad.addColorStop(1, "#2c5282");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 160);

  // Orange accent bar
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 160, w, 6);

  // School name
  ctx.fillStyle = WHITE;
  ctx.font = "bold 38px 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.fillText("NETHAJI VIDHYALAYAM", w / 2, 70);

  // Tagline
  ctx.font = "bold 16px 'Poppins', sans-serif";
  ctx.fillStyle = GOLD;
  ctx.fillText("✦  Nurturing Tomorrow's Leaders  ✦", w / 2, 105);

  // Est.
  ctx.font = "14px 'Poppins', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("Established: 11th June 2002  |  Chairman: Mr. J.J. NARESHKUMAR", w / 2, 140);
}

function drawSectionTitle(ctx: CanvasRenderingContext2D, y: number, w: number, title: string) {
  ctx.fillStyle = ORANGE;
  ctx.fillRect(60, y, 4, 28);
  ctx.font = "bold 22px 'Playfair Display', serif";
  ctx.fillStyle = NAVY;
  ctx.textAlign = "left";
  ctx.fillText(title, 74, y + 22);
  return y + 44;
}

function drawParagraph(ctx: CanvasRenderingContext2D, x: number, y: number, maxW: number, text: string, fontSize = 13, color = "#334155", lineH = 20) {
  ctx.font = `${fontSize}px 'Poppins', sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, cy);
      line = word + " ";
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line.trim()) { ctx.fillText(line.trim(), x, cy); cy += lineH; }
  return cy;
}

function drawBulletList(ctx: CanvasRenderingContext2D, x: number, y: number, maxW: number, items: string[]) {
  for (const item of items) {
    ctx.fillStyle = ORANGE;
    ctx.beginPath();
    ctx.arc(x + 6, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    y = drawParagraph(ctx, x + 18, y, maxW - 18, item, 12, "#475569", 17);
    y += 2;
  }
  return y;
}

function drawColorCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, desc: string, bgColor: string, titleColor: string) {
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.font = "bold 14px 'Poppins', sans-serif";
  ctx.fillStyle = titleColor;
  ctx.textAlign = "center";
  ctx.fillText(title, x + w / 2, y + 28);
  ctx.font = "11px 'Poppins', sans-serif";
  ctx.fillStyle = "#475569";
  ctx.textAlign = "center";

  const words = desc.split(" ");
  let line = "";
  let cy = y + 48;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > w - 20 && line) {
      ctx.fillText(line.trim(), x + w / 2, cy);
      line = word + " ";
      cy += 15;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x + w / 2, cy);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFooter(ctx: CanvasRenderingContext2D, y: number, w: number) {
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, y, w, 80);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, y, w, 4);
  ctx.font = "bold 13px 'Poppins', sans-serif";
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.fillText("📍 5/325, Rajiv Nagar, S.Kolathur Main Road, Kovilambakkam Post, Chennai - 600129", w / 2, y + 30);
  ctx.font = "12px 'Poppins', sans-serif";
  ctx.fillStyle = GOLD;
  ctx.fillText("📞 9841594945 / 6380967675  |  ✉ info@nethajividhyalayam.org", w / 2, y + 52);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "10px 'Poppins', sans-serif";
  ctx.fillText("© Nethaji Vidhyalayam — All Rights Reserved", w / 2, y + 72);
}

export async function generateProspectusPDF() {
  const W = 794; // A4 width at 96dpi
  const H = 1123; // A4 height at 96dpi
  const MARGIN = 60;
  const contentW = W - MARGIN * 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, W, H);

  // Header
  drawHeader(ctx, W);

  let y = 190;

  // Welcome
  y = drawSectionTitle(ctx, y, W, "Welcome to Nethaji Vidhyalayam");
  y = drawParagraph(ctx, MARGIN, y, contentW,
    "Founded in 2002, Nethaji Vidhyalayam is a leading educational institution in Chennai dedicated to nurturing young minds through a blend of academic excellence, character development, and holistic growth. Our school provides a safe, stimulating, and inclusive environment where every child can thrive.", 13, "#334155", 19);
  y += 12;

  // Vision & Mission cards
  drawColorCard(ctx, MARGIN, y, contentW / 2 - 10, 100,
    "🎯 Our Vision", "To be a centre of educational excellence that inspires lifelong learning and responsible global citizenship.",
    "#EBF5FF", NAVY);
  drawColorCard(ctx, MARGIN + contentW / 2 + 10, y, contentW / 2 - 10, 100,
    "🚀 Our Mission", "Empower students with knowledge, skills, and values to become confident, compassionate leaders of tomorrow.",
    "#FFF7ED", ORANGE);
  y += 120;

  // Academics
  y = drawSectionTitle(ctx, y, W, "Academic Programmes");
  y = drawParagraph(ctx, MARGIN, y, contentW,
    "We offer a comprehensive curriculum from Pre-KG through Grade 5, aligned with modern pedagogical practices:", 13, "#334155", 19);
  y += 4;
  y = drawBulletList(ctx, MARGIN, y, contentW, [
    "Foundational Stage (Pre-KG): Play-based learning, phonics, motor skills development",
    "Preparatory Stage (LKG): Core subjects — Languages, Math, EVS with discovery learning",
    "Middle Stage (UKG): Subject specialization, critical thinking, project work",
    "Secondary Stage (Grades 1–5): Advanced academics, life skills, holistic growth",
  ]);
  y += 8;

  // Facilities
  y = drawSectionTitle(ctx, y, W, "World-Class Facilities");
  y = drawBulletList(ctx, MARGIN, y, contentW, [
    "Smart classrooms with interactive digital boards",
    "Well-stocked library with Tamil & English collections",
    "Science & computer laboratories",
    "Spacious playground & sports facilities",
    "Safe and hygienic transport services",
    "Art, Music & Dance rooms for creative expression",
  ]);
  y += 8;

  // Co-curricular
  y = drawSectionTitle(ctx, y, W, "Co-Curricular Activities");
  const activities = [
    { title: "🎨 Arts & Culture", desc: "Drawing, painting, craft, cultural programmes", bg: "#FEF3C7", c: "#92400E" },
    { title: "🏅 Sports", desc: "Yoga, karate, athletics, team sports", bg: "#DCFCE7", c: "#166534" },
    { title: "🗣️ Languages", desc: "Spoken English programme, Tamil enrichment", bg: "#EDE9FE", c: "#5B21B6" },
    { title: "🔬 STEM", desc: "Science exhibitions, robotics, coding basics", bg: "#FFE4E6", c: "#9F1239" },
  ];
  const cardW = (contentW - 30) / 4;
  activities.forEach((a, i) => {
    drawColorCard(ctx, MARGIN + i * (cardW + 10), y, cardW, 90, a.title, a.desc, a.bg, a.c);
  });
  y += 110;

  // Admissions
  y = drawSectionTitle(ctx, y, W, "Admissions Open — Pre-KG to Grade 5");
  y = drawParagraph(ctx, MARGIN, y, contentW,
    "Join the Nethaji Vidhyalayam family! We welcome applications throughout the year. Visit our campus or contact us for a personalised school tour. Documents required: Birth certificate, Aadhaar card, passport-size photos, previous school records (if applicable).", 12, "#475569", 18);
  y += 10;

  // Contact highlight box
  ctx.fillStyle = LIGHT_BG;
  roundRect(ctx, MARGIN, y, contentW, 65, 10);
  ctx.fill();
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 2;
  roundRect(ctx, MARGIN, y, contentW, 65, 10);
  ctx.stroke();
  ctx.font = "bold 14px 'Poppins', sans-serif";
  ctx.fillStyle = NAVY;
  ctx.textAlign = "center";
  ctx.fillText("📞 Call Us: 9841594945 / 6380967675", W / 2, y + 25);
  ctx.font = "12px 'Poppins', sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("🕐 Mon–Sat: 8:50 AM – 3:30 PM  |  📍 S.Kolathur, Chennai – 600129", W / 2, y + 48);
  y += 80;

  // Footer
  drawFooter(ctx, H - 80, W);

  // Convert to PDF-like download (using canvas → blob)
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Nethaji_Vidhyalayam_Prospectus.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png", 1.0);
}
