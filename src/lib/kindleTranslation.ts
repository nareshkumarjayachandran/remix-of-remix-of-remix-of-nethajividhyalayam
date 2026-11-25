import { supabase } from "@/integrations/supabase/client";
import { SPEECH_LANGUAGE_META, type SpeechLanguage } from "@/lib/speechText";
import type { KindleDocument, KindlePage } from "@/lib/kindleFileParser";

export interface TranslatedPageContent {
  title?: string;
  paragraphs: string[];
}

type PrecomputedBookMap = Record<string, Partial<Record<SpeechLanguage, TranslatedPageContent[]>>>;

/**
 * Pre-saved offline translations (Tamil, Hindi, English) for built-in starter books
 * so students can read and listen instantly without waiting on network translation.
 */
const PRECOMPUTED_SAMPLE_TRANSLATIONS: PrecomputedBookMap = {
  "sample-en-story": {
    ta: [
      {
        title: "அத்தியாயம் 1 — காட்டின் ஒப்பந்தம்",
        paragraphs: [
          "நீண்ட காலத்திற்கு முன், பசுமையான அடர்ந்த காட்டில் பாசுரகா என்ற கொடிய சிங்கம் வாழ்ந்து வந்தது. தினமும் தன் தேவைக்கு அதிகமான விலங்குகளை வேட்டையாடி காடு முழுவதும் பயத்தை ஏற்படுத்தியது.",
          "இறுதியாக, விலங்குகள் அனைத்தும் ஒன்றுகூடி பணிவான ஒரு வேண்டுகோள் விடுத்தன: 'மன்னா, நீங்கள் உங்கள் குகையிலேயே இருங்கள்; தினமும் ஒரு விலங்கு எந்தப் போராட்டமும் இன்றி தாமாகவே உங்களிடம் வரும்.' சிங்கமும் அதற்குச் சம்மதித்தது.",
        ],
      },
      {
        title: "அத்தியாயம் 2 — அறிவின் கிணறு",
        paragraphs: [
          "ஒரு நாள் காலை, ஒரு சிறிய முயலின் முறை வந்தது. மெதுவாக நடந்து தாமதமாக வந்த புத்திசாலி முயல் பணிந்து வணங்கியது: 'மன்னிக்கவும் மன்னா! வழியில் இன்னொரு சிங்கம் என்னைத் தடுத்து நிறுத்தி, தானே இந்தக் காட்டின் ராஜா என்று கூறியது.'",
          "கோபமடைந்த பாசுரகா அந்தப் போட்டியாளரைப் பார்க்க வேண்டும் என்று கட்டளையிட்டது. முயல் அதை ஒரு ஆழமான கற்கிணற்றின் அருகே அழைத்துச் சென்றது. உள்ளே எட்டிப் பார்த்த சிங்கம் தன் சொந்த நிழலைப் பார்த்து கோபத்துடன் கர்ஜித்து உள்ளே குதித்தது. நீதி: முரட்டு வலிமையை விட அறிவு வலிமையானது.",
        ],
      },
      {
        title: "அத்தியாயம் 3 — காட்டில் மகிழ்ச்சி",
        paragraphs: [
          "பெரிய சத்தத்துடன் தண்ணீர் தெறிப்பதைக் கேட்ட புத்திசாலி முயல், மான்கள், அணில்கள் மற்றும் மயில்கள் ஆவலுடன் காத்திருந்த வெயில் படர்ந்த வெளிக்குத் துள்ளிக் குதித்து ஓடியது.",
          "அமைதியான சிந்தனை எவ்வாறு அகந்தையையும் கோபத்தையும் வென்றது என்பதை முயல் கூறியதும், முழு காடும் மகிழ்ச்சி ஆரவாரம் செய்தது. ஒவ்வொரு ஓடையிலும் புல்வெளியிலும் அமைதி திரும்பியது.",
        ],
      },
      {
        title: "அத்தியாயம் 4 — இளம் வாசகர்களுக்கான பாடம்",
        paragraphs: [
          "உண்மையான தைரியம் என்பது சத்தமாக கர்ஜிப்பதோ வலிமையைக் காட்டுவதோ அல்ல. அமைதியாக இருப்பதும், கவனமாக ஆராய்வதும், அறிவைப் பயன்படுத்தி நம்மைச் சுற்றியுள்ளவர்களைக் காப்பதும் தான் உண்மையான தைரியம்.",
          "மேலே உள்ள Book Style விருப்பத்தை Hardcover 2-Page Flip, Paperback, Spiral Notebook அல்லது Magazine என மாற்றி உண்மையான புத்தகப் பக்கங்களைப் புரட்டும் அனுபவத்தைப் பெறுங்கள்.",
        ],
      },
    ],
    hi: [
      {
        title: "अध्याय 1 — जंगल का समझौता",
        paragraphs: [
          "बहुत समय पहले, एक हरे-भरे जंगल में भासुरक नाम का एक क्रूर शेर रहता था। वह हर दिन अपनी ज़रूरत से ज़्यादा जानवरों का शिकार करता था, जिससे पूरे जंगल में डर फैला हुआ था।",
          "आखिरकार, सभी जानवर इकट्ठा हुए और विनम्रता से प्रस्ताव रखा: 'महाराज, यदि आप अपनी गुफा में ही रहें, तो हर दिन एक जानवर बिना किसी संघर्ष के स्वयं आपके पास आ जाएगा।' शेर मान गया।",
        ],
      },
      {
        title: "अध्याय 2 — बुद्धि का कुआँ",
        paragraphs: [
          "एक सुबह, एक छोटे खरगोश की बारी आई। धीरे-धीरे चलते हुए चतुर खरगोश देर से पहुँचा और झुककर बोला: 'क्षमा करें महाराज! रास्ते में एक दूसरे शेर ने मुझे रोक लिया और खुद को इस जंगल का राजा बताया।'",
          "क्रोधित होकर भासुरक ने उस प्रतिद्वंद्वी को देखने की माँग की। खरगोश उसे एक गहरे पत्थर के कुएँ के पास ले गया। अंदर झाँकने पर शेर ने अपनी ही परछाईं देखी, गुस्से में दहाड़ा और कुएँ में कूद गया। सीख: बल से बड़ी बुद्धि होती है।",
        ],
      },
      {
        title: "अध्याय 3 — जंगल में खुशियाँ",
        paragraphs: [
          "पानी की ज़ोरदार छपाक सुनकर चतुर खरगोश तेज़ी से धूप से भरे मैदान की ओर लौटा, जहाँ हिरण, गिलहरियाँ और मोर बेसब्री से इंतज़ार कर रहे थे।",
          "जब खरगोश ने बताया कि शांत दिमाग ने कैसे घमंड और गुस्से को हरा दिया, तो पूरा जंगल खुशी से झूम उठा। हर नदी और घास के मैदान में फिर से शांति लौट आई।",
        ],
      },
      {
        title: "अध्याय 4 — युवा पाठकों के लिए सीख",
        paragraphs: [
          "सच्चा साहस ज़ोर से दहाड़ने या ताकत दिखाने में नहीं है। यह शांत रहने, ध्यान से समझने और अपनी बुद्धि से दूसरों की रक्षा करने में है।",
          "असली किताब के पन्ने पलटने जैसा अनुभव पाने के लिए ऊपर Book Style को Hardcover 2-Page Flip, Paperback, Spiral Notebook या Magazine में बदलकर देखें।",
        ],
      },
    ],
  },
  "sample-ta-kural": {
    en: [
      {
        title: "Chapter 40 — Education (Kalvi)",
        paragraphs: [
          "Learn faultlessly all that is worth learning; and after learning, live in a way worthy of that knowledge.",
          "Meaning: One should study worthy books thoroughly without error, and then walk the right path guided by that learning.",
          "Numbers (mathematics) and letters (language) — these two are said to be the two eyes of living human beings.",
          "Meaning: Mathematics and language are as vital to every person as their own two eyes.",
        ],
      },
      {
        title: "Chapter 40 — The Glory of Learning",
        paragraphs: [
          "Just as water springs forth in a sandy well in proportion to the depth it is dug, knowledge flows forth in people in proportion to how much they learn.",
          "Meaning: The deeper we dig in sand, the more spring water rises; similarly, the more we learn, the richer our wisdom grows.",
          "Learning is the imperishable and finest wealth a person can possess; all other riches are not true lasting wealth.",
          "Meaning: Education is the only indestructible treasure; material riches cannot stay forever.",
        ],
      },
    ],
    hi: [
      {
        title: "अध्याय 40 — शिक्षा (कल्वि)",
        paragraphs: [
          "जो सीखने योग्य है उसे बिना किसी त्रुटि के अच्छी तरह सीखो, और सीखने के बाद उस ज्ञान के अनुरूप जीवन जियो।",
          "अर्थ: अच्छी पुस्तकों का शुद्ध और गहन अध्ययन करना चाहिए, और सीखे हुए ज्ञान के अनुसार सन्मार्ग पर चलना चाहिए।",
          "गणित (संख्या) और भाषा (अक्षर) — इन दोनों को जीवित मनुष्यों की दो आँखें कहा गया है।",
          "अर्थ: गणित और भाषा हर मनुष्य के लिए दो आँखों के समान अत्यंत आवश्यक हैं।",
        ],
      },
      {
        title: "अध्याय 40 — शिक्षा की महिमा",
        paragraphs: [
          "जिस प्रकार रेत के कुएँ को जितना गहरा खोदा जाता है उतना ही पानी फूटता है, उसी प्रकार मनुष्य जितना सीखता है उसका ज्ञान उतना ही बढ़ता है।",
          "अर्थ: रेत में गहराई तक खोदने से जल का स्रोत बढ़ता है; वैसे ही निरंतर अध्ययन से बुद्धि और ज्ञान बढ़ता रहता है।",
          "शिक्षा ही मनुष्य की अविनाशी और सर्वश्रेष्ठ संपत्ति है; अन्य सभी धन स्थायी संपत्ति नहीं हैं।",
          "अर्थ: विद्या ही एकमात्र ऐसा धन है जो कभी नष्ट नहीं होता; बाकी भौतिक संपत्तियाँ स्थायी नहीं होतीं।",
        ],
      },
    ],
  },
  "sample-hi-story": {
    en: [
      {
        title: "Chapter 1 — Friendship in the Forest",
        paragraphs: [
          "In a beautiful forest, a deer and a crow were very close friends. Every morning they met by the riverbank and searched for food together.",
          "One day the deer got trapped in a hunter's net. The crow immediately called his friend the mouse. The mouse chewed through the net with his sharp teeth and set the deer free.",
          "Moral: A true friend is one who stands by you in times of trouble.",
        ],
      },
      {
        title: "Chapter 2 — The Power of Unity",
        paragraphs: [
          "After the deer was freed, the deer, the crow, and the mouse all sat together beside the river. They promised to always protect one another.",
          "The other animals in the forest also learned from their friendship that staying united overcomes even the hardest difficulties.",
        ],
      },
    ],
    ta: [
      {
        title: "அத்தியாயம் 1 — காட்டின் நட்பு",
        paragraphs: [
          "ஒரு அழகான காட்டில் ஒரு மானும் ஒரு காகமும் மிகவும் நெருங்கிய நண்பர்களாக இருந்தன. தினமும் காலையில் ஆற்றங்கரையில் சந்தித்து ஒன்றாக உணவு தேடின.",
          "ஒரு நாள் மான் வேடனின் வலையில் சிக்கிக்கொண்டது. காகம் உடனடியாக தன் நண்பனான எலியை அழைத்தது. எலி தன் கூர்மையான பற்களால் வலையைக் கடித்து மானை விடுவித்தது.",
          "நீதி: துன்பம் வரும் நேரத்தில் உதவுபவனே உண்மையான நண்பன்.",
        ],
      },
      {
        title: "அத்தியாயம் 2 — ஒற்றுமையின் வலிமை",
        paragraphs: [
          "விடுதலையான பிறகு மான், காகம், எலி மூன்றும் ஆற்றங்கரையில் ஒன்றாக அமர்ந்தன. எப்போதும் ஒருவரை ஒருவர் காப்போம் என்று உறுதியளித்தன.",
          "ஒற்றுமையாக வாழ்ந்தால் எவ்வளவு பெரிய கஷ்டத்தையும் வெல்லலாம் என்பதைக் காட்டின் மற்ற விலங்குகளும் அவற்றின் நட்பிலிருந்து கற்றுக்கொண்டன.",
        ],
      },
    ],
  },
  "sample-world-langs": {
    en: [
      {
        title: "Page 1 — Indian Languages (English Meanings)",
        paragraphs: [
          "Tamil: Learning is boundless, while the days of a learner are few.",
          "Hindi: Knowledge bestows humility.",
          "Telugu: Education is a person's true wealth.",
          "Malayalam: The wealth of knowledge is the greatest of all wealth.",
          "Kannada: Knowledge gives humility.",
          "Bengali: Education is the backbone of a nation.",
          "Gujarati: Knowledge shines through humility.",
          "Punjabi: True learning inspires selfless service to others.",
        ],
      },
      {
        title: "Page 2 — World Foreign Languages (English Meanings)",
        paragraphs: [
          "French: To read is to travel without leaving your chair.",
          "Spanish: An open book is a brain that speaks.",
          "Arabic: Knowledge is a light that illuminates the path of life.",
          "Japanese: Reading is nourishment for the heart.",
          "Korean: Books are food for the mind.",
          "Chinese: Read ten thousand books, and your pen will write with divine ease.",
        ],
      },
    ],
    ta: [
      {
        title: "பக்கம் 1 — இந்திய மொழிகளின் பொன்மொழிகள்",
        paragraphs: [
          "தமிழ்: கல்விக்கு எல்லையில்லை, கற்பவரின் வாழ்நாட்கள் சிலவே.",
          "இந்தி: கல்வி பணிவைத் தரும்.",
          "தெலுங்கு: படிப்பே மனிதனுக்கு உண்மையான செல்வம்.",
          "மலையாளம்: கல்விச் செல்வமே எல்லா செல்வங்களிலும் சிறந்தது.",
          "கன்னடம்: கல்வி பணிவை அளிக்கிறது.",
          "வங்காளம்: கல்வியே ஒரு நாட்டின் முதுகெலும்பு.",
          "குஜராத்தி: கல்வி பணிவால் ஒளிர்கிறது.",
          "பஞ்சாபி: உண்மையான கல்வி பிறருக்கு உதவும் மனதைத் தரும்.",
        ],
      },
      {
        title: "பக்கம் 2 — உலக மொழிகளின் பொன்மொழிகள்",
        paragraphs: [
          "பிரெஞ்சு: வாசிப்பது என்பது இருக்கையை விட்டு நகராமல் உலகம் சுற்றுவதாகும்.",
          "ஸ்பானிஷ்: திறந்த புத்தகம் என்பது பேசும் மூளையாகும்.",
          "அரபி: அறிவு என்பது வாழ்க்கைப் பாதையை ஒளிரச் செய்யும் தீபம்.",
          "ஜப்பானியம்: வாசிப்பு இதயத்திற்கான ஊட்டச்சத்து.",
          "கொரியன்: புத்தகங்கள் மனத்திற்கான உணவு.",
          "சீனம்: பல்லாயிரம் நூல்களைப் படித்தால் எழுத்து தானாகவே சிறக்கும்.",
        ],
      },
    ],
    hi: [
      {
        title: "पृष्ठ 1 — भारतीय भाषाओं के सुविचार",
        paragraphs: [
          "तमिल: ज्ञान की कोई सीमा नहीं है, जबकि सीखने वाले के दिन सीमित हैं।",
          "हिन्दी: विद्या विनम्रता देती है।",
          "तेलुगु: शिक्षा ही मनुष्य की सच्ची संपत्ति है।",
          "मलयालम: विद्याधन सभी धनों में श्रेष्ठ है।",
          "कन्नड़: विद्या विनम्रता प्रदान करती है।",
          "बंगाली: शिक्षा ही राष्ट्र की रीढ़ है।",
          "गुजराती: विद्या विनय से शोभा पाती है।",
          "पंजाबी: सच्ची विद्या परोपकार की भावना जगाती है।",
        ],
      },
      {
        title: "पृष्ठ 2 — विश्व भाषाओं के सुविचार",
        paragraphs: [
          "फ्रेंच: पढ़ना अपनी कुर्सी छोड़े बिना यात्रा करने जैसा है।",
          "स्पैनिश: एक खुली किताब बोलता हुआ मस्तिष्क है।",
          "अरबी: ज्ञान वह प्रकाश है जो जीवन के मार्ग को आलोकित करता है।",
          "जापानी: पढ़ना हृदय का पोषण है।",
          "कोरियन: किताबें मन का भोजन हैं।",
          "चीनी: दस हज़ार पुस्तकें पढ़ने पर लेखनी स्वयं दिव्य हो जाती है।",
        ],
      },
    ],
  },
};

const memoryCache = new Map<string, TranslatedPageContent>();
const STORAGE_PREFIX = "nv-kindle-tr-v1:";

export function getPrecomputedPageTranslation(
  docId: string,
  pageIndex: number,
  targetLang: SpeechLanguage,
): TranslatedPageContent | null {
  const pages = PRECOMPUTED_SAMPLE_TRANSLATIONS[docId]?.[targetLang];
  if (!pages || !pages[pageIndex]) return null;
  return pages[pageIndex]!;
}

export function buildTranslationCacheKey(targetLang: SpeechLanguage, texts: string[]): string {
  const joined = `${targetLang}::${texts.join("\u001f")}`;
  let hash = 5381;
  for (let i = 0; i < joined.length; i += 1) {
    hash = ((hash << 5) + hash) ^ joined.charCodeAt(i);
  }
  return `${targetLang}:${(hash >>> 0).toString(36)}:${texts.length}`;
}

export function normalizeTranslationResult(originals: string[], translated: unknown): string[] {
  if (!Array.isArray(translated)) return originals;
  return originals.map((orig, idx) => {
    const item = translated[idx];
    return typeof item === "string" && item.trim().length > 0 ? item.trim() : orig;
  });
}

export function buildTranslatedPage(
  page: KindlePage,
  translated: TranslatedPageContent,
): KindlePage {
  return {
    ...page,
    title: translated.title ?? page.title,
    paragraphs: translated.paragraphs,
    // Clear original rich HTML on translated view so translated paragraphs render cleanly
    htmlContent: undefined,
    renderVisualPage: undefined,
    imageUrl: undefined,
  };
}

/** Guesses the main language of a document from its script so we know when translation is needed. */
export function detectDocumentLanguage(doc: KindleDocument): SpeechLanguage {
  const sample = [doc.title, ...doc.pages.slice(0, 2).flatMap((p) => p.paragraphs)].join(" ");
  const counts: [SpeechLanguage, RegExp][] = [
    ["ta", /[\u0B80-\u0BFF]/g],
    ["hi", /[\u0900-\u097F]/g],
    ["te", /[\u0C00-\u0C7F]/g],
    ["kn", /[\u0C80-\u0CFF]/g],
    ["ml", /[\u0D00-\u0D7F]/g],
    ["bn", /[\u0980-\u09FF]/g],
    ["ar", /[\u0600-\u06FF]/g],
  ];
  const latin = (sample.match(/[A-Za-z]/g) || []).length;
  let best: SpeechLanguage = "en";
  let bestCount = latin;
  for (const [lang, re] of counts) {
    const n = (sample.match(re) || []).length;
    if (n > bestCount) {
      best = lang;
      bestCount = n;
    }
  }
  return best;
}

function readCachedTranslation(key: string): TranslatedPageContent | null {
  const mem = memoryCache.get(key);
  if (mem) return mem;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TranslatedPageContent;
    if (parsed && Array.isArray(parsed.paragraphs)) {
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return null;
}

function writeCachedTranslation(key: string, value: TranslatedPageContent): void {
  memoryCache.set(key, value);
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore quota/storage errors
  }
}

/**
 * Translates a single Kindle page into any of the 28 supported languages.
 * Uses pre-saved offline translations for starter books, caches all results,
 * and translates uploaded documents on demand via the backend AI translator.
 */
export async function translateKindlePage(
  doc: KindleDocument,
  pageIndex: number,
  targetLang: SpeechLanguage,
): Promise<TranslatedPageContent> {
  const page = doc.pages[pageIndex];
  if (!page) return { paragraphs: [] };

  const precomputed = getPrecomputedPageTranslation(doc.id, pageIndex, targetLang);
  if (precomputed) return precomputed;

  const hasDistinctTitle = Boolean(page.title && page.title.trim().length > 0);
  const texts = hasDistinctTitle ? [page.title!, ...page.paragraphs] : [...page.paragraphs];
  if (texts.length === 0) return { title: page.title, paragraphs: [] };

  const cacheKey = buildTranslationCacheKey(targetLang, texts);
  const cached = readCachedTranslation(cacheKey);
  if (cached) return cached;

  const meta = SPEECH_LANGUAGE_META[targetLang];
  const { data, error } = await supabase.functions.invoke("book-reading-ai", {
    body: {
      action: "translate_segments",
      segments: texts,
      targetLanguage: targetLang,
      targetLanguageName: `${meta.label} (${meta.nativeLabel})`,
    },
  });

  if (error) {
    throw new Error(error.message || `Could not translate to ${meta.label}.`);
  }

  const normalized = normalizeTranslationResult(texts, data?.translations);
  const result: TranslatedPageContent = hasDistinctTitle
    ? { title: normalized[0], paragraphs: normalized.slice(1) }
    : { title: page.title, paragraphs: normalized };

  writeCachedTranslation(cacheKey, result);
  return result;
}