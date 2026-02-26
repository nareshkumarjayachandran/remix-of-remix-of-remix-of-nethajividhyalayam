import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft, Mic, MicOff, Volume2, ChevronRight, Play,
  RotateCcw, Star, Check, X as XIcon, BookOpen, Users, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface StoryStep {
  character: string;
  characterEmoji: string;
  dialogue: string;
  userPrompt: string;
  hints: string[];
}

interface Story {
  id: string;
  title: string;
  emoji: string;
  color: string;
  setting: string;
  characters: string;
  difficulty: "Easy" | "Medium" | "Hard";
  gradeRange: string;
  steps: StoryStep[];
}

interface StoryFeedback {
  stars: number;
  feedback: string;
  improvement?: string;
  encouragement?: string;
  suggestedResponse?: string;
  grammarMistakes?: { original: string; corrected: string; rule: string }[];
}

interface Props {
  grade: string;
  tamilMode: boolean;
  voiceKey: string;
  onBack: () => void;
  onRecordSession: (stars: number, accuracy: number, mistakes: { wrong: string; correct: string }[]) => void;
}

// ── Stories Data ────────────────────────────────────────────────────────────
const STORIES: Story[] = [
  {
    id: "restaurant",
    title: "At the Restaurant",
    emoji: "🍽️",
    color: "from-orange-400 to-red-500",
    setting: "You walk into a restaurant for lunch.",
    characters: "You & Waiter",
    difficulty: "Easy",
    gradeRange: "All Grades",
    steps: [
      { character: "Waiter", characterEmoji: "🧑‍🍳", dialogue: "Welcome! Good afternoon. How many people, please?", userPrompt: "Tell the waiter how many people are dining", hints: ["Just one, please.", "Table for two, please.", "We are three people."] },
      { character: "Waiter", characterEmoji: "🧑‍🍳", dialogue: "Please follow me. Here is your table. Would you like to see the menu?", userPrompt: "Respond to the waiter", hints: ["Yes, please show me the menu.", "Thank you! Yes, I would like the menu.", "Sure, thank you."] },
      { character: "Waiter", characterEmoji: "🧑‍🍳", dialogue: "Here is the menu. Today's special is chicken biryani. What would you like to order?", userPrompt: "Order your food", hints: ["I would like chicken biryani, please.", "Can I have a masala dosa and a coffee?", "I will have the special, please."] },
      { character: "Waiter", characterEmoji: "🧑‍🍳", dialogue: "Would you like anything to drink with that?", userPrompt: "Order a drink", hints: ["A glass of water, please.", "I would like a mango juice.", "One lemon tea, please."] },
      { character: "Waiter", characterEmoji: "🧑‍🍳", dialogue: "Here is your food. Enjoy your meal! Is there anything else you need?", userPrompt: "Respond and ask for the bill when ready", hints: ["This looks delicious! Thank you.", "Everything is great. Can I have the bill, please?", "Thank you, this is very tasty."] },
    ],
  },
  {
    id: "doctor",
    title: "At the Doctor's",
    emoji: "🏥",
    color: "from-teal-400 to-cyan-500",
    setting: "You visit the doctor because you are not feeling well.",
    characters: "You & Doctor",
    difficulty: "Easy",
    gradeRange: "All Grades",
    steps: [
      { character: "Doctor", characterEmoji: "👩‍⚕️", dialogue: "Good morning! Please sit down. What seems to be the problem?", userPrompt: "Describe how you are feeling", hints: ["I have a headache and fever.", "My stomach is hurting since yesterday.", "I have a cough and cold."] },
      { character: "Doctor", characterEmoji: "👩‍⚕️", dialogue: "I see. How long have you been feeling this way?", userPrompt: "Tell the doctor when it started", hints: ["Since two days ago.", "It started yesterday morning.", "For about three days now."] },
      { character: "Doctor", characterEmoji: "👩‍⚕️", dialogue: "Let me check. Have you taken any medicine?", userPrompt: "Answer the doctor's question", hints: ["No, I have not taken any medicine.", "I took a paracetamol tablet yesterday.", "My mother gave me some syrup."] },
      { character: "Doctor", characterEmoji: "👩‍⚕️", dialogue: "I will write some medicine for you. Take this tablet three times a day after food. Drink plenty of water and rest well.", userPrompt: "Thank the doctor and ask any questions", hints: ["Thank you, doctor. Should I come again?", "How many days should I take the medicine?", "Thank you. When can I go back to school?"] },
    ],
  },
  {
    id: "shop",
    title: "At the Shop",
    emoji: "🛒",
    color: "from-green-400 to-emerald-500",
    setting: "You go to a stationery shop to buy school supplies.",
    characters: "You & Shopkeeper",
    difficulty: "Easy",
    gradeRange: "LKG–5th",
    steps: [
      { character: "Shopkeeper", characterEmoji: "🧑‍💼", dialogue: "Hello! Welcome to my shop. What do you need today?", userPrompt: "Tell the shopkeeper what you want to buy", hints: ["I need a notebook and a pencil.", "Do you have colour pencils?", "I want to buy an eraser and a ruler."] },
      { character: "Shopkeeper", characterEmoji: "🧑‍💼", dialogue: "Yes, I have those. What size notebook do you want — small or big?", userPrompt: "Choose the size and ask about colors", hints: ["I want a big notebook, please.", "Give me two small notebooks.", "Do you have a blue colour notebook?"] },
      { character: "Shopkeeper", characterEmoji: "🧑‍💼", dialogue: "Here you go! Anything else you need?", userPrompt: "Ask for more items or ask the price", hints: ["How much does this cost?", "I also need a sharpener.", "That is all. How much is the total?"] },
      { character: "Shopkeeper", characterEmoji: "🧑‍💼", dialogue: "The total is fifty rupees. Here is your bag. Thank you!", userPrompt: "Pay and say goodbye", hints: ["Here is the money. Thank you!", "Thank you, uncle. Goodbye!", "Thank you very much. Have a good day!"] },
    ],
  },
  {
    id: "interview",
    title: "Job Interview",
    emoji: "💼",
    color: "from-violet-500 to-purple-600",
    setting: "You attend a job interview at an IT company.",
    characters: "You & Interviewer",
    difficulty: "Hard",
    gradeRange: "IT Pro",
    steps: [
      { character: "Interviewer", characterEmoji: "👨‍💼", dialogue: "Good morning! Please have a seat. Tell me about yourself and your experience.", userPrompt: "Introduce yourself professionally", hints: ["Good morning. I have 3 years of experience in web development.", "Thank you. I am a software engineer specializing in React and Node.js.", "I am a full-stack developer with experience in agile teams."] },
      { character: "Interviewer", characterEmoji: "👨‍💼", dialogue: "That's interesting. Can you tell me about a challenging project you worked on?", userPrompt: "Describe a difficult project", hints: ["I worked on a real-time chat application that handled thousands of users.", "We migrated a monolithic application to microservices architecture.", "I led a team to build an e-commerce platform from scratch."] },
      { character: "Interviewer", characterEmoji: "👨‍💼", dialogue: "How do you handle tight deadlines and pressure at work?", userPrompt: "Explain your approach to pressure", hints: ["I prioritize tasks and break them into smaller milestones.", "I communicate early with stakeholders if deadlines seem unrealistic.", "I stay calm, focus on the most critical tasks, and ask for help when needed."] },
      { character: "Interviewer", characterEmoji: "👨‍💼", dialogue: "Where do you see yourself in five years?", userPrompt: "Share your career vision", hints: ["I want to grow into a senior developer role and mentor junior engineers.", "I aim to become a technical architect leading large-scale projects.", "I want to develop expertise in cloud computing and system design."] },
      { character: "Interviewer", characterEmoji: "👨‍💼", dialogue: "Do you have any questions for us?", userPrompt: "Ask thoughtful questions", hints: ["What does a typical day look like for this role?", "Can you tell me about the team I would be working with?", "What are the growth opportunities in this company?"] },
    ],
  },
  {
    id: "travel",
    title: "At the Airport",
    emoji: "✈️",
    color: "from-blue-400 to-sky-500",
    setting: "You are at the airport, checking in for your flight.",
    characters: "You & Airline Staff",
    difficulty: "Medium",
    gradeRange: "3rd–IT Pro",
    steps: [
      { character: "Staff", characterEmoji: "👩‍✈️", dialogue: "Good morning! May I see your passport and ticket, please?", userPrompt: "Show your documents and greet", hints: ["Good morning! Here is my passport and ticket.", "Sure, here you go. I am flying to Chennai.", "Hello! Here are my documents."] },
      { character: "Staff", characterEmoji: "👩‍✈️", dialogue: "Thank you. Would you like a window seat or an aisle seat?", userPrompt: "Choose your seat", hints: ["A window seat, please.", "I prefer an aisle seat.", "Can I get a seat near the front?"] },
      { character: "Staff", characterEmoji: "👩‍✈️", dialogue: "Do you have any luggage to check in?", userPrompt: "Tell about your luggage", hints: ["Yes, I have one suitcase to check in.", "I only have a carry-on bag.", "I have two bags — one to check in and one carry-on."] },
      { character: "Staff", characterEmoji: "👩‍✈️", dialogue: "Your flight is at Gate 12. Boarding starts in 45 minutes. Have a pleasant journey!", userPrompt: "Thank the staff and respond", hints: ["Thank you! Which way is Gate 12?", "Thank you very much. Have a great day!", "Thanks! Is there a coffee shop nearby?"] },
    ],
  },
  {
    id: "library",
    title: "At the Library",
    emoji: "📚",
    color: "from-amber-400 to-yellow-500",
    setting: "You visit the school library to borrow a book.",
    characters: "You & Librarian",
    difficulty: "Easy",
    gradeRange: "LKG–5th",
    steps: [
      { character: "Librarian", characterEmoji: "👩‍🏫", dialogue: "Good morning! Welcome to the library. Are you looking for a book?", userPrompt: "Tell the librarian what kind of book you want", hints: ["I want a story book, please.", "Do you have books about animals?", "I am looking for a science book for my project."] },
      { character: "Librarian", characterEmoji: "👩‍🏫", dialogue: "Let me help you find it. What is your favourite subject?", userPrompt: "Tell about your favourite subject", hints: ["I love reading about space and planets.", "My favourite subject is English.", "I like stories about adventures."] },
      { character: "Librarian", characterEmoji: "👩‍🏫", dialogue: "Here is a nice book! You can borrow it for one week. Please bring your library card.", userPrompt: "Thank the librarian", hints: ["Thank you! I will return it on time.", "This looks interesting! Thank you, ma'am.", "Can I borrow two books, please?"] },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function browserTts(text: string, speed = 1.0): HTMLAudioElement | null {
  if (!("speechSynthesis" in window)) return null;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = speed;
  utter.pitch = 1.0;
  const fakeAudio = new Audio();
  fakeAudio.play = () => new Promise<void>((resolve) => {
    utter.onend = () => { fakeAudio.dispatchEvent(new Event("ended")); resolve(); };
    utter.onerror = () => { fakeAudio.dispatchEvent(new Event("error")); resolve(); };
    window.speechSynthesis.speak(utter);
  });
  fakeAudio.pause = () => { window.speechSynthesis.cancel(); };
  return fakeAudio;
}

const GRADE_SPEED: Record<string, number> = {
  LKG: 0.72, UKG: 0.75, "1st": 0.78, "2nd": 0.80,
  "3rd": 0.83, "4th": 0.86, "5th": 0.88, "IT Pro": 0.95,
};

// ── Component ──────────────────────────────────────────────────────────────
export default function StoryMode({ grade, tamilMode, voiceKey, onBack, onRecordSession }: Props) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [feedback, setFeedback] = useState<StoryFeedback | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [storyComplete, setStoryComplete] = useState(false);
  const [totalStars, setTotalStars] = useState(0);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gradeSpeed = GRADE_SPEED[grade] ?? 0.85;

  const filteredStories = STORIES.filter((s) => {
    if (grade === "IT Pro") return true;
    return s.gradeRange !== "IT Pro";
  });

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    stopAudio();
    setIsPlaying(true);
    const audio = browserTts(text, gradeSpeed);
    if (!audio) { setIsPlaying(false); return; }
    audioRef.current = audio;
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.play();
  }, [stopAudio, gradeSpeed]);

  const startRecording = useCallback(async () => {
    stopAudio();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported. Please use Chrome."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = true;
    transcriptRef.current = "";
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript + " ";
      transcriptRef.current = text.trim();
    };
    recognition.onerror = () => {};
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [stopAudio]);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const recognition = recognitionRef.current;
      if (!recognition) { resolve(""); return; }
      recognition.onend = () => resolve(transcriptRef.current);
      recognition.stop();
      setIsRecording(false);
    });
  }, []);

  // Auto-play character dialogue when step changes
  useEffect(() => {
    if (selectedStory && !feedback && !isRecording && !isProcessing) {
      const step = selectedStory.steps[stepIndex];
      if (step) {
        const timeout = setTimeout(() => speak(step.dialogue), 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [stepIndex, selectedStory, feedback]);

  const handleMicToggle = useCallback(async () => {
    if (!selectedStory) return;
    const step = selectedStory.steps[stepIndex];

    if (isRecording) {
      setIsProcessing(true);
      const spoken = await stopRecording();
      setSpokenText(spoken);

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/spoken-english-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify({
            targetText: step.hints[0], // Use first hint as reference
            spokenText: spoken,
            grade,
            topic: selectedStory.title,
            mode: "story",
            tamilMode,
            storyContext: {
              setting: selectedStory.setting,
              character: step.character,
              characterDialogue: step.dialogue,
              userPrompt: step.userPrompt,
              suggestedResponses: step.hints,
            },
          }),
        });
        if (!res.ok) throw new Error("Feedback failed");
        const fb = await res.json();
        setFeedback(fb);
        setTotalStars((prev) => prev + (fb.stars || 0));
        const mistakes = fb.grammarMistakes?.map((m: any) => ({ wrong: m.original, correct: m.corrected })) || [];
        onRecordSession(fb.stars, fb.accuracyScore ?? 70, mistakes);
      } catch {
        setFeedback({ stars: 3, feedback: "Good try! Keep practicing!", encouragement: "You're doing great! 💪" });
      }
      setIsProcessing(false);
    } else {
      setFeedback(null);
      setSpokenText("");
      await startRecording();
    }
  }, [selectedStory, stepIndex, isRecording, stopRecording, startRecording, grade, tamilMode, onRecordSession]);

  const nextStep = useCallback(() => {
    if (!selectedStory) return;
    setCompletedSteps((prev) => [...prev, stepIndex]);
    if (stepIndex + 1 >= selectedStory.steps.length) {
      setStoryComplete(true);
    } else {
      setStepIndex((i) => i + 1);
      setFeedback(null);
      setSpokenText("");
    }
  }, [selectedStory, stepIndex]);

  const resetStory = useCallback(() => {
    setSelectedStory(null);
    setStepIndex(0);
    setFeedback(null);
    setSpokenText("");
    setCompletedSteps([]);
    setStoryComplete(false);
    setTotalStars(0);
  }, []);

  // ── Story Complete Screen ──────────────────────────────────────────────
  if (storyComplete && selectedStory) {
    const avgStars = Math.round(totalStars / selectedStory.steps.length);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex flex-col">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-5 text-white text-center shadow-lg">
          <p className="text-4xl mb-2">🎉</p>
          <h2 className="text-2xl font-extrabold">Story Complete!</h2>
          <p className="text-yellow-100 text-sm">{selectedStory.emoji} {selectedStory.title}</p>
        </div>
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-yellow-100 text-center space-y-4">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("h-10 w-10", s <= avgStars ? "fill-yellow-400 text-yellow-400 animate-bounce" : "fill-gray-200 text-gray-200")} style={{ animationDelay: `${(s - 1) * 0.1}s` }} />
              ))}
            </div>
            <p className="text-2xl font-black text-gray-800">{avgStars >= 4 ? "Excellent! 🏆" : avgStars >= 3 ? "Good Job! 🌟" : "Keep Practicing! 💪"}</p>
            <p className="text-gray-600">You completed all {selectedStory.steps.length} dialogue turns!</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-yellow-50 rounded-2xl p-3 border border-yellow-100">
                <p className="text-2xl font-black text-yellow-600">{totalStars}</p>
                <p className="text-xs text-gray-500 font-bold">Total Stars</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-3 border border-green-100">
                <p className="text-2xl font-black text-green-600">{selectedStory.steps.length}</p>
                <p className="text-xs text-gray-500 font-bold">Dialogues</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={resetStory} className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3">
              <BookOpen className="h-4 w-4" /> More Stories
            </Button>
            <Button onClick={onBack} variant="outline" className="flex-1 gap-2 rounded-2xl py-3">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Story Selection Screen ─────────────────────────────────────────────
  if (!selectedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col overflow-x-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-5 text-white shadow-lg">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button onClick={onBack} className="p-1 rounded-full bg-white/20 touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-extrabold text-lg">📖 Story Lessons</p>
              <p className="text-xs text-purple-200">Learn English through real-life stories</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full space-y-3">
          <p className="text-sm font-bold text-gray-600 text-center">🎭 Choose a scenario to practice:</p>
          {filteredStories.map((story) => (
            <button
              key={story.id}
              onClick={() => { setSelectedStory(story); setStepIndex(0); setFeedback(null); setSpokenText(""); setCompletedSteps([]); setStoryComplete(false); setTotalStars(0); }}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all text-left active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-md", story.color)}>
                  {story.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-800">{story.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{story.setting}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{story.difficulty}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Users className="h-2.5 w-2.5" /> {story.characters}
                    </span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {story.steps.length} turns
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Active Story Screen ────────────────────────────────────────────────
  const currentStep = selectedStory.steps[stepIndex];
  const progressPercent = ((completedSteps.length) / selectedStory.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className={cn("px-4 py-4 text-white shadow-lg bg-gradient-to-r", selectedStory.color)}>
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={() => { stopAudio(); resetStory(); }} className="p-1 rounded-full bg-white/20 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="font-extrabold text-sm">{selectedStory.emoji} {selectedStory.title}</p>
            <p className="text-xs opacity-80">Step {stepIndex + 1} of {selectedStory.steps.length}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-white/20 rounded-full max-w-md mx-auto overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full flex flex-col gap-4 overflow-y-auto">
        {/* Character Dialogue */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xl shrink-0 shadow-md">
              {currentStep.characterEmoji}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-600 mb-1">{currentStep.character} says:</p>
              <p className="text-gray-800 font-medium leading-relaxed">{currentStep.dialogue}</p>
            </div>
          </div>
          <button
            onClick={() => speak(currentStep.dialogue)}
            disabled={isPlaying}
            className="mt-3 flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
          >
            <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
            {isPlaying ? "Playing..." : "Listen again"}
          </button>
        </div>

        {/* User prompt */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-600 mb-1">🎯 Your turn:</p>
          <p className="text-sm text-blue-800 font-medium">{currentStep.userPrompt}</p>
          {!feedback && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wide">💡 Hint ideas:</p>
              {currentStep.hints.map((h, i) => (
                <p key={i} className="text-xs text-blue-500 italic">• "{h}"</p>
              ))}
            </div>
          )}
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center gap-3" style={{ minHeight: 120 }}>
          <button
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={cn(
              "relative rounded-full w-24 h-24 flex items-center justify-center transition-all duration-300 shadow-lg",
              isRecording
                ? "bg-red-500 shadow-red-300 scale-110"
                : "bg-gradient-to-br from-purple-500 to-pink-600 hover:scale-105 active:scale-95",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
                <span className="absolute inset-[-8px] rounded-full border-2 border-red-300 animate-ping opacity-30" />
              </>
            )}
            {isRecording ? <MicOff className="h-10 w-10 text-white relative z-10" /> : <Mic className="h-10 w-10 text-white relative z-10" />}
          </button>
          <p className="text-sm font-semibold text-gray-600">
            {isProcessing ? "⏳ Miss Nova is checking…" : isRecording ? "🔴 Speaking… tap to stop" : "Tap mic to respond"}
          </p>
        </div>

        {/* Spoken text */}
        {spokenText && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <p className="text-xs text-green-500 font-medium mb-1">You said:</p>
            <p className="text-gray-700 font-medium italic text-sm">"{spokenText}"</p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="bg-white rounded-3xl p-5 shadow-md border border-indigo-100 animate-fade-in space-y-3">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("h-7 w-7 transition-all duration-500", s <= feedback.stars ? "fill-yellow-400 text-yellow-400 animate-bounce" : "fill-gray-200 text-gray-200")} style={{ animationDelay: `${(s - 1) * 0.1}s` }} />
              ))}
            </div>
            <p className="text-gray-700 text-sm text-center leading-relaxed">{feedback.feedback}</p>

            {feedback.suggestedResponse && (
              <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100">
                <p className="text-xs font-bold text-purple-600 mb-1">💬 Better response:</p>
                <p className="text-sm text-purple-800 italic">"{feedback.suggestedResponse}"</p>
                <button onClick={() => speak(feedback.suggestedResponse!)} className="mt-1 text-xs text-purple-600 font-bold flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Listen
                </button>
              </div>
            )}

            {feedback.grammarMistakes && feedback.grammarMistakes.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-3 border border-red-100">
                <p className="text-xs font-bold text-red-600 mb-2">📝 Grammar:</p>
                {feedback.grammarMistakes.map((m, i) => (
                  <div key={i} className="mb-1.5 last:mb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-red-600 line-through">{m.original}</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-green-600 font-bold">{m.corrected}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">📖 {m.rule}</p>
                  </div>
                ))}
              </div>
            )}

            {feedback.encouragement && (
              <p className="text-center text-sm font-bold text-purple-600">{feedback.encouragement}</p>
            )}

            <Button onClick={nextStep} className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-3">
              {stepIndex + 1 >= selectedStory.steps.length ? (
                <><Star className="h-4 w-4" /> Finish Story</>
              ) : (
                <><ChevronRight className="h-4 w-4" /> Next Dialogue</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}