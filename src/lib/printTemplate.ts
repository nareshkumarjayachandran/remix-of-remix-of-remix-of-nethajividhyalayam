// Utility to generate printable/downloadable HTML documents for form submissions

interface FieldGroup {
  heading: string;
  fields: { label: string; value: string }[];
}

interface PrintTemplateOptions {
  title: string;
  subtitle?: string;
  fieldGroups: FieldGroup[];
  schoolName?: string;
  schoolAddress?: string;
  showLogo?: boolean;
  receiptMode?: boolean;
  receiptDetails?: {
    referenceId: string;
    paymentMethod: string;
    amount?: string;
  };
}

const fetchLogoBase64 = async (): Promise<string> => {
  try {
    const response = await fetch(`${window.location.origin}/nethaji_logo_print.webp`);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(`${window.location.origin}/nethaji_logo_print.webp`);
      reader.readAsDataURL(blob);
    });
  } catch {
    return `${window.location.origin}/nethaji_logo_print.webp`;
  }
};

const generateHTML = (options: PrintTemplateOptions, logoDataUri: string): string => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const schoolName = options.schoolName || "Nethaji Vidhyalayam";
  const schoolAddress = options.schoolAddress || "5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129";

  const fieldGroupsHTML = options.fieldGroups
    .map(
      (group) => `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:15px;font-weight:bold;color:#1a3a5c;border-bottom:2px solid #d4a843;padding-bottom:6px;margin-bottom:12px;">${group.heading}</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${group.fields
            .map(
              (f) => `
            <tr>
              <td style="padding:6px 10px;font-weight:600;color:#333;width:40%;border-bottom:1px solid #eee;font-size:13px;">${f.label}</td>
              <td style="padding:6px 10px;color:#555;border-bottom:1px solid #eee;font-size:13px;">${f.value || "—"}</td>
            </tr>`
            )
            .join("")}
        </table>
      </div>`
    )
    .join("");

  const receiptHTML = options.receiptMode && options.receiptDetails
    ? `<div style="margin-bottom:20px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;">
        <h3 style="font-size:15px;font-weight:bold;color:#166534;margin-bottom:8px;">Payment Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 10px;font-weight:600;width:40%;font-size:13px;">Reference / Transaction ID</td><td style="padding:4px 10px;font-size:13px;">${options.receiptDetails.referenceId}</td></tr>
          <tr><td style="padding:4px 10px;font-weight:600;font-size:13px;">Payment Method</td><td style="padding:4px 10px;font-size:13px;">${options.receiptDetails.paymentMethod}</td></tr>
          ${options.receiptDetails.amount ? `<tr><td style="padding:4px 10px;font-weight:600;font-size:13px;">Amount Paid</td><td style="padding:4px 10px;font-size:13px;">₹${options.receiptDetails.amount}</td></tr>` : ""}
        </table>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${options.title} - ${schoolName}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #fff; color: #333; }
  </style>
</head>
<body>
  <div style="max-width:700px;margin:0 auto;border:2px solid #1a3a5c;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#1a3a5c;color:#fff;padding:20px;display:flex;align-items:center;gap:16px;">
      <img src="${logoDataUri}" alt="${schoolName} Logo" style="width:auto;height:100%;max-height:120px;min-width:60px;object-fit:contain;image-rendering:-webkit-optimize-contrast;filter:brightness(1.1) contrast(1.05);" />
      <div style="flex:1;">
        <h1 style="margin:0;font-size:22px;letter-spacing:1px;">${schoolName}</h1>
        <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">${schoolAddress}</p>
        <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">Phone: +91 9841594945 / 6380967675 | Email: nethajividhyalayam@gmail.com</p>
      </div>
    </div>

    <!-- Title Bar -->
    <div style="background:#d4a843;padding:10px 20px;text-align:center;">
      <h2 style="margin:0;font-size:17px;color:#1a3a5c;text-transform:uppercase;letter-spacing:1px;">${options.title}</h2>
      ${options.subtitle ? `<p style="margin:4px 0 0;font-size:12px;color:#1a3a5c;">${options.subtitle}</p>` : ""}
    </div>

    <!-- Date/Time -->
    <div style="padding:12px 24px;display:flex;justify-content:space-between;font-size:12px;color:#666;border-bottom:1px solid #eee;">
      <span><strong>Date:</strong> ${dateStr}</span>
      <span><strong>Time:</strong> ${timeStr}</span>
    </div>

    <!-- Content -->
    <div style="padding:20px 24px;">
      ${receiptHTML}
      ${fieldGroupsHTML}
    </div>

    <!-- Footer -->
    <div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee;">
      <p style="margin:0;">This is a computer-generated document from ${schoolName}.</p>
      <p style="margin:4px 0 0;">Generated on ${dateStr} at ${timeStr}</p>
    </div>
  </div>

  <!-- Print/Download buttons -->
  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="background:#1a3a5c;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:14px;cursor:pointer;margin:0 6px;">🖨️ Print</button>
    <button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:14px;cursor:pointer;margin:0 6px;">✕ Close</button>
  </div>
</body>
</html>`;
};

export const openPrintableTemplate = async (options: PrintTemplateOptions) => {
  const logoDataUri = await fetchLogoBase64();
  const html = generateHTML(options, logoDataUri);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

// Build formatted email message from field groups
export const buildEmailMessage = (title: string, fieldGroups: FieldGroup[]): string => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  let msg = `${title}\nDate: ${dateStr} | Time: ${timeStr}\n${"=".repeat(40)}\n\n`;
  for (const group of fieldGroups) {
    msg += `--- ${group.heading} ---\n`;
    for (const f of group.fields) {
      msg += `${f.label}: ${f.value || "N/A"}\n`;
    }
    msg += "\n";
  }
  return msg;
};
