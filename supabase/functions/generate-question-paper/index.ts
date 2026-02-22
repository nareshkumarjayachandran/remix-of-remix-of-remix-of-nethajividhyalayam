import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { grade, subject, examType, term, language, totalMarks, includeAnswerKey, topics, randomSeed = Math.random() } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const langInstruction =
      language === "Tamil"
        ? "Write ALL content ONLY in Tamil script (தமிழ் மட்டுமே). ZERO English words allowed."
        : language === "Bilingual"
        ? "Write every question in English first, then Tamil translation in parentheses."
        : "Write ALL content ONLY in clear English. No Tamil script.";

    // Marks distribution based on exam type
    const marksConfig: Record<string, { partA: number; partB: number; partC: number; partD: number }> = {
      Midterm:      { partA: 10, partB: 10, partC: 15, partD: 15 },
      Quarterly:    { partA: 15, partB: 15, partC: 20, partD: 25 },
      "Half-Yearly":{ partA: 15, partB: 20, partC: 25, partD: 15 },
      Annual:       { partA: 20, partB: 20, partC: 30, partD: 30 },
    };
    const marks = marksConfig[examType] || marksConfig["Quarterly"];
    const total = totalMarks || (marks.partA + marks.partB + marks.partC + marks.partD);

    // Subject-specific diagram/map instructions
    const diagramInstructions = (() => {
      const sub = subject.toLowerCase();
      if (sub.includes("science") || sub === "evs/science") {
        return `Include 1-2 DIAGRAM questions in Part D. Topics like: parts of plant, human body systems, water cycle, solar system, food chain, electric circuit. Provide SVG-compatible label descriptions. Each diagram question should list 4-6 labels to identify.`;
      }
      if (sub.includes("social") || sub === "social studies") {
        return `Include 1 MAP-BASED question in Part D. For India maps: mark states, rivers, mountains, or cities. For world maps: mark continents, oceans, or countries. Provide clear location descriptions for each point to mark. Also include 1 timeline/chart question if relevant.`;
      }
      if (sub === "maths") {
        return `Include geometry/shape-based questions where students draw or identify shapes, angles, or graphs. Include word problems that could benefit from diagrams.`;
      }
      return `Include visual/diagram-based questions where appropriate for the subject.`;
    })();

    const systemPrompt = `You are an expert question paper creator for Nethaji Vidhyalayam school following Tamil Nadu Samacheer Kalvi curriculum (1st to 5th Standard). You create professional, exam-ready question papers with:

- Perfect alignment with Samacheer Kalvi textbooks for the specified grade, subject, and term
- Age-appropriate difficulty progression across paper sections
- Proper marks allocation and time management
- Rich variety: MCQ, fill-in-blanks, true/false, match-the-following, short answers, long answers, diagrams, maps
- For Tamil: proper இலக்கணம், செய்யுள், உரைநடை questions
- For English: grammar, comprehension, vocabulary, letter/essay writing
- For Maths: computation, word problems, geometry, data handling
- For Science: concepts, experiments, diagrams (plant, body, solar system, water cycle)
- For Social Studies: maps (India/world), timelines, civics, geography
- For Hindi: basic vocabulary, simple sentences, matching
- For GK: current affairs, national symbols, famous personalities, sports

Your papers are print-ready, professionally formatted, and include complete answer keys with all options explained.`;

    const variationSeed = Math.floor(randomSeed * 1000000);

    const userPrompt = `Create a complete ${examType} Examination Question Paper for:

School: Nethaji Vidhyalayam, Chennai
Grade: ${grade}
Subject: ${subject}
Term: ${term}
Total Marks: ${total}
Time: ${examType === "Midterm" ? "1½ Hours" : examType === "Quarterly" ? "2 Hours" : "2½ Hours"}
Language: ${language} — ${langInstruction}
Topics to cover: ${topics || "All topics from " + term}
Variation seed: ${variationSeed}

${diagramInstructions}

Return ONLY valid JSON (no markdown, no code blocks):

{
  "title": "Nethaji Vidhyalayam - ${examType} Examination ${new Date().getFullYear()}-${new Date().getFullYear() + 1}",
  "subtitle": "${subject} - Class ${grade}",
  "examType": "${examType}",
  "totalMarks": ${total},
  "duration": "${examType === "Midterm" ? "1½ Hours" : examType === "Quarterly" ? "2 Hours" : "2½ Hours"}",
  "term": "${term}",
  "grade": "${grade}",
  "subject": "${subject}",
  "generalInstructions": [
    "Answer all questions.",
    "Write neatly and legibly.",
    "Read each question carefully before answering."
  ],
  "sections": [
    {
      "partLabel": "Part A",
      "type": "objective",
      "heading": "${language === "Tamil" ? "பிரிவு A: புறவயமான கேள்விகள்" : "Part A: Objective Type Questions"}",
      "marksPerQuestion": 1,
      "totalMarks": ${marks.partA},
      "instructions": "${language === "Tamil" ? "சரியான விடையைத் தேர்ந்தெடுக்கவும் / காலி இடங்களை நிரப்புக / சரியா தவறா எழுதுக" : "Choose the correct answer / Fill in the blanks / Write True or False"}",
      "subsections": [
        {
          "type": "multiple_choice",
          "heading": "${language === "Tamil" ? "I. சரியான விடையைத் தேர்க" : "I. Choose the correct answer"}",
          "questions": [
            { "id": 1, "question": "...", "options": ["a) ...", "b) ...", "c) ...", "d) ..."], "answer": "a) ...", "marks": 1 }
          ]
        },
        {
          "type": "fill_in_blanks",
          "heading": "${language === "Tamil" ? "II. காலி இடங்களை நிரப்புக" : "II. Fill in the blanks"}",
          "questions": [
            { "id": 6, "question": "... _______ ...", "answer": "...", "marks": 1 }
          ]
        },
        {
          "type": "true_false",
          "heading": "${language === "Tamil" ? "III. சரியா? தவறா?" : "III. Write True or False"}",
          "questions": [
            { "id": 9, "question": "...", "answer": "True", "marks": 1 }
          ]
        }
      ]
    },
    {
      "partLabel": "Part B",
      "type": "short",
      "heading": "${language === "Tamil" ? "பிரிவு B: குறுகிய விடை" : "Part B: Short Answer Questions"}",
      "marksPerQuestion": 2,
      "totalMarks": ${marks.partB},
      "instructions": "${language === "Tamil" ? "ஒரு அல்லது இரு வாக்கியங்களில் விடையளிக்கவும்" : "Answer in one or two sentences"}",
      "subsections": [
        {
          "type": "match_following",
          "heading": "${language === "Tamil" ? "IV. பொருத்துக" : "IV. Match the following"}",
          "questions": [
            { "id": 12, "left": ["...", "...", "..."], "right": ["...", "...", "..."], "answers": ["...", "...", "..."], "marks": 3 }
          ]
        },
        {
          "type": "short_answer",
          "heading": "${language === "Tamil" ? "V. குறுகிய விடையளிக்கவும்" : "V. Answer briefly"}",
          "questions": [
            { "id": 13, "question": "...", "answer": "...", "marks": 2 }
          ]
        }
      ]
    },
    {
      "partLabel": "Part C",
      "type": "descriptive",
      "heading": "${language === "Tamil" ? "பிரிவு C: விரிவான விடை" : "Part C: Descriptive Questions"}",
      "marksPerQuestion": 5,
      "totalMarks": ${marks.partC},
      "instructions": "${language === "Tamil" ? "விரிவாக விடையளிக்கவும்" : "Answer in detail (4-5 sentences)"}",
      "subsections": [
        {
          "type": "long_answer",
          "heading": "${language === "Tamil" ? "VI. விரிவாக விடையளிக்கவும்" : "VI. Answer in detail"}",
          "questions": [
            { "id": 18, "question": "...", "answer": "...", "marks": 5 }
          ]
        }
      ]
    },
    {
      "partLabel": "Part D",
      "type": "creative",
      "heading": "${language === "Tamil" ? "பிரிவு D: படம் / வரைபடம் / உருவாக்கம்" : "Part D: Diagram / Map / Creative"}",
      "marksPerQuestion": 5,
      "totalMarks": ${marks.partD},
      "instructions": "${language === "Tamil" ? "படம் வரைந்து பெயரிடுக / வரைபடத்தில் குறிக்கவும்" : "Draw and label / Mark on the map / Creative writing"}",
      "subsections": [
        {
          "type": "diagram",
          "heading": "${language === "Tamil" ? "VII. படம் வரைந்து பெயரிடுக" : "VII. Draw and Label"}",
          "questions": [
            { "id": 21, "question": "Draw a neat diagram of ... and label its parts", "answer": "Labels: ...", "diagramLabels": ["Part 1", "Part 2", "Part 3", "Part 4"], "diagramType": "plant|body|solar|water_cycle|map_india|map_world|geometry|custom", "marks": 5 }
          ]
        }
      ]
    }
  ],
  "answerKey": {
    "sections": [
      {
        "partLabel": "Part A",
        "answers": [
          { "id": 1, "answer": "a) correct option", "explanation": "Brief explanation" }
        ]
      }
    ]
  }
}

CRITICAL RULES:
1. Total marks across ALL parts MUST equal exactly ${total}
2. Include ${Math.max(3, Math.floor(marks.partA / 1))} MCQ questions (1 mark each) in Part A
3. Include ${Math.max(2, Math.floor(marks.partA / 3))} fill-in-blanks (1 mark each) in Part A
4. Include ${Math.max(2, Math.floor(marks.partA / 4))} true/false (1 mark each) in Part A
5. Part B: Include 1 match-the-following (${Math.min(5, Math.floor(marks.partB / 2))} items) + short answers (2 marks each)
6. Part C: Include ${Math.max(2, Math.floor(marks.partC / 5))} long answer questions (5 marks each)
7. Part D: Include diagram/map/creative questions totaling ${marks.partD} marks
8. ALL questions must be from ${subject} ${grade} ${term} Samacheer Kalvi syllabus
9. The answerKey must contain detailed answers for EVERY question with brief explanations
10. For diagram questions: always include "diagramType" field and "diagramLabels" array
11. For map questions: use diagramType "map_india" or "map_world" and include location descriptions
12. Questions should progress from easy (Part A) to challenging (Part D)
13. ${language === "Tamil" ? "EVERY word must be Tamil script only" : language === "Bilingual" ? "Both English and Tamil for every question" : "Pure English only"}`;

    const messagePayload = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    const temperature = 0.7;

    const callGroq = async (model: string): Promise<Response> => {
      return await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: messagePayload, stream: false, temperature, max_tokens: 4000 }),
      });
    };

    const callLovable = async (): Promise<Response> => {
      return await fetch("https://api.lovable.app/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: messagePayload, stream: false, temperature, max_tokens: 4000 }),
      });
    };

    let response: Response | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await callGroq("llama-3.1-8b-instant");
      if (response.status !== 429) break;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 8000));
      } else {
        if (LOVABLE_API_KEY) {
          response = await callLovable();
          if (!response.ok) {
            return new Response(
              JSON.stringify({ error: "AI generation failed after all retries." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          break;
        } else {
          return new Response(
            JSON.stringify({ error: "AI is busy. Please wait and try again." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!response!.ok) {
      const errText = await response!.text();
      console.error("AI API error:", response!.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response!.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let paper;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      paper = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse question paper. Please regenerate." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ paper }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-question-paper error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
