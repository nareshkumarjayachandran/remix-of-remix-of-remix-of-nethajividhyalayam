import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCHOOL_NAME = "Nethaji Vidhyalayam";
const ADMIN_EMAILS = [
  "nethajividhyalayam@gmail.com",
  "nareshkumar.jayachandran@gmail.com",
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return new Response(JSON.stringify({ error: "Missing or invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate type
    if (type && type !== "reset" && type !== "signup") {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isReset = type === "reset";
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const title = isReset ? "🔑 Password Reset Requested" : "🔔 New Staff Signup";
    const statusText = isReset ? "Password Reset Sent" : "Pending Role Assignment";
    const statusBg = isReset ? "#dbeafe" : "#fef3c7";
    const statusColor = isReset ? "#1e40af" : "#92400e";
    const actionText = isReset
      ? "A password reset link has been sent to this user. No action is required unless this was unexpected."
      : "Please log in to FeeDesk and assign the appropriate role (admin/staff) to this user.";
    const subjectLine = isReset
      ? `🔑 Password Reset: ${email}`
      : `🔔 New Staff Signup: ${email} — Role Assignment Needed`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:550px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;border:2px solid #1a3a5c;">
    <div style="background:#1a3a5c;color:#fff;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:22px;">${title}</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">${SCHOOL_NAME} — FeeDesk Management</p>
    </div>
    <div style="background:#d4a843;padding:10px 20px;display:flex;justify-content:space-between;font-size:12px;color:#1a3a5c;">
      <span><strong>Date:</strong> ${dateStr}</span>
      <span style="margin-left:auto;"><strong>Time:</strong> ${timeStr}</span>
    </div>
    <div style="padding:24px;">
      <p style="font-size:14px;color:#333;margin:0 0 16px;">${isReset ? "A user has requested a password reset on the FeeDesk system." : "A new user has registered on the FeeDesk system and is awaiting role assignment."}</p>
      <div style="background:#f8f9fa;border-radius:8px;padding:16px;border:1px solid #e9ecef;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#333;width:35%;font-size:13px;">Email</td>
            <td style="padding:8px 12px;color:#555;font-size:13px;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#333;font-size:13px;">Status</td>
            <td style="padding:8px 12px;font-size:13px;"><span style="background:${statusBg};color:${statusColor};padding:2px 8px;border-radius:4px;font-weight:600;">${statusText}</span></td>
          </tr>
        </table>
      </div>
      <div style="margin-top:20px;padding:14px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
        <p style="font-size:13px;color:#1e40af;margin:0;"><strong>⚡ ${isReset ? "Info" : "Action Required"}</strong></p>
        <p style="font-size:12px;color:#1e40af;margin:4px 0 0;">${actionText}</p>
      </div>
    </div>
    <div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee;">
      <p style="margin:0;">Automated notification from ${SCHOOL_NAME} FeeDesk</p>
    </div>
  </div>
</body></html>`;

    const result = await resend.emails.send({
      from: `${SCHOOL_NAME} FeeDesk <onboarding@resend.dev>`,
      to: ADMIN_EMAILS,
      subject: subjectLine,
      html,
    });

    console.log("Admin notification sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
