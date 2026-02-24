import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      grade, subject, examType, term, language, totalMarks,
      includeAnswerKey, topics, randomSeed = Math.random(),
      curriculum = "Samacheer Kalvi",
      questionPattern = "state_board",
      questionTypes = ["multiple_choice", "fill_in_blanks", "true_false", "match_following", "short_answer", "long_answer", "diagram"],
      hindiSyllabus = "none",
      bilingualPair = "English+Tamil",
    } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Parse bilingual pair languages
    const [biLang1, biLang2] = (bilingualPair || "English+Tamil").split("+");
    const biLangLabel2 = biLang2 === "Tamil" ? "தமிழ்" : biLang2 === "Hindi" ? "हिंदी" : "English";

    const langInstruction =
      language === "Tamil"
        ? "Write ALL content ONLY in Tamil script (தமிழ் மட்டுமே). ZERO English words allowed."
        : language === "Hindi"
        ? "Write ALL content ONLY in Hindi script (हिंदी). ZERO English words allowed."
        : language === "Bilingual"
        ? `FULLY BILINGUAL (${biLang1} + ${biLang2}): 
STRUCTURE: Write the COMPLETE ${biLang1} text FIRST, then " / ", then the COMPLETE ${biLang2} translation. 
LEFT of "/" is ALWAYS ${biLang1}. RIGHT of "/" is ALWAYS ${biLang2}.
APPLY THIS TO EVERYTHING: questions, answers, options, headings, instructions, match items.
${biLang1 === "Tamil" && biLang2 === "Hindi" ? `CORRECT: "சூரியன் கிழக்கில் உதிக்கிறது. / सूरज पूरब में उगता है।"
CORRECT MCQ: "சூரியன் / सूरज", "நிலா / चाँद"
CORRECT HEADING: "I. சரியான விடையைத் தேர்ந்தெடுக்கவும் / सही उत्तर चुनिए"
CORRECT MATCH: "பூனை / बिल्ली", "நாய் / कुत्ता"` : biLang1 === "English" ? `CORRECT: "The sun rises in the east. / ${biLang2 === "Tamil" ? "சூரியன் கிழக்கில் உதிக்கிறது." : "सूरज पूरब में उगता है।"}"
CORRECT MCQ: "Sun / ${biLang2 === "Tamil" ? "சூரியன்" : "सूरज"}", "Moon / ${biLang2 === "Tamil" ? "நிலா" : "चाँद"}"
CORRECT HEADING: "I. Choose the correct answer / ${biLang2 === "Tamil" ? "சரியான விடையைத் தேர்ந்தெடுக்கவும்" : "सही उत्तर चुनिए"}"` : `CORRECT: "${biLang1} sentence. / ${biLang2} translation."`}
WRONG: Any output where BOTH sides of "/" are in the SAME language. LEFT must be ${biLang1}, RIGHT must be ${biLang2}.
MCQ options: DO NOT include a) b) c) d) prefixes — system adds them.
TRANSLATION: Google Translate-level accuracy. Natural, grammatically perfect ${biLang2}. No labels.`
        : "Write ALL content ONLY in clear English. No Tamil script.";

    const marksConfig: Record<string, { partA: number; partB: number; partC: number; partD: number }> = {
      Midterm:      { partA: 10, partB: 10, partC: 15, partD: 15 },
      Quarterly:    { partA: 15, partB: 15, partC: 20, partD: 25 },
      "Half-Yearly":{ partA: 15, partB: 20, partC: 25, partD: 15 },
      Annual:       { partA: 20, partB: 20, partC: 30, partD: 30 },
    };
    const marks = marksConfig[examType] || marksConfig["Quarterly"];
    const total = totalMarks || (marks.partA + marks.partB + marks.partC + marks.partD);

    const isMerryBirds = curriculum === "Oxford Merry Birds";

    const curriculumInstruction = isMerryBirds
      ? `Follow Oxford Merry Birds curriculum strictly. Use activity-based pedagogy focusing on phonics, rhymes, simple stories, picture-based questions, and pattern recognition. Questions should be fun, colorful, and age-appropriate with emphasis on visual learning, tracing, coloring references, and hands-on activities. Use simpler vocabulary and shorter sentences suitable for young learners.`
      : `Follow Tamil Nadu Samacheer Kalvi curriculum strictly. Align all questions with the official Samacheer Kalvi textbooks for the specified grade, subject, and term.`;

    const patternInstruction = (() => {
      switch (questionPattern) {
        case "state_board":
          return `Follow Tamil Nadu State Board examination pattern strictly:
- Part A: Objective (1 mark each) — MCQ, Fill blanks, True/False
- Part B: Short Answer (2 marks each) — Match the following, Brief answers
- Part C: Descriptive (5 marks each) — Detailed answers, Explain in detail
- Part D: Creative/Diagram (5-10 marks each) — Draw & label, Map work, Essay
Use Roman numeral sub-headings (I, II, III...). Include "Choose the correct answer", "Fill in the blanks", "Answer briefly", "Answer in detail" style headings.`;
        case "cbse":
          return `Follow CBSE examination pattern strictly:
- Section A: Objective Type (1 mark each) — MCQ with 4 options, Fill blanks, True/False, Very Short Answer
- Section B: Short Answer Type I (2 marks each) — Answer in 30-50 words
- Section C: Short Answer Type II (3 marks each) — Answer in 50-80 words
- Section D: Long Answer (5 marks each) — Answer in 100-150 words, Diagram/Map based
Use "Section A/B/C/D" headings. Include internal choice in Section C and D ("OR" questions). Follow NCERT-aligned question framing.`;
        case "icse":
          return `Follow ICSE examination pattern strictly:
- Question 1: Compulsory (MCQ/Fill blanks/True-False, 1 mark each)
- Question 2-6: Attempt any 4 out of 6 questions with internal choice
- Short answer (3 marks), Long answer (5 marks)
Use "Question 1, Question 2..." format. Include "Attempt any four" instructions. ICSE style detailed, application-based questions.`;
        case "custom":
          return `Use a flexible examination pattern. Organize into logical sections with clear marks allocation. Include a mix of objective, short answer, and descriptive questions.`;
        default:
          return `Follow standard examination pattern with Parts A, B, C, D.`;
      }
    })();

    const diagramInstructions = (() => {
      const sub = subject.toLowerCase();
      if (!questionTypes.includes("diagram")) return "Do NOT include diagram or map questions.";
      if (sub.includes("science") || sub === "evs/science") {
        return `Include 1-2 DIAGRAM questions in Part D. Topics like: parts of plant, human body systems, water cycle, solar system, food chain, electric circuit. Provide SVG-compatible label descriptions. Each diagram question should list 4-6 labels to identify.`;
      }
      if (sub.includes("social") || sub === "social studies") {
        return `Include 1 MAP-BASED question in Part D. For India maps: mark states, rivers, mountains, or cities. For world maps: mark continents, oceans, or countries.`;
      }
      if (sub === "maths") {
        return `Include geometry/shape-based questions where students draw or identify shapes, angles, or graphs.`;
      }
      return `Include visual/diagram-based questions where appropriate for the subject.`;
    })();

    // Build part instructions based on selected question types
    const partATypes: string[] = [];
    if (questionTypes.includes("multiple_choice")) partATypes.push("Multiple Choice Questions (MCQ)");
    if (questionTypes.includes("fill_in_blanks")) partATypes.push("Fill in the Blanks");
    if (questionTypes.includes("true_false")) partATypes.push("True or False");

    const partBTypes: string[] = [];
    if (questionTypes.includes("match_following")) partBTypes.push("Match the Following");
    if (questionTypes.includes("short_answer")) partBTypes.push("Short Answer Questions");

    const partCTypes: string[] = [];
    if (questionTypes.includes("long_answer")) partCTypes.push("Long Answer / Descriptive Questions");

    const partDTypes: string[] = [];
    if (questionTypes.includes("diagram")) partDTypes.push("Diagram / Map / Creative Questions");

    const selectedTypesInstruction = `
SELECTED QUESTION TYPES (ONLY include these types):
- Part A: ${partATypes.length > 0 ? partATypes.join(", ") : "SKIP this part entirely"}
- Part B: ${partBTypes.length > 0 ? partBTypes.join(", ") : "SKIP this part entirely"}
- Part C: ${partCTypes.length > 0 ? partCTypes.join(", ") : "SKIP this part entirely"}
- Part D: ${partDTypes.length > 0 ? partDTypes.join(", ") : "SKIP this part entirely"}
If a part should be skipped, do NOT include it in the sections array. Distribute marks proportionally among included parts to total ${total} marks.`;

    const systemPrompt = `You are an expert question paper creator for Nethaji Vidhyalayam school. You create professional, exam-ready question papers.

${curriculumInstruction}

${patternInstruction}

Key requirements:
- Age-appropriate difficulty progression across paper sections
- Proper marks allocation and time management
- Rich variety of question types as specified
${isMerryBirds ? `- For Oxford Merry Birds: phonics-based questions, picture identification, rhyme completion, pattern matching, simple fill-ups, trace & write, look-and-say word exercises
- Use child-friendly language with short, simple instructions
- Include picture-based and activity-based questions wherever possible` : `- For Tamil: proper இலக்கணம், செய்யுள், உரைநடை questions
- For English: grammar, comprehension, vocabulary, letter/essay writing
- For Maths: computation, word problems, geometry, data handling
- For Science: concepts, experiments, diagrams (plant, body, solar system, water cycle)
- For Social Studies: maps (India/world), timelines, civics, geography
- For Hindi: basic vocabulary, simple sentences, matching
${subject.toLowerCase() === "hindi" && hindiSyllabus !== "none" ? `- IMPORTANT: Follow Hindi Prachar Sabha "${hindiSyllabus}" level syllabus strictly. Include questions from Hindi Prachar Sabha textbooks for ${hindiSyllabus} level - grammar (व्याकरण), comprehension (गद्यांश), letter writing (पत्र लेखन), essay (निबंध), translation (अनुवाद), and vocabulary as per the ${hindiSyllabus} curriculum.` : ""}
- For GK: current affairs, national symbols, famous personalities, sports`}

Your papers are print-ready, professionally formatted, and include complete answer keys with all options explained.`;

    const variationSeed = Math.floor(randomSeed * 1000000);

    const userPrompt = `Create a complete ${examType} Examination Question Paper for:

School: Nethaji Vidhyalayam, Chennai
Curriculum: ${curriculum}
Question Pattern: ${questionPattern === "state_board" ? "Tamil Nadu State Board" : questionPattern === "cbse" ? "CBSE" : questionPattern === "icse" ? "ICSE" : "Custom"}
Grade: ${grade}
Subject: ${subject}
Term: ${term}
Total Marks: ${total}
Time: ${examType === "Midterm" ? "1½ Hours" : examType === "Quarterly" ? "2 Hours" : "2½ Hours"}
Language: ${language} — ${langInstruction}
Topics to cover: ${topics || "All topics from " + term}
${subject.toLowerCase() === "hindi" && hindiSyllabus !== "none" ? `Hindi Syllabus: Hindi Prachar Sabha - ${hindiSyllabus} level` : ""}
Variation seed: ${variationSeed}

${selectedTypesInstruction}

${diagramInstructions}

Return ONLY valid JSON (no markdown, no code blocks):

{
  "title": "Nethaji Vidhyalayam - ${examType} Examination ${new Date().getFullYear()}-${new Date().getFullYear() + 1}",
  "subtitle": "${subject} - Class ${grade} (${curriculum})",
  "examType": "${examType}",
  "totalMarks": ${total},
  "duration": "${examType === "Midterm" ? "1½ Hours" : examType === "Quarterly" ? "2 Hours" : "2½ Hours"}",
  "term": "${term}",
  "grade": "${grade}",
  "subject": "${subject}",
  "curriculum": "${curriculum}",
  "generalInstructions": [
    "Answer all questions.",
    "Write neatly and legibly.",
    "Read each question carefully before answering."
  ],
  "sections": [
    {
      "partLabel": "Part A",
      "type": "objective",
      "heading": "Part A: Objective Type Questions",
      "marksPerQuestion": 1,
      "totalMarks": <calculated>,
      "instructions": "Choose the correct answer / Fill in the blanks / Write True or False",
      "subsections": [
        {
          "type": "multiple_choice",
          "heading": "I. ${biLang1 === "English" ? `Choose the correct answer / ${biLang2 === "Tamil" ? "சரியான விடையைத் தேர்ந்தெடுக்கவும்" : biLang2 === "Hindi" ? "सही उत्तर चुनिए" : "Choose the correct answer"}` : biLang1 === "Tamil" ? `சரியான விடையைத் தேர்ந்தெடுக்கவும் / ${biLang2 === "Hindi" ? "सही उत्तर चुनिए" : "Choose the correct answer"}` : "Choose the correct answer"}",
          "questions": [
            { "id": 1, "question": "${biLang1} question text / ${biLang2} translation", "options": ["${biLang1} option / ${biLang2} option", "..."], "answer": "${biLang1} answer / ${biLang2} answer", "marks": 1 }
          ]
        },
        {
          "type": "fill_in_blanks",
          "heading": "II. ${biLang1 === "English" ? `Fill in the blanks / ${biLang2 === "Tamil" ? "கோடிட்ட இடங்களை நிரப்புக" : biLang2 === "Hindi" ? "रिक्त स्थान भरिए" : "Fill in the blanks"}` : biLang1 === "Tamil" ? `கோடிட்ட இடங்களை நிரப்புக / ${biLang2 === "Hindi" ? "रिक्त स्थान भरिए" : "Fill in the blanks"}` : "Fill in the blanks"}",
          "questions": [
            { "id": 6, "question": "${biLang1} _______ text / ${biLang2} _______ text", "answer": "${biLang1} answer / ${biLang2} answer", "marks": 1 }
          ]
        },
        {
          "type": "true_false",
          "heading": "III. ${biLang1 === "English" ? `True or False / ${biLang2 === "Tamil" ? "சரியா? தவறா?" : biLang2 === "Hindi" ? "सही या गलत?" : "True or False"}` : biLang1 === "Tamil" ? `சரியா? தவறா? / ${biLang2 === "Hindi" ? "सही या गलत?" : "True or False"}` : "True or False"}",
          "questions": [
            { "id": 9, "question": "${biLang1} statement / ${biLang2} statement", "answer": "True", "marks": 1 }
          ]
        }
      ]
    },
    {
      "partLabel": "Part B",
      "type": "short",
      "heading": "Part B: ${biLang1 === "English" ? `Short Answer Questions / ${biLang2 === "Tamil" ? "சிறு விடை வினாக்கள்" : biLang2 === "Hindi" ? "संक्षिप्त उत्तर प्रश्न" : "Short Answer Questions"}` : biLang1 === "Tamil" ? `சிறு விடை வினாக்கள் / ${biLang2 === "Hindi" ? "संक्षिप्त उत्तर प्रश्न" : "Short Answer Questions"}` : "Short Answer Questions"}",
      "marksPerQuestion": 2,
      "totalMarks": <calculated>,
      "instructions": "${biLang1 === "English" ? `Answer in one or two sentences / ${biLang2 === "Tamil" ? "ஓரிரு வாக்கியங்களில் விடையளிக்கவும்" : biLang2 === "Hindi" ? "एक या दो वाक्यों में उत्तर दीजिए" : "Answer in one or two sentences"}` : biLang1 === "Tamil" ? `ஓரிரு வாக்கியங்களில் விடையளிக்கவும் / ${biLang2 === "Hindi" ? "एक या दो वाक्यों में उत्तर दीजिए" : "Answer in one or two sentences"}` : "Answer in one or two sentences"}",
      "subsections": [
        {
          "type": "match_following",
          "heading": "IV. ${biLang1 === "English" ? `Match the following / ${biLang2 === "Tamil" ? "பொருத்துக" : biLang2 === "Hindi" ? "मिलान कीजिए" : "Match the following"}` : biLang1 === "Tamil" ? `பொருத்துக / ${biLang2 === "Hindi" ? "मिलान कीजिए" : "Match the following"}` : "Match the following"}",
          "questions": [
            { "id": 12, "left": ["${biLang1} item / ${biLang2} item", "..."], "right": ["${biLang1} match / ${biLang2} match", "..."], "answers": ["${biLang1} answer / ${biLang2} answer", "..."], "marks": 3 }
          ]
        },
        {
          "type": "short_answer",
          "heading": "V. Answer briefly",
          "questions": [
            { "id": 13, "question": "...", "answer": "...", "marks": 2 }
          ]
        }
      ]
    },
    {
      "partLabel": "Part C",
      "type": "descriptive",
      "heading": "Part C: Descriptive Questions",
      "marksPerQuestion": 5,
      "totalMarks": <calculated>,
      "instructions": "Answer in detail (4-5 sentences)",
      "subsections": [
        {
          "type": "long_answer",
          "heading": "VI. Answer in detail",
          "questions": [
            { "id": 18, "question": "...", "answer": "...", "marks": 5 }
          ]
        }
      ]
    },
    {
      "partLabel": "Part D",
      "type": "creative",
      "heading": "Part D: Diagram / Map / Creative",
      "marksPerQuestion": 5,
      "totalMarks": <calculated>,
      "instructions": "Draw and label / Mark on the map / Creative writing",
      "subsections": [
        {
          "type": "diagram",
          "heading": "VII. Draw and Label",
          "questions": [
            { "id": 21, "question": "Draw a neat diagram of a plant and label its parts", "answer": "Labels: Flower, Leaf, Stem, Root", "diagramLabels": ["Flower", "Leaf", "Stem", "Root"], "diagramType": "plant", "marks": 5 }
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
1. Total marks across ALL included parts MUST equal exactly ${total}
2. ONLY include the question types specified in SELECTED QUESTION TYPES above
3. If a part has no selected types, OMIT it entirely from sections array
4. ALL questions must be from ${subject} ${grade} ${term} ${curriculum} syllabus
5. The answerKey must contain detailed answers for EVERY question with brief explanations
6. For diagram questions: ALWAYS include "diagramType" with exactly ONE of these values: "plant", "body", "solar", "water_cycle", "map_india", "map_world", "geometry", "custom". Also include "diagramLabels" array with 4-6 string labels.
7. For map questions: use diagramType "map_india" or "map_world" with place/feature names as diagramLabels
8. Questions should progress from easy to challenging
9. ${language === "Tamil" ? "EVERY word must be Tamil script only" : language === "Hindi" ? "EVERY word must be Hindi script only" : language === "Bilingual" ? `FULLY BILINGUAL — ABSOLUTE RULES:
   a) EVERY question, answer, option, heading, instruction, match item MUST be "${biLang1} text / ${biLang2} text".
   b) LEFT of "/" is ALWAYS ${biLang1}. RIGHT is ALWAYS ${biLang2}. NEVER put ${biLang2} on both sides.
   c) MCQ options: DO NOT include a) b) c) d) prefixes — system adds them. Just "${biLang1} text / ${biLang2} text".
   d) Match items: EACH left and right item must be bilingual "${biLang1} / ${biLang2}".
   e) Headings must be bilingual: "${biLang1} heading / ${biLang2} heading".
   f) WRONG: Any item in only one language. Every item MUST have "${biLang1} / ${biLang2}" format. LEFT must be ${biLang1}, RIGHT must be ${biLang2}.
   g) Google Translate-level accuracy for all translations.` : "Pure English only"}
10. Distribute marks proportionally among the included parts
11. The diagramType MUST be a single value like "plant" or "body", NEVER pipe-separated like "plant|body|solar"`;

    const messagePayload = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    const temperature = 0.7;

    const callGroq = async (model: string): Promise<Response> => {
      return await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: messagePayload, stream: false, temperature, max_tokens: 8000 }),
      });
    };

    const callLovable = async (): Promise<Response> => {
      return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: messagePayload, stream: false, temperature, max_tokens: 8000 }),
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
