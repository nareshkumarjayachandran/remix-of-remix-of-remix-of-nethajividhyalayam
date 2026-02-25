import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    // Use service role to bypass RLS – we only return safe, minimal data
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── ACTION: verify-student ──────────────────────────────
    // Returns only { verified: boolean, student_name?: string }
    if (action === "verify-student") {
      const { studentName, standard, section } = params;

      if (!studentName || !standard || !section) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Input length limits
      if (studentName.length > 200 || standard.length > 20 || section.length > 10) {
        return new Response(
          JSON.stringify({ error: "Input too long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("students")
        .select("student_name")
        .eq("standard", standard)
        .eq("section", section)
        .eq("status", "active");

      if (error) throw error;

      // Normalize for fuzzy matching
      const normalize = (s: string) =>
        s
          .toUpperCase()
          .replace(/[^A-Z\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();

      const normalizedInput = normalize(studentName);
      const match = data?.find((s) => {
        const n = normalize(s.student_name);
        return n === normalizedInput || n.includes(normalizedInput) || normalizedInput.includes(n);
      });

      return new Response(
        JSON.stringify({
          verified: !!match,
          student_name: match?.student_name ?? null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: suggest-students ────────────────────────────
    // Returns only student names for autocomplete – no PII
    if (action === "suggest-students") {
      const { studentName, standard, section } = params;

      if (!studentName || !standard || !section) {
        return new Response(
          JSON.stringify({ suggestions: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (studentName.length > 200) {
        return new Response(
          JSON.stringify({ suggestions: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("students")
        .select("student_name")
        .eq("standard", standard)
        .eq("section", section)
        .eq("status", "active");

      if (error) throw error;

      const normalize = (s: string) =>
        s
          .toUpperCase()
          .replace(/[^A-Z\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();

      const normalizedInput = normalize(studentName);
      const filtered = (data ?? []).filter(
        (s) => normalize(s.student_name) === normalizedInput
      );

      return new Response(
        JSON.stringify({
          suggestions: filtered.map((s) => ({ student_name: s.student_name })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: submit-fee-payment ──────────────────────────
    // Validates then inserts into pending_fee_payments using service role
    if (action === "submit-fee-payment") {
      const { studentName, standard, section, amount, paymentMethod, referenceId } = params;

      if (!studentName || !standard || !referenceId || !paymentMethod) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Input validation
      if (studentName.length > 200 || referenceId.length > 100 || (amount && String(amount).length > 20)) {
        return new Response(
          JSON.stringify({ error: "Input too long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase.from("pending_fee_payments").insert([
        {
          student_name: studentName.trim(),
          standard,
          section: section || "A",
          amount: amount || null,
          payment_method: paymentMethod,
          reference_id: referenceId.trim(),
          parent_email: null,
          status: "pending",
        },
      ]);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("student-fee-api error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
