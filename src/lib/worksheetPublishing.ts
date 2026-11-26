import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { uploadKindleLibraryItem } from "./kindleLibrary";
import { DEFAULT_WORKSHEET_TIME_LABEL, type WorksheetLayout } from "./worksheetLayout";

export interface PublishableWorksheet {
  title: string; grade: string; subject: string; instructions: string;
  subtitle?: string; timeLabel?: string; difficultyLabel?: string; languageLabel?: string;
  studentNameLabel?: string; dateLabel?: string; scoreLabel?: string;
  footerLine1?: string; footerLine2?: string; bookletRemarksTitle?: string;
  sections: { heading: string; type: string; questions: {
    id: number; question?: string; options?: string[]; left?: string[]; right?: string[];
    answer?: string; answers?: string[]; diagramLabels?: string[]; colAHeader?: string; colBHeader?: string;
  }[] }[];
}

export function worksheetLibraryStandard(grade: string): string {
  const clean = grade.trim();
  const named = ["Pre-KG", "LKG", "UKG", "I", "II", "III", "IV", "V"].find(value => value.toLowerCase() === clean.toLowerCase());
  if (named) return named;
  const number = clean.match(/^(?:class\s*)?([1-5])(?:st|nd|rd|th)?$/i)?.[1];
  return number ? ["I", "II", "III", "IV", "V"][Number(number) - 1] : "All";
}

const xml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c] ?? c));
const paragraph = (text: string, bold = false) => `<w:p><w:r>${bold ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;

export async function buildWorksheetLibraryFile(worksheet: PublishableWorksheet, layout: WorksheetLayout, includeAnswers: boolean): Promise<File> {
  const zip = new JSZip();
  const paragraphs = [
    paragraph("NETHAJI VIDHYALAYAM NURSERY AND PRIMARY SCHOOL", true),
    paragraph(worksheet.title, true),
    paragraph(worksheet.subtitle ?? "NethajiVidhyalayam Worksheet"),
    paragraph([worksheet.grade, worksheet.subject, worksheet.difficultyLabel, worksheet.languageLabel].filter(Boolean).join(" · ")),
    paragraph(worksheet.timeLabel ?? DEFAULT_WORKSHEET_TIME_LABEL),
    paragraph(`${worksheet.studentNameLabel ?? "Name:"} __________________  ${worksheet.dateLabel ?? "Date:"} __________  ${worksheet.scoreLabel ?? "Score:"} __________`),
  ];
  if (worksheet.instructions) paragraphs.push(paragraph(worksheet.instructions));
  for (const section of worksheet.sections) {
    paragraphs.push(paragraph(section.heading, true));
    for (const q of section.questions) {
      paragraphs.push(paragraph(`${q.id}. ${q.question ?? ""}`));
      q.options?.forEach((option, index) => paragraphs.push(paragraph(`${String.fromCharCode(65 + index)}) ${option}`)));
      if (q.left?.length) {
        const row = (a: string, b: string) => `<w:tr><w:tc>${paragraph(a)}</w:tc><w:tc>${paragraph(b)}</w:tc></w:tr>`;
        paragraphs.push(`<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single"/><w:bottom w:val="single"/><w:left w:val="single"/><w:right w:val="single"/><w:insideH w:val="single"/><w:insideV w:val="single"/></w:tblBorders></w:tblPr>${row(q.colAHeader ?? "Column A", q.colBHeader ?? "Column B")}${q.left.map((left, index) => row(left, q.right?.[index] ?? "")).join("")}</w:tbl>`);
      }
      if (section.type === "true_false") paragraphs.push(paragraph("[ True / False ]"));
      if (section.type === "short_answer") paragraphs.push(paragraph("__________________________________________________"));
      if (section.type === "diagram") {
        paragraphs.push(paragraph("[ Draw / label here ]"));
        q.diagramLabels?.forEach(label => paragraphs.push(paragraph(label)));
      }
    }
  }
  [worksheet.footerLine1, worksheet.footerLine2, layout === "booklet" ? worksheet.bookletRemarksTitle : undefined].filter(Boolean).forEach(text => paragraphs.push(paragraph(text ?? "")));
  if (includeAnswers) {
    paragraphs.push(paragraph("Answer Key", true));
    worksheet.sections.forEach(section => {
      paragraphs.push(paragraph(section.heading, true));
      section.questions.forEach(q => {
        const answer = q.answers?.join(" | ") || q.answer;
        if (answer) paragraphs.push(paragraph(`${q.id}. ${answer}`));
      });
    });
  }
  const landscape = layout !== "portrait";
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join("")}<w:sectPr><w:pgSz w:w="${landscape ? 16838 : 11906}" w:h="${landscape ? 11906 : 16838}"${landscape ? ' w:orient="landscape"' : ""}/><w:pgMar w:top="680" w:right="850" w:bottom="680" w:left="850"/></w:sectPr></w:body></w:document>`);
  const bytes = await zip.generateAsync({ type: "arraybuffer" });
  return new File([bytes], `${worksheet.title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 100) || "Worksheet"}.docx`, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

export type StaffPublishingAccess =
  | { status: "unauthenticated" }
  | { status: "unauthorized"; email: string | null }
  | { status: "authorized"; userId: string; email: string | null };

export async function checkStaffPublishingAccess(): Promise<StaffPublishingAccess> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "unauthenticated" };
  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
  if (roleError || !roles?.some(({ role }) => role === "admin" || role === "staff")) {
    return { status: "unauthorized", email: data.user.email ?? null };
  }
  return { status: "authorized", userId: data.user.id, email: data.user.email ?? null };
}

export async function publishWorksheetToLibrary(worksheet: PublishableWorksheet, layout: WorksheetLayout, includeAnswers: boolean, onStatus?: (status: string) => void) {
  const access = await checkStaffPublishingAccess();
  if (access.status === "unauthenticated") throw new Error("Sign in to Kindle Admin as school staff, then return here to publish. Your worksheet stays open.");
  if (access.status === "unauthorized") throw new Error("Only school staff and administrators can publish worksheets.");
  onStatus?.("Preparing worksheet…");
  const file = await buildWorksheetLibraryFile(worksheet, layout, includeAnswers);
  return uploadKindleLibraryItem({ file, title: worksheet.title, category: "worksheet", standard: worksheetLibraryStandard(worksheet.grade), userId: access.userId, userEmail: access.email, onStatus });
}