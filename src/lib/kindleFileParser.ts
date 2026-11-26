export type KindleFormat = "pdf" | "word" | "excel" | "epub" | "image" | "text" | "sample";

export interface KindlePage {
  title: string;
  paragraphs: string[];
  htmlContent?: string;
  tableRows?: string[][];
  imageUrl?: string;
  renderVisualPage?: (scale?: number) => Promise<string>;
}

export interface KindleDocument {
  id: string;
  title: string;
  fileName: string;
  format: KindleFormat;
  pages: KindlePage[];
  wordCount: number;
  cleanup?: () => void;
}

export const MAX_KINDLE_FILE_BYTES = 50 * 1024 * 1024;
const WORDS_PER_PAGE = 260;

export function detectFileFormat(fileName: string, mimeType = ""): KindleFormat {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const mime = mimeType.toLowerCase();
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (ext === "docx" || ext === "doc" || mime.includes("wordprocessingml") || mime === "application/msword") return "word";
  if (ext === "xlsx" || ext === "xls" || ext === "csv" || mime.includes("spreadsheet") || mime === "text/csv") return "excel";
  if (ext === "epub" || mime === "application/epub+zip") return "epub";
  if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext) || mime.startsWith("image/")) return "image";
  return "text";
}

export function countWords(pages: KindlePage[]): number {
  return pages.reduce(
    (sum, p) =>
      sum + p.paragraphs.reduce((acc, para) => acc + para.trim().split(/\s+/).filter(Boolean).length, 0),
    0,
  );
}

export function paginateParagraphs(paragraphs: string[], baseTitle: string): KindlePage[] {
  const clean = paragraphs.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (clean.length === 0) return [{ title: baseTitle, paragraphs: ["(No readable text found in this document.)"] }];
  const pages: KindlePage[] = [];
  let bucket: string[] = [];
  let words = 0;
  for (const para of clean) {
    const count = para.split(/\s+/).length;
    if (bucket.length > 0 && words + count > WORDS_PER_PAGE) {
      pages.push({ title: `${baseTitle} — Page ${pages.length + 1}`, paragraphs: bucket });
      bucket = [para];
      words = count;
    } else {
      bucket.push(para);
      words += count;
    }
  }
  if (bucket.length > 0) {
    pages.push({
      title: pages.length === 0 ? baseTitle : `${baseTitle} — Page ${pages.length + 1}`,
      paragraphs: bucket,
    });
  }
  return pages;
}

export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

export function tableRowsToParagraphs(rows: string[][], sheetName: string): string[] {
  if (rows.length === 0) return [`${sheetName}: Empty sheet.`];
  const headers = rows[0] ?? [];
  if (rows.length === 1) return [`${sheetName}: ${headers.filter(Boolean).join(", ")}`];
  const lines: string[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r] ?? [];
    const parts = cells
      .map((val, c) => {
        if (!val) return "";
        const header = headers[c];
        return header ? `${header}: ${val}` : val;
      })
      .filter(Boolean);
    if (parts.length > 0) lines.push(`Row ${r}: ${parts.join(", ")}.`);
  }
  return lines.length > 0 ? lines : [`${sheetName}: ${headers.filter(Boolean).join(", ")}`];
}

export function stripHtmlToParagraphs(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, svg, noscript").forEach((el) => el.remove());
  const blocks = doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, tr");
  const result: string[] = [];
  blocks.forEach((el) => {
    if (el.querySelector("h1, h2, h3, h4, h5, h6, p, li, blockquote")) return;
    const txt = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (txt) result.push(txt);
  });
  if (result.length > 0) return result;
  return (doc.body.textContent ?? "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
}

const ALLOWED_HTML_TAGS = new Set([
  "P", "BR", "STRONG", "B", "EM", "I", "U", "S", "SUB", "SUP",
  "H1", "H2", "H3", "H4", "H5", "H6",
  "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE",
  "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "IMG", "DIV", "SPAN",
]);

export function sanitizeBookHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("script, style, iframe, object, embed, form, svg, noscript").forEach((el) => el.remove());
  const cleanNode = (node: Element) => {
    Array.from(node.children).forEach((child) => {
      if (!ALLOWED_HTML_TAGS.has(child.tagName)) {
        const span = parsed.createElement("span");
        span.textContent = child.textContent ?? "";
        child.replaceWith(span);
        return;
      }
      Array.from(child.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (child.tagName === "IMG" && name === "src" && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(attr.value)) {
          return;
        }
        if (child.tagName === "IMG" && name === "alt") return;
        if ((child.tagName === "TD" || child.tagName === "TH") && (name === "colspan" || name === "rowspan")) return;
        child.removeAttribute(attr.name);
      });
      cleanNode(child);
    });
  };
  cleanNode(parsed.body);
  return parsed.body.innerHTML;
}

export function extractKindleSpeechSegments(
  doc: KindleDocument,
  pageIndex?: number | number[],
): string[] {
  const targetIndices =
    typeof pageIndex === "number"
      ? doc.pages[pageIndex]
        ? [pageIndex]
        : []
      : Array.isArray(pageIndex)
        ? pageIndex.filter((i) => i >= 0 && i < doc.pages.length)
        : doc.pages.map((_, i) => i);

  const segments: string[] = [];
  if (targetIndices.includes(0)) {
    segments.push(doc.title);
  }
  for (const idx of targetIndices) {
    const page = doc.pages[idx];
    if (!page) continue;
    if (page.title && page.title !== doc.title) segments.push(page.title);
    for (const para of page.paragraphs) {
      const clean = para.trim();
      if (clean) segments.push(clean);
    }
  }
  return segments;
}

async function parsePdfFile(
  file: File,
  title: string,
  onProgress?: (s: string) => void,
): Promise<{ pages: KindlePage[]; cleanup: () => void }> {
  onProgress?.("Loading PDF pages…");
  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const pages: KindlePage[] = [];
  const renderedCache = new Map<string, string>();

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Reading PDF page ${i} of ${pdf.numPages}…`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      currentLine += item.str;
      if (item.hasEOL) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = "";
      } else {
        currentLine += " ";
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    const paragraphs = lines.length > 0
      ? lines.join("\n").split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean)
      : ["(Scanned PDF page — full visual page is displayed above.)"];

    const pageNum = i;
    const renderVisualPage = async (scale = 1.6): Promise<string> => {
      const cacheKey = `${pageNum}@${scale}`;
      const cached = renderedCache.get(cacheKey);
      if (cached) return cached;
      const pdfPage = await pdf.getPage(pageNum);
      const viewport = pdfPage.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable.");
      await pdfPage.render({ canvasContext: ctx, viewport, canvas }).promise;
      const dataUrl = canvas.toDataURL("image/png");
      renderedCache.set(cacheKey, dataUrl);
      return dataUrl;
    };

    pages.push({ title: `${title} — Page ${i}`, paragraphs, renderVisualPage });
  }
  return { pages, cleanup: () => void loadingTask.destroy() };
}

async function parseWordFile(file: File, title: string, onProgress?: (s: string) => void): Promise<KindlePage[]> {
  onProgress?.("Reading Word document…");
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (ext === "doc") {
    const text = (await file.text()).replace(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g, " ");
    const chunks = text.split(/\n+/).map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 3);
    return paginateParagraphs(
      chunks.length > 0 ? chunks : ["Legacy .doc binary format detected. Please save as .docx or .pdf for best reading quality."],
      title,
    );
  }
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const [{ value: htmlRaw }, { value: textRaw }] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer: buffer }),
    mammoth.extractRawText({ arrayBuffer: buffer }),
  ]);
  const paragraphs = textRaw.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const safeHtml = sanitizeBookHtml(htmlRaw);
  if (safeHtml.trim()) {
    return [{ title, htmlContent: safeHtml, paragraphs: paragraphs.length > 0 ? paragraphs : ["Word document loaded."] }];
  }
  return paginateParagraphs(paragraphs, title);
}

async function parseExcelFile(file: File, title: string, onProgress?: (s: string) => void): Promise<KindlePage[]> {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (ext === "csv") {
    onProgress?.("Parsing CSV table…");
    const rows = parseCsvRows(await file.text());
    return [{ title, tableRows: rows, paragraphs: tableRowsToParagraphs(rows, title) }];
  }
  onProgress?.("Reading Excel workbook…");
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const pages: KindlePage[] = [];
  workbook.eachSheet((sheet) => {
    const rows: string[][] = [];
    sheet.eachRow((row) => {
      const vals = (row.values as unknown[]).slice(1).map((v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object" && "text" in v) return String((v as { text: unknown }).text);
        if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "");
        return String(v);
      });
      if (vals.some((c) => c.trim().length > 0)) rows.push(vals.map((c) => c.trim()));
    });
    pages.push({
      title: `${title} — ${sheet.name}`,
      tableRows: rows,
      paragraphs: tableRowsToParagraphs(rows, sheet.name),
    });
  });
  return pages.length > 0 ? pages : [{ title, paragraphs: ["Empty spreadsheet."] }];
}

async function parseEpubFile(file: File, title: string, onProgress?: (s: string) => void): Promise<KindlePage[]> {
  onProgress?.("Opening e-book chapters…");
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  const opfPath = containerXml?.match(/full-path="([^"]+)"/)?.[1];
  const chapterPaths: string[] = [];
  if (opfPath && zip.file(opfPath)) {
    const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
    const opfXml = await zip.file(opfPath)!.async("string");
    const doc = new DOMParser().parseFromString(opfXml, "application/xml");
    const manifest = new Map<string, string>();
    doc.querySelectorAll("manifest > item").forEach((item) => {
      const id = item.getAttribute("id");
      const href = item.getAttribute("href");
      if (id && href) manifest.set(id, opfDir + href);
    });
    doc.querySelectorAll("spine > itemref").forEach((ref) => {
      const idref = ref.getAttribute("idref");
      const path = idref ? manifest.get(idref) : undefined;
      if (path) chapterPaths.push(path);
    });
  }
  const fallbackPaths = chapterPaths.length > 0
    ? chapterPaths
    : Object.keys(zip.files).filter((k) => /\.(xhtml|html|htm)$/i.test(k)).sort();
  const pages: KindlePage[] = [];
  for (let i = 0; i < fallbackPaths.length; i++) {
    const entry = zip.file(fallbackPaths[i] ?? "");
    if (!entry) continue;
    onProgress?.(`Loading chapter ${i + 1} of ${fallbackPaths.length}…`);
    const html = await entry.async("string");
    const paragraphs = stripHtmlToParagraphs(html);
    if (paragraphs.length > 0) {
      pages.push(...paginateParagraphs(paragraphs, `Chapter ${pages.length + 1}`));
    }
  }
  return pages.length > 0 ? pages : [{ title, paragraphs: ["No readable chapters found in this EPUB file."] }];
}

export async function runImageOcr(
  imageUrl: string,
  onProgress?: (s: string) => void,
): Promise<string[]> {
  onProgress?.("Scanning image text (OCR)…");
  const Tesseract = await import("tesseract.js");
  const result = await Tesseract.recognize(imageUrl, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(`Scanning image text… ${Math.round(m.progress * 100)}%`);
      }
    },
  });
  const paragraphs = result.data.text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return paragraphs.length > 0
    ? paragraphs
    : ["Image loaded. No clear printed text was detected automatically — you can still view the image above."];
}

export async function parseKindleFile(
  file: File,
  onProgress?: (status: string) => void,
): Promise<KindleDocument> {
  if (!file || file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_KINDLE_FILE_BYTES) {
    throw new Error("File is larger than 50 MB. Please choose a smaller file.");
  }
  const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || file.name;
  const format = detectFileFormat(file.name, file.type);
  let pages: KindlePage[];
  let cleanup: (() => void) | undefined;

  if (format === "pdf") {
    const pdfResult = await parsePdfFile(file, title, onProgress);
    pages = pdfResult.pages;
    cleanup = pdfResult.cleanup;
  } else if (format === "word") {
    pages = await parseWordFile(file, title, onProgress);
  } else if (format === "excel") {
    pages = await parseExcelFile(file, title, onProgress);
  } else if (format === "epub") {
    pages = await parseEpubFile(file, title, onProgress);
  } else if (format === "image") {
    const imageUrl = URL.createObjectURL(file);
    const paragraphs = await runImageOcr(imageUrl, onProgress);
    pages = [{ title, imageUrl, paragraphs }];
  } else {
    onProgress?.("Reading text file…");
    const raw = await file.text();
    const ext = file.name.toLowerCase().split(".").pop() ?? "";
    const paragraphs =
      ext === "html" || ext === "htm"
        ? stripHtmlToParagraphs(raw)
        : raw.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
    pages = paginateParagraphs(paragraphs, title);
  }

  return {
    id: `doc-${Date.now()}`,
    title,
    fileName: file.name,
    format,
    pages,
    wordCount: countWords(pages),
    ...(cleanup ? { cleanup } : {}),
  };
}