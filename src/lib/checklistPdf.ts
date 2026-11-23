import jsPDF from "jspdf";

const loadLogo = async (): Promise<string> => {
  try {
    const blob = await (await fetch("/nethaji_logo_badge.png")).blob();
    return await new Promise((res) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.onerror = () => res("");
      r.readAsDataURL(blob);
    });
  } catch { return ""; }
};

export async function downloadChecklistPDF(docs: string[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210;
  const logo = await loadLogo();
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, PW, 42, "F");
  if (logo) { try { doc.addImage(logo, "PNG", 10, 6, 30, 30); } catch { /* skip */ } }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("NETHAJI VIDHYALAYAM NURSERY AND PRIMARY SCHOOL", 45, 14);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize("5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129", 155), 45, 21);
  doc.text("Phone: +91 9841594945 / +91 6380967675 | Email: nethajividhyalayam@gmail.com", 45, 33);

  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("Admission Documents Checklist", PW / 2, 56, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(90, 90, 90);
  doc.text("Please submit along with originals for verification", PW / 2, 63, { align: "center" });

  let y = 76;
  doc.setTextColor(30, 30, 30); doc.setFontSize(11);
  docs.forEach((d, i) => {
    doc.setDrawColor(30, 58, 95); doc.rect(18, y - 4.5, 5.5, 5.5);
    const lines = doc.splitTextToSize(`${i + 1}. ${d}`, 160);
    doc.text(lines, 28, y);
    y += lines.length * 6 + 5;
  });

  y += 8;
  doc.setDrawColor(150, 150, 150); doc.rect(15, y, PW - 30, 32);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 58, 95);
  doc.text("FOR OFFICE USE ONLY", 20, y + 7);
  doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
  doc.text("Student Name: ______________________", 20, y + 16);
  doc.text("Verified By: ____________________", 115, y + 16);
  doc.text("Date: ____________", 20, y + 26);
  doc.text("Signature: ____________________", 115, y + 26);

  doc.save("Admission_Documents_Checklist.pdf");
}
