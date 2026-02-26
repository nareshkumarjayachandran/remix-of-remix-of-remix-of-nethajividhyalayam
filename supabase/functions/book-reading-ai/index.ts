import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, chapterTitle, chapterType, grade, curriculum } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate_content") {
      systemPrompt = `You are an expert English textbook content creator for Indian school students (${curriculum} curriculum, ${grade} grade).
Generate age-appropriate reading content for the chapter. Return ONLY valid JSON.`;
      
      userPrompt = `Generate content for the chapter: "${chapterTitle}" (type: ${chapterType}) for ${grade} grade students.

Return JSON with this exact structure:
{
  "sentences": ["sentence1", "sentence2", ...],
  "tamilTranslations": ["தமிழ் translation1", "தமிழ் translation2", ...],
  "vocabulary": [{"word": "english_word", "tamil": "தமிழ் word", "meaning": "simple meaning"}]
}

Rules:
- Generate 6-10 sentences appropriate for ${grade} level
- For poems/rhymes: keep the rhyming structure
- For stories: create a simple narrative with a moral
- For lessons: create informative, educational sentences
- Tamil translations must be natural and culturally appropriate (Google Translate quality or better)
- Vocabulary: 4-6 key words from the content
- Keep language simple for the grade level
- Each sentence should be clear, complete, and educational`;
    } else if (action === "word_meaning") {
      const { word, sentence } = await req.json();
      systemPrompt = `You are a bilingual English-Tamil dictionary for school students. Give clear, simple meanings.`;
      userPrompt = `Give the Tamil meaning and simple English explanation for the word "${word}" in the context: "${sentence}".
Return JSON: {"word": "${word}", "tamil": "தமிழ் meaning", "meaning": "simple English meaning", "example": "example sentence"}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("book-reading-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
