import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Levenshtein distance for word-level comparison
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Compare words token-by-token, return diff with correctness flags
function compareWords(target: string, spoken: string) {
  const tw = target.toLowerCase().replace(/[^a-z\s']/g, "").split(/\s+/).filter(Boolean);
  const sw = spoken.toLowerCase().replace(/[^a-z\s']/g, "").split(/\s+/).filter(Boolean);

  const diffs: { expected: string; got: string; correct: boolean; distance: number }[] = [];
  const maxLen = Math.max(tw.length, sw.length);

  for (let i = 0; i < maxLen; i++) {
    const expected = tw[i] || "";
    const got = sw[i] || "";
    const distance = levenshtein(expected, got);
    diffs.push({ expected, got, correct: distance === 0, distance });
  }

  const correct = diffs.filter((d) => d.correct).length;
  const accuracy = tw.length > 0 ? Math.round((correct / tw.length) * 100) : 0;

  // Find most wrong word for specific feedback
  const worstMistake = diffs
    .filter((d) => !d.correct && d.expected && d.got)
    .sort((a, b) => b.distance - a.distance)[0];

  return { diffs, accuracy, worstMistake, targetWordCount: tw.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GROQ_API_KEY && !LOVABLE_API_KEY) throw new Error("No AI API key configured");

    const { targetText, spokenText, grade, topic, mode, conversationHistory, tamilMode } = await req.json();

    // Build word comparison data for practice mode
    let wordAnalysis = null;
    let accuracyScore = 0;
    if (mode === "practice" && targetText && spokenText) {
      const comparison = compareWords(targetText, spokenText);
      wordAnalysis = comparison;
      accuracyScore = comparison.accuracy;
    }

let systemPrompt = `You are "Miss Nova", a warm, patient, and encouraging English pronunciation coach for Tamil Nadu school children (LKG to 5th Grade) and IT professionals.

Your communication style:
- For LKG/UKG: VERY simple words, 1-2 short sentences, emojis, super encouraging
- For 1st/2nd grade: Simple words, 2-3 sentences, fun examples
- For 3rd/4th/5th grade: Can use slightly more detail, phonetic tips
- For IT Pro: Professional tone, detailed grammar and fluency analysis

Your job in PRACTICE MODE:
1. Use the word-level accuracy score provided (0-100%) for star rating.
2. Identify SPECIFIC mispronounced words (especially "th" sounds, "r/v" confusion, silent letters).
3. Give warm, specific feedback. Say "Great try! The word 'thank' — we say 'th' by putting tongue between teeth, not 'tank'."
4. Include a "correctWordDemo" field with the exact corrected pronunciation of the worst mistake (for TTS playback).
5. Include "wordDiffs" array showing each word and if correct.
6. Never say "Wrong" — say "Let's fix this!" or "Almost!"
7. If tamilMode: explain difficult sounds in simple Tamil.

STAR RATING (based on accuracy %, not your guess):
- 5 stars: 90-100%
- 4 stars: 75-89%
- 3 stars: 55-74%
- 2 stars: 35-54%
- 1 star: 0-34%

RESPOND ONLY IN THIS JSON FORMAT:
{
  "stars": 4,
  "feedback": "Wow! You said almost everything right! The word 'thank' — try putting your tongue between your teeth to make the 'th' sound, not 'tank'! 🌟",
  "tamilFeedback": "",
  "improvement": "Practice the 'th' sound: tongue between teeth for 'think', 'thank', 'the', 'this'.",
  "encouragement": "You are amazing! Keep going! 🏆",
  "nextWord": "",
  "correctWordDemo": "Thank you very much.",
  "wrongWord": "tank",
  "correctWord": "thank",
  "wordDiffs": []
}`;

    let userMessage = "";

    if (mode === "practice") {
      userMessage = `The child (Grade: ${grade}) was asked to say: "${targetText}"
They actually said: "${spokenText}"
Topic: ${topic}
Word-level accuracy: ${accuracyScore}%
Word analysis: ${JSON.stringify(wordAnalysis?.diffs?.slice(0, 15))}
Worst mistake: ${wordAnalysis?.worstMistake ? `said "${wordAnalysis.worstMistake.got}" instead of "${wordAnalysis.worstMistake.expected}"` : "none"}
${tamilMode ? "Please include Tamil explanation in tamilFeedback field for difficult sounds." : ""}

Use the accuracy score ${accuracyScore}% to determine star rating precisely. Give specific feedback on the worst mistake. Set correctWordDemo to a short sentence demonstrating the correct pronunciation.`;
    } else if (mode === "freespeaking") {
      systemPrompt += `\n\nYour job in FREE SPEAKING MODE:
1. The child/user speaks freely on a topic for as long as they want.
2. Analyze their speech for grammar mistakes, pronunciation issues, fluency level, and vocabulary usage.
3. Give a fluency score 0-100%.
4. List specific grammar mistakes with corrections.
5. List pronunciation issues.
6. Suggest better sentences or vocabulary.
7. Be encouraging but specific.

RESPOND ONLY IN THIS JSON FORMAT:
{
  "stars": 4,
  "feedback": "Great job speaking about your daily routine! You spoke clearly and used good vocabulary.",
  "fluencyScore": 72,
  "grammarMistakes": [{"original": "I goes to school", "corrected": "I go to school", "rule": "Subject-verb agreement"}],
  "pronunciationIssues": ["The word 'think' - try putting tongue between teeth for 'th' sound"],
  "vocabularySuggestions": ["Instead of 'very good', try 'excellent' or 'wonderful'"],
  "improvement": "Practice using past tense: 'I went' instead of 'I go yesterday'",
  "encouragement": "You spoke for a long time - that shows great confidence! 🌟",
  "tamilFeedback": ""
}`;

      userMessage = `The ${grade === "IT Pro" ? "IT professional" : `child (Grade: ${grade})`} was asked to speak freely about: "${topic}"
They said: "${spokenText}"
${tamilMode ? "Please include Tamil explanation in tamilFeedback field." : ""}

Analyze their grammar, pronunciation, fluency, and vocabulary. Give a fluencyScore (0-100). Be specific about mistakes with corrections.`;
    } else if (mode === "conversation") {
      userMessage = `You are having a friendly English conversation with a ${grade} student.
Topic: ${topic}
${tamilMode ? "If they seem confused, briefly help in Tamil in tamilFeedback." : ""}

Previous conversation:
${JSON.stringify(conversationHistory || [])}

Child just said: "${spokenText}"

Respond naturally and encouragingly. In "feedback" field, write your conversational response. In "improvement" field, gently note any pronunciation tips if needed. In "nextWord" field, write the exact text you want to say back (for TTS). Keep it age-appropriate for ${grade}.`;
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    let response: Response | null = null;

    // Primary: Groq
    if (GROQ_API_KEY) {
      try {
        response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: aiMessages,
            response_format: { type: "json_object" },
            max_tokens: 1024,
          }),
        });
        if (!response.ok) {
          console.error("Groq error:", response.status, await response.text());
          response = null;
        }
      } catch (e) {
        console.error("Groq fetch error:", e);
        response = null;
      }
    }

    // Fallback: Lovable AI
    if (!response && LOVABLE_API_KEY) {
      try {
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: aiMessages,
            response_format: { type: "json_object" },
            max_tokens: 1024,
          }),
        });
        if (!response.ok) {
          console.error("Lovable AI error:", response.status, await response.text());
          response = null;
        }
      } catch (e) {
        console.error("Lovable AI fetch error:", e);
        response = null;
      }
    }

    if (!response) {
      throw new Error("All AI services unavailable. Please try again.");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { stars: 3, feedback: content, encouragement: "Keep going! 🌟", improvement: "", nextWord: "", correctWordDemo: "" };
    }

    // Attach our computed word diffs if AI didn't provide them
    if (wordAnalysis && (!parsed.wordDiffs || !parsed.wordDiffs.length)) {
      parsed.wordDiffs = wordAnalysis.diffs;
    }
    parsed.accuracyScore = accuracyScore;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Feedback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
