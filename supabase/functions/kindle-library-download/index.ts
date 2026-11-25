import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const requestSchema = z.object({ itemId: z.string().uuid() }).strict();
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

// Public read-only endpoint: never accept a storage path from a caller.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  if (Number(req.headers.get("content-length")) > 1024) return respond({ error: "Request too large" }, 413);
  try {
    const text = await req.text();
    if (text.length > 1024) return respond({ error: "Request too large" }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return respond({ error: "Invalid request" }, 400); }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return respond({ error: "A valid library item is required" }, 400);

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return respond({ error: "Library unavailable" }, 503);
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: item, error } = await admin.from("kindle_library_items")
      .select("file_path").eq("id", parsed.data.itemId).maybeSingle();
    if (error) return respond({ error: "Library unavailable" }, 503);
    if (!item) return respond({ error: "This item is not published" }, 404);

    // Only a staff-published row can authorize a short-lived file download.
    const { data, error: signingError } = await admin.storage.from("kindle-library")
      .createSignedUrl(item.file_path, 60);
    if (signingError || !data) return respond({ error: "File unavailable" }, 404);
    return respond({ signedUrl: data.signedUrl });
  } catch {
    return respond({ error: "Library unavailable" }, 503);
  }
});