import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCHOOL_EMAIL = "nethajividhyalayam@gmail.com";
const SCHOOL_NAME = "Nethaji Vidhyalayam Nursery and Primary School";
const SCHOOL_ADDRESS = "5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129";
const SCHOOL_PHONE = "+91 9841594945 / +91 6380967675";
const SCHOOL_PHONE_LINKS =
  '<a href="tel:+919841594945" style="color:#1e40af;text-decoration:underline;">+91 9841594945</a>' +
  ' / ' +
  '<a href="tel:+916380967675" style="color:#1e40af;text-decoration:underline;">6380967675</a>';

interface FieldGroup {
  heading: string;
  fields: { label: string; value: string }[];
}

interface FormEmailRequest {
  formType: "contact" | "admission" | "fee_payment" | "career";
  title: string;
  subtitle?: string;
  fieldGroups: FieldGroup[];
  senderName: string;
  senderEmail?: string;
  resumeUrl?: string;
  resumeStoragePath?: string;
  resumeFileName?: string;
  resumeMimeType?: string;
  receiptDetails?: {
    referenceId: string;
    paymentMethod: string;
    amount?: string;
  };
}

function buildFieldGroupsHTML(fieldGroups: FieldGroup[]): string {
  return fieldGroups
    .map(
      (group) => `
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:bold;color:#1a3a5c;border-bottom:2px solid #d4a843;padding-bottom:6px;margin:0 0 12px 0;">${group.heading}</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${group.fields
            .map(
              (f) => `
            <tr>
              <td style="padding:8px 12px;font-weight:600;color:#333;width:40%;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${f.label}</td>
              <td style="padding:8px 12px;color:#555;border-bottom:1px solid #eee;font-size:13px;">${f.value || "—"}</td>
            </tr>`
            )
            .join("")}
        </table>
      </div>`
    )
    .join("");
}

function buildReceiptHTML(details: FormEmailRequest["receiptDetails"]): string {
  if (!details) return "";
  return `
    <div style="margin-bottom:24px;padding:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;">
      <h3 style="font-size:15px;font-weight:bold;color:#166534;margin:0 0 12px 0;">💳 Payment Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 12px;font-weight:600;width:40%;font-size:13px;">Reference / Transaction ID</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;">${details.referenceId}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600;font-size:13px;">Payment Method</td><td style="padding:6px 12px;font-size:13px;">${details.paymentMethod}</td></tr>
        ${details.amount ? `<tr><td style="padding:6px 12px;font-weight:600;font-size:13px;">Amount Paid</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;color:#166534;">₹${details.amount}</td></tr>` : ""}
      </table>
    </div>`;
}




function buildResumeBlock(hasResume: boolean, resumeFileName?: string): string {
  if (!hasResume) return "";
  return `
    <div style="margin-bottom:24px;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
      <h3 style="font-size:15px;font-weight:bold;color:#1e40af;margin:0 0 10px 0;">📎 Resume Attached</h3>
      <p style="font-size:13px;color:#333;margin:0;">The applicant's resume (<strong>${resumeFileName || "resume"}</strong>) is attached to this email as a file.</p>
    </div>`;
}

async function fetchResumeAttachment(storagePath: string, resumeFileName: string, mimeType: string) {
  const { data, error } = await supabaseAdmin.storage.from("resumes").download(storagePath);
  if (error || !data) {
    console.error("Failed to download resume:", error);
    return null;
  }
  const arrayBuffer = await data.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return {
    filename: resumeFileName,
    content: base64,
    content_type: mimeType,
  };
}

function buildAdmissionFormHeader(req: FormEmailRequest, dateStr: string): string {
  if (req.formType !== "admission") return "";
  return `
    <div style="text-align:center;margin:0 0 18px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#1a3a5c;margin-bottom:8px;">
        <span><strong>Date:</strong> ${dateStr}</span>
        <span style="margin-left:auto;"><strong>FORM NO:</strong> ${req.subtitle || "—"}</span>
      </div>
      <h2 style="display:inline-block;margin:0;padding:6px 28px;border:2px solid #c0392b;color:#c0392b;font-size:18px;letter-spacing:3px;border-radius:4px;">ADMISSION FORM</h2>
    </div>`;
}

function buildAdmissionFormFooter(req: FormEmailRequest): string {
  if (req.formType !== "admission") return "";
  const cell = "border:1px solid #1a3a5c;padding:22px 10px 8px;font-size:12px;color:#1a3a5c;text-align:center;width:25%;";
  return `
    <div style="text-align:right;margin:24px 0 18px;font-size:12px;color:#1a3a5c;">
      <div style="display:inline-block;border-top:1px solid #1a3a5c;padding-top:4px;min-width:180px;text-align:center;">Signature of Parent</div>
    </div>
    <div style="border:2px solid #c0392b;border-radius:6px;padding:12px;">
      <h3 style="margin:0 0 10px;text-align:center;color:#c0392b;font-size:14px;letter-spacing:2px;">FOR OFFICE USE ONLY</h3>
      <table style="width:100%;border-collapse:collapse;"><tr>
        <td style="${cell}">Admission No</td><td style="${cell}">Date of Admission</td>
        <td style="${cell}">Principal Signature</td><td style="${cell}">Correspondent Signature</td>
      </tr></table>
    </div>`;
}

function buildSchoolEmail(req: FormEmailRequest, dateStr: string, timeStr: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:650px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;border:2px solid #1a3a5c;">
    <div style="background:#1a3a5c;color:#fff;padding:20px;">
      <table role="presentation" style="width:100%;border-collapse:collapse;"><tr>
        <td style="width:110px;vertical-align:middle;">
          <img src="https://nethavidhyalayam.lovable.app/nethaji_logo_print.webp" alt="School Logo" width="100" style="display:block;width:100px;height:auto;" />
        </td>
        <td style="vertical-align:middle;padding-left:16px;">
          <h1 style="margin:0;font-size:20px;letter-spacing:1px;color:#ffffff;">${SCHOOL_NAME.toUpperCase()}</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#ffffff;">${SCHOOL_ADDRESS}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#ffffff;">Phone: ${SCHOOL_PHONE} | Email: ${SCHOOL_EMAIL}</p>
        </td>
      </tr></table>
      <div style="border-top:1px solid rgba(255,255,255,0.4);margin:14px auto 0;padding-top:12px;text-align:center;">
        <h2 style="margin:0;font-size:18px;color:#ffffff;">📋 ${req.title}</h2>
        ${req.subtitle ? `<p style="margin:4px 0 0;font-size:14px;color:#ffffff;">${req.subtitle}</p>` : ""}
      </div>
    </div>
    <div style="background:#d4a843;padding:10px 20px;display:flex;justify-content:space-between;font-size:12px;color:#1a3a5c;">
      <span><strong>Date:</strong> ${dateStr}</span>
      <span style="margin-left:auto;"><strong>Time:</strong> ${timeStr}</span>
    </div>
    <div style="padding:24px;">
      <p style="font-size:14px;color:#333;margin:0 0 20px;">New submission received from the website. A printable copy is attached.</p>
      ${buildResumeBlock(!!req.resumeStoragePath, req.resumeFileName)}
      ${buildReceiptHTML(req.receiptDetails)}
      ${buildAdmissionFormHeader(req, dateStr)}
      ${buildFieldGroupsHTML(req.fieldGroups)}
      ${buildAdmissionFormFooter(req)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee;">
      <p style="margin:0;">This is an automated email from ${SCHOOL_NAME} website.</p>
      <p style="margin:4px 0 0;">Received on ${dateStr} at ${timeStr}</p>
    </div>
  </div>
</body></html>`;
}

function getThankYouMessage(formType: string): { heading: string; body: string } {
  switch (formType) {
    case "contact":
      return {
        heading: "Thank You for Contacting Us!",
        body: "We have received your message and our team will get back to you within 24 hours. A copy of your submission is attached for your records.",
      };
    case "admission":
      return {
        heading: "Admission Application Received!",
        body: "Thank you for applying to Nethaji Vidhyalayam. Our admissions team will review it and contact you shortly. A copy of the application is attached for your records.",
      };
    case "fee_payment":
      return {
        heading: "Fee Payment Confirmation",
        body: "Thank you for your fee payment. Please keep the attached receipt for your records. Our accounts team will verify and confirm the payment.",
      };
    case "career":
      return {
        heading: "Application Received — Career Inquiry",
        body: "Thank you for your interest in joining Nethaji Vidhyalayam. Our HR team will review your application and contact you soon. A copy is attached for your records.",
      };
    default:
      return { heading: "Thank You!", body: "We have received your submission. A copy is attached." };
  }
}

function buildParentEmail(req: FormEmailRequest, dateStr: string, timeStr: string): string {
  const thankYou = getThankYouMessage(req.formType);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:650px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;border:2px solid #1a3a5c;">
    <div style="background:#1a3a5c;color:#fff;padding:20px;">
      <table role="presentation" style="width:100%;border-collapse:collapse;"><tr>
        <td style="width:110px;vertical-align:middle;">
          <img src="https://nethavidhyalayam.lovable.app/nethaji_logo_print.webp" alt="School Logo" width="100" style="display:block;width:100px;height:auto;" />
        </td>
        <td style="vertical-align:middle;padding-left:16px;">
          <h1 style="margin:0;font-size:20px;letter-spacing:1px;color:#ffffff;">${SCHOOL_NAME.toUpperCase()}</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#ffffff;">${SCHOOL_ADDRESS}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#ffffff;">Phone: ${SCHOOL_PHONE} | Email: ${SCHOOL_EMAIL}</p>
        </td>
      </tr></table>
    </div>
    <div style="background:#d4a843;padding:10px 20px;text-align:center;">
      <h2 style="margin:0;font-size:16px;color:#1a3a5c;text-transform:uppercase;letter-spacing:1px;">${req.title}</h2>
    </div>
    <div style="padding:24px;">
      <p style="font-size:16px;font-weight:bold;color:#1a3a5c;margin:0 0 8px;">Dear ${req.senderName},</p>
      <h2 style="font-size:18px;color:#1a3a5c;margin:0 0 8px;">${thankYou.heading}</h2>
      <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 20px;">${thankYou.body}</p>
      
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;border:1px solid #e9ecef;">
        <h3 style="font-size:14px;color:#1a3a5c;margin:0 0 4px;">📄 Your Submission Summary</h3>
        <p style="font-size:11px;color:#888;margin:0 0 16px;">Date: ${dateStr} | Time: ${timeStr}</p>
        ${buildReceiptHTML(req.receiptDetails)}
        ${buildAdmissionFormHeader(req, dateStr)}
        ${buildFieldGroupsHTML(req.fieldGroups)}
        ${buildAdmissionFormFooter(req)}
      </div>
      
      <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
        <p style="font-size:13px;color:#1e40af;margin:0;"><strong>📞 Need Help?</strong></p>
        <p style="font-size:12px;color:#1e40af;margin:4px 0 0;">Call us at ${SCHOOL_PHONE_LINKS} or email ${SCHOOL_EMAIL}</p>
      </div>
    </div>
    <div style="background:#1a3a5c;color:#fff;padding:16px 24px;text-align:center;font-size:11px;">
      <p style="margin:0;opacity:0.9;">${SCHOOL_NAME}</p>
      <p style="margin:4px 0 0;opacity:0.7;">${SCHOOL_ADDRESS}</p>
      <p style="margin:4px 0 0;opacity:0.6;">This is a computer-generated email. Please do not reply directly.</p>
    </div>
  </div>
</body></html>`;
}

function getSubjectLine(req: FormEmailRequest): string {
  switch (req.formType) {
    case "contact": return `Contact Enquiry: ${req.subtitle || "New Message"}`;
    case "admission": return `Admission Application: ${req.subtitle || "New Application"}`;
    case "fee_payment": return `Fee Payment: ${req.subtitle || "Payment Recorded"}`;
    case "career": return `Career Application: ${req.subtitle || "New Application"}`;
    default: return req.title;
  }
}

function getParentSubject(req: FormEmailRequest): string {
  switch (req.formType) {
    case "contact": return `Thank you for contacting ${SCHOOL_NAME}`;
    case "admission": return `Admission Application Received — ${SCHOOL_NAME}`;
    case "fee_payment": return `Fee Payment Receipt — ${SCHOOL_NAME}`;
    case "career": return `Career Application Received — ${SCHOOL_NAME}`;
    default: return `Confirmation from ${SCHOOL_NAME}`;
  }
}




const VALID_FORM_TYPES = ["contact", "admission", "fee_payment", "career"];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: FormEmailRequest = await req.json();
    const { formType, senderName, senderEmail, fieldGroups, title } = body;

    if (!formType || !senderName || !fieldGroups || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate form type
    if (!VALID_FORM_TYPES.includes(formType)) {
      return new Response(JSON.stringify({ error: "Invalid form type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Input length validation
    if (senderName.length > 200 || title.length > 300 || (senderEmail && senderEmail.length > 255)) {
      return new Response(JSON.stringify({ error: "Input exceeds allowed length" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Email format validation
    if (senderEmail && !senderEmail.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Build attachments — only the actual resume file (no HTML attachment)
    const schoolAttachments: { filename: string; content: string; content_type: string }[] = [];

    if (body.resumeStoragePath && body.resumeFileName && body.resumeMimeType) {
      const resumeAttachment = await fetchResumeAttachment(
        body.resumeStoragePath,
        body.resumeFileName,
        body.resumeMimeType
      );
      if (resumeAttachment) {
        schoolAttachments.push(resumeAttachment);
        console.log("Resume file attached:", body.resumeFileName);
      }
    }

    const subject = getSubjectLine(body);
    const schoolHTML = buildSchoolEmail(body, dateStr, timeStr);

    // Send to school — full details in email body + resume file attached (no HTML file)
    const schoolResult = await resend.emails.send({
      from: `${SCHOOL_NAME} Website <onboarding@resend.dev>`,
      to: [SCHOOL_EMAIL],
      subject,
      html: schoolHTML,
      reply_to: senderEmail || undefined,
      attachments: schoolAttachments.length > 0 ? schoolAttachments : undefined,
    });
    console.log("School email sent:", schoolResult);

    // Send thank-you copy to parent/enquirer — no attachments, details inline
    if (senderEmail && senderEmail.includes("@")) {
      const parentHTML = buildParentEmail(body, dateStr, timeStr);
      const parentSubject = getParentSubject(body);

      const parentResult = await resend.emails.send({
        from: `${SCHOOL_NAME} <onboarding@resend.dev>`,
        to: [senderEmail],
        subject: parentSubject,
        html: parentHTML,
      });
      console.log("Parent copy sent:", parentResult);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending form email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
