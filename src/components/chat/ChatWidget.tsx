import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const IDLE_TIMEOUT = 30000;
const HISTORY_KEY = "nv_chat_history";
const HISTORY_TTL = 4 * 60 * 60 * 1000;

const DEFAULT_MSG: Msg = { role: "assistant", content: "👋 Welcome to Nethaji Vidhyalayam! How can I help you today?" };

const loadHistory = (): Msg[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [DEFAULT_MSG];
    const { ts, msgs } = JSON.parse(raw);
    if (Date.now() - ts > HISTORY_TTL) {
      localStorage.removeItem(HISTORY_KEY);
      return [DEFAULT_MSG];
    }
    return msgs?.length ? msgs : [DEFAULT_MSG];
  } catch {
    return [DEFAULT_MSG];
  }
};

const saveHistory = (msgs: Msg[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ ts: Date.now(), msgs }));
  } catch {}
};

// Strip markdown for TTS
const stripMarkdown = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>~]/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();

const ChatWidget = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pulseAnim, setPulseAnim] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => setPulseAnim((p) => !p), 2000);
    return () => clearInterval(interval);
  }, [open]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!open || minimized) return;
    idleTimerRef.current = setTimeout(() => setMinimized(true), IDLE_TIMEOUT);
  }, [open, minimized]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [open, minimized, messages, input, resetIdleTimer]);

  // ElevenLabs TTS
  const speakText = useCallback(
    async (text: string) => {
      if (!voiceEnabled || !text.trim()) return;
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsSpeaking(true);
        const clean = stripMarkdown(text).slice(0, 500); // limit to 500 chars
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ text: clean, speed: 1.0 }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        await audio.play();
      } catch {
        setIsSpeaking(false);
      }
    },
    [voiceEnabled],
  );

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const streamChat = useCallback(async (allMessages: Msg[], retries = 2): Promise<string> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify({ messages: allMessages }),
        });
        if (!resp.ok || !resp.body) {
          const err = await resp.json().catch(() => ({ error: "Failed" }));
          throw new Error(err.error || `HTTP ${resp.status}`);
        }
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantText += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant" && prev.length > 1) {
                    return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
                  }
                  return [...prev, { role: "assistant", content: assistantText }];
                });
              }
            } catch {}
          }
        }
        return assistantText;
      } catch (e) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw e;
      }
    }
    throw new Error("Failed to connect after retries");
  }, []);

  // Offline local responder — answers common school queries without internet
  const getOfflineResponse = useCallback((query: string): string => {
    const q = query.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|vanakkam|good\s*(morning|afternoon|evening))/.test(q))
      return "👋 Hello! I'm currently in **offline mode**, but I can still answer basic school questions.\n\nTry asking about: admissions, fees, contact, timings, facilities, or academics!";

    // Contact
    if (/phone|call|contact|number|reach/.test(q))
      return "📞 **Contact Nethaji Vidhyalayam:**\n- [📞 Call 9841594945](tel:+919841594945)\n- [📞 Call 6380967675](tel:+916380967675)\n- ✉️ nethajividhyalayam@gmail.com\n- 📍 5/325, Rajiv Nagar, S.Kolathur Main Road, Chennai - 600129";

    // Address / directions
    if (/address|location|direction|where|map|visit/.test(q))
      return "📍 **Address:** 5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129\n\n[📍 Get Directions](https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam+S.Kolathur+Chennai)";

    // Timings
    if (/timing|hour|time|open|close|schedule/.test(q))
      return "🕘 **School Hours:** Monday to Saturday, 8:50 AM – 3:30 PM";

    // Admission
    if (/admiss|apply|enrol|join|registration/.test(q))
      return "📝 **Admission Process:**\n1. Enquiry & Registration\n2. Document Submission (birth cert, Aadhaar, photos)\n3. Interaction Round\n4. Fee Payment\n5. Welcome & Admission Kit\n\n[📝 Apply for Admission](/admissions)";

    // Fees
    if (/fee|pay|payment|upi/.test(q))
      return "💰 **Fee Payment:** Parents can pay via UPI at the website.\n- UPI ID: nethajividhyalayam@upi\n\n[💰 Pay School Fees](/admissions#fees)";

    // Classes / Age
    if (/class|grade|standard|age|pre.?kg|lkg|ukg/.test(q))
      return "🎓 **Classes:** Pre-KG to 5th Grade (English Medium, State Board)\n\n**Age Criteria (as of March 31):**\n- Pre-KG: 3 yrs | LKG: 3-4 | UKG: 4-5\n- Grade 1: 5-6 | Grade 2: 6-7 | Grade 3: 7-8\n- Grade 4: 8-9 | Grade 5: 9-10";

    // Facilities
    if (/facilit|library|transport|lab|sport|playground|infrastructure/.test(q))
      return "🏫 **Facilities:** Library (500+ books), Sports Complex, GPS Transport (5-10km), Smart Classrooms, Science Lab, Computer Lab, Music Room, Canteen, Medical Room, 24/7 CCTV\n\n[🏫 View Facilities](/facilities)";

    // Academics / curriculum
    if (/academ|curricul|subject|syllabus|samacheer|merry.?bird/.test(q))
      return "📚 **Curriculum:** State Board (Samacheer Kalvi) + Oxford Merry Birds\n- Pre-Primary: Activity-based, phonics, number readiness\n- Primary (1-5): English, Tamil, Maths, EVS, GK, Computer, Art, Music, Dance, Yoga\n\n[📚 View Academics](/academics)";

    // About / leadership
    if (/about|history|founded|chairman|principal|leader/.test(q))
      return "🏠 **Nethaji Vidhyalayam** — Founded 11th June 2002\n- Chairman: Mr. J.J. Nareshkumar\n- Principal: Mrs. V. Janani\n- Vice Principal: Mrs. M. Devikala\n- 2000+ Alumni | 12+ Staff | 100% Pass Rate\n\n[🏠 About Us](/about)";

    // Events
    if (/event|annual|sports\s*day|program/.test(q))
      return "🎉 **Major Events:** Annual Day (March), Science Exhibition (Feb), Sports Day (Jan), PTM, Festival Celebrations\n\n[🎉 Events](/events)";

    // Career
    if (/career|job|vacanc|teach|work/.test(q))
      return "💼 Teaching, Non-Teaching, and Admin positions available.\n\n[💼 Careers](/career)";

    // Worksheet
    if (/worksheet|homework|practice\s*sheet/.test(q))
      return "📄 Create custom worksheets offline!\n\n[📄 Open Worksheet Maker](/worksheet-maker)";

    // Fallback
    return "📶 I'm in **offline mode** right now. I can answer basic questions about:\n\n• 📞 Contact & Address\n• 📝 Admissions & Fees\n• 🎓 Classes & Age Criteria\n• 📚 Academics & Curriculum\n• 🏫 Facilities\n• 🎉 Events\n\nFor detailed AI answers, please reconnect to the internet!";
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      stopSpeaking();
      const userMsg: Msg = { role: "user", content: text.trim() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setIsLoading(true);
      resetIdleTimer();

      // If explicitly offline, use local responder
      if (!navigator.onLine) {
        const offlineReply = getOfflineResponse(text);
        setMessages((prev) => [...prev, { role: "assistant", content: offlineReply }]);
        setIsLoading(false);
        return;
      }

      try {
        const reply = await streamChat(updated);
        if (reply && voiceEnabled) await speakText(reply);
      } catch (err) {
        // Network failed despite navigator.onLine being true — use offline responder
        const offlineReply = getOfflineResponse(text);
        setMessages((prev) => [...prev, { role: "assistant", content: offlineReply }]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, streamChat, speakText, stopSpeaking, voiceEnabled, resetIdleTimer, getOfflineResponse],
  );

  // ElevenLabs STT recording
  const startRecording = useCallback(async () => {
    try {
      stopSpeaking();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick best supported mimeType
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(100);
      mediaRef.current = mr;
      setIsRecording(true);
    } catch {
      alert("Microphone access denied. Please allow mic access in browser settings.");
    }
  }, [stopSpeaking]);

  const stopRecordingAndTranscribe = useCallback(async () => {
    const mr = mediaRef.current;
    if (!mr || mr.state === "inactive") return;
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const blob: Blob = await new Promise((resolve) => {
        mr.onstop = () => {
          const b = new Blob(chunksRef.current, { type: mr.mimeType });
          mr.stream.getTracks().forEach((t) => t.stop());
          resolve(b);
        };
        mr.stop();
      });
      if (blob.size < 1000) {
        setIsTranscribing(false);
        return;
      }
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      const res = await fetch(STT_URL, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: fd,
      });
      if (!res.ok) throw new Error("STT failed");
      const data = await res.json();
      const transcript = data.text?.trim();
      if (transcript) {
        setInput(transcript);
        await send(transcript);
      }
    } catch {
      alert("Could not transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
      mediaRef.current = null;
    }
  }, [send]);

  const toggleMic = useCallback(() => {
    if (isRecording) {
      stopRecordingAndTranscribe();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecordingAndTranscribe]);

  const isMicBusy = isTranscribing || isLoading;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-center gap-2">
          <button
            onClick={() => {
              setOpen(true);
              setMinimized(false);
            }}
            className={`w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
              pulseAnim ? "scale-110 rotate-[5deg]" : "scale-100 rotate-[-3deg]"
            }`}
            style={{ animation: "chat-bounce 2s ease-in-out infinite, chat-glow 3s ease-in-out infinite" }}
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
          <button
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
            style={{ animation: "chat-bounce 3s ease-in-out infinite" }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Nethaji AI</span>
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setMinimized(false);
              stopSpeaking();
            }}
            className="w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && !minimized && (
        <div className="fixed bottom-4 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100dvh-2rem)] bg-card rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Nethaji AI Assistant</p>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  {isSpeaking ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse inline-block" /> Speaking…
                    </>
                  ) : isRecording ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-300 animate-ping inline-block" /> Listening…
                    </>
                  ) : isTranscribing ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse inline-block" />{" "}
                      Transcribing…
                    </>
                  ) : (
                    "Ask me anything! 🎤"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled((v) => !v);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                title={voiceEnabled ? "Mute voice reply" : "Enable voice reply"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setMinimized(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Minimize"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setMinimized(false);
                  stopSpeaking();
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onMouseMove={resetIdleTimer}
            onClick={resetIdleTimer}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            if (!href) return <span>{children}</span>;
                            const isMailto = href.startsWith("mailto:");
                            const isTel = href.startsWith("tel:");
                            const isExternal = href.startsWith("http");
                            if (isTel || isMailto) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.location.href = href;
                                  }}
                                  className="inline-flex items-center gap-1 bg-accent text-accent-foreground font-semibold px-3 py-1 rounded-lg hover:bg-accent/90 transition-colors cursor-pointer text-xs my-1"
                                >
                                  {children}
                                </button>
                              );
                            }
                            if (isExternal) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.open(href, "_blank", "noopener,noreferrer");
                                  }}
                                  className="inline-flex items-center gap-1 bg-accent text-accent-foreground font-semibold px-3 py-1 rounded-lg hover:bg-accent/90 transition-colors cursor-pointer text-xs my-1"
                                >
                                  {children}
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(href);
                                  setOpen(false);
                                }}
                                className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer text-xs my-1"
                              >
                                {children}
                              </button>
                            );
                          },
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm text-sm text-muted-foreground flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t shrink-0">
            {/* Recording indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-red-50 rounded-lg border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs text-red-600 font-semibold">🎤 Listening… tap mic to send</span>
              </div>
            )}
            {isTranscribing && (
              <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs text-yellow-700 font-semibold">⏳ Transcribing your voice…</span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              {/* Mic button - ElevenLabs STT */}
              <button
                type="button"
                onClick={toggleMic}
                disabled={isMicBusy}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-110"
                    : isMicBusy
                      ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-label={isRecording ? "Stop & send voice" : "Start voice input"}
                title={isRecording ? "Tap to stop & send" : "Tap to speak"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  resetIdleTimer();
                }}
                placeholder={isRecording ? "Listening…" : "Type or use mic"}
                className="flex-1 min-w-0 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading || isRecording}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isRecording}
                className="shrink-0 w-9 h-9 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/90 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-3 mt-1.5">
              {/* Mic toggle */}
              <button
                type="button"
                onClick={toggleMic}
                disabled={isMicBusy}
                className="flex items-center gap-1 text-[10px] font-semibold"
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isRecording ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                >
                  {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                </span>
                <span className={`${isRecording ? "text-red-500" : "text-green-600"}`}>
                  {isRecording ? "OFF" : "ON"}
                </span>
              </button>
              {/* Voice reply toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled((v) => !v);
                }}
                className="flex items-center gap-1 text-[10px] font-semibold"
                title={voiceEnabled ? "Mute voice reply" : "Enable voice reply"}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${voiceEnabled ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                >
                  {voiceEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                </span>
                <span className={`${voiceEnabled ? "text-green-600" : "text-red-500"}`}>
                  {voiceEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chat-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes chat-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(var(--accent), 0.3); }
          50% { box-shadow: 0 0 25px rgba(var(--accent), 0.6), 0 0 50px rgba(var(--accent), 0.2); }
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
