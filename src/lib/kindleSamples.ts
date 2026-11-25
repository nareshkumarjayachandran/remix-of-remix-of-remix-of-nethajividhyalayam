import type { KindleDocument } from "./kindleFileParser";

export const KINDLE_SAMPLE_BOOKS: KindleDocument[] = [
  {
    id: "sample-en-story",
    title: "The Clever Rabbit & The Lion (Panchatantra)",
    fileName: "Panchatantra-Sample.txt",
    format: "sample",
    wordCount: 286,
    pages: [
      {
        title: "Chapter 1 — The Forest Pact",
        paragraphs: [
          "Long ago, in a lush green forest, there lived a fierce lion named Bhasuraka. Every day he hunted far more animals than he needed, filling the woodland with fear.",
          "At last, the animals gathered together and made a humble offer: 'O King, if you stay in your den, one animal will come to you each day without struggle.' The lion agreed.",
        ],
      },
      {
        title: "Chapter 2 — The Well of Wisdom",
        paragraphs: [
          "One morning, it was a small rabbit's turn. Walking slowly, the clever rabbit arrived late and bowed low. 'Forgive me, Majesty! Another lion stopped me on the path and claimed to be king of this forest.'",
          "Furious, Bhasuraka demanded to see this rival. The rabbit led him to a deep stone well. Peering inside, the lion saw his own reflection, roared in anger, and leaped in. Moral: Wisdom is stronger than brute strength.",
        ],
      },
      {
        title: "Chapter 3 — Joy in the Woodland",
        paragraphs: [
          "Hearing the mighty splash, the clever rabbit hopped swiftly back to the sunlit clearing where the deer, squirrels, and peacocks waited anxiously.",
          "When the rabbit told them how calm thinking had outsmarted pride and anger, the entire forest broke into cheers. Peace returned to every stream and meadow.",
        ],
      },
      {
        title: "Chapter 4 — Lesson for Young Readers",
        paragraphs: [
          "True courage is not loud roaring or showing off strength. It is staying calm, observing carefully, and using intelligence to protect those around you.",
          "Try switching Book Style above to Hardcover 2-Page Flip, Paperback, Spiral Notebook, or Magazine to experience real page turning.",
        ],
      },
    ],
  },
  {
    id: "sample-ta-kural",
    title: "திருக்குறள் — கல்வி (Thirukkural on Learning)",
    fileName: "Thirukkural-Tamil.txt",
    format: "sample",
    wordCount: 122,
    pages: [
      {
        title: "அதிகாரம் 40 — கல்வி",
        paragraphs: [
          "கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.",
          "பொருள்: கற்க வேண்டிய நூல்களைக் குற்றமறக் கற்க வேண்டும்; கற்ற பிறகு, அந்தக் கல்விக்குத் தகுந்தபடி நல்ல வழியில் நடக்க வேண்டும்.",
          "எண்ணென்ப ஏனை எழுத்தென்ப இவ்விரண்டும் கண்ணென்ப வாழும் உயிர்க்கு.",
          "பொருள்: எண் எனப்படும் கணிதமும், எழுத்து எனப்படும் மொழியும் வாழும் மனிதர்களுக்கு இரு கண்கள் போன்றவை.",
        ],
      },
      {
        title: "அதிகாரம் 40 — கல்வியின் பெருமை",
        paragraphs: [
          "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக் கற்றனைத் தூறும் அறிவு.",
          "பொருள்: மணலில் தோண்டத் தோண்ட ஊற்று நீர் பெருகுவது போல, மனிதர்கள் கற்கக் கற்க அறிவு வளர்ந்து கொண்டே இருக்கும்.",
          "கேடில் விழுச்செல்வம் கல்வி ஒருவற்கு மாடல்ல மற்றை யவை.",
          "பொருள்: ஒருவருக்கு அழிவில்லாத சிறந்த செல்வம் கல்வி மட்டுமே; மற்ற செல்வங்கள் எல்லாம் நிலைத்த செல்வம் ஆகாது.",
        ],
      },
    ],
  },
  {
    id: "sample-hi-story",
    title: "सच्चा मित्र (A True Friend — Hindi)",
    fileName: "Sacha-Mitra-Hindi.txt",
    format: "sample",
    wordCount: 124,
    pages: [
      {
        title: "अध्याय 1 — जंगल की दोस्ती",
        paragraphs: [
          "एक सुंदर जंगल में एक हिरण और एक कौआ बहुत अच्छे मित्र थे। वे रोज़ सुबह नदी के किनारे मिलते और मिलकर भोजन खोजते थे।",
          "एक दिन हिरण शिकारी के जाल में फँस गया। कौए ने तुरंत अपने मित्र चूहे को बुलाया। चूहे ने अपने तेज़ दाँतों से जाल काट दिया और हिरण आज़ाद हो गया।",
          "सीख: सच्चा मित्र वही है जो मुसीबत के समय काम आए।",
        ],
      },
      {
        title: "अध्याय 2 — एकता की शक्ति",
        paragraphs: [
          "आज़ाद होने के बाद हिरण, कौआ और चूहा तीनों एक साथ नदी के किनारे बैठे। उन्होंने वादा किया कि वे हमेशा एक-दूसरे की रक्षा करेंगे।",
          "जंगल के बाकी जानवरों ने भी उनकी दोस्ती से सीखा कि मिल-जुलकर रहने से बड़ी से बड़ी कठिनाई दूर हो जाती है।",
        ],
      },
    ],
  },
  {
    id: "sample-world-langs",
    title: "Indian & World Languages Reader (12 Scripts)",
    fileName: "Multilingual-Showcase.txt",
    format: "sample",
    wordCount: 112,
    pages: [
      {
        title: "Page 1 — Indian Languages",
        paragraphs: [
          "Tamil (தமிழ்): கல்வி கரையில, கற்பவர் நாள் சில.",
          "Hindi (हिन्दी): विद्या ददाति विनयम् — ज्ञान विनम्रता देता है।",
          "Telugu (తెలుగు): చదువు మనిషికి నిజమైన సంపద.",
          "Malayalam (മലയാളം): വിദ്യാധനം സർവ്വധനാൽ പ്രധാനം.",
          "Kannada (ಕನ್ನಡ): ವಿದ್ಯೆ ವಿನಯವನ್ನು ನೀಡುತ್ತದೆ.",
          "Bengali (বাংলা): শিক্ষাই জাতির মেরুদণ্ড।",
          "Gujarati (ગુજરાતી): વિદ્યા વિનયથી શોભે છે.",
          "Punjabi (ਪੰਜਾਬੀ): ਵਿੱਦਿਆ ਵਿਚਾਰੀ ਤਾਂ ਪਰਉਪਕਾਰੀ।",
        ],
      },
      {
        title: "Page 2 — World Foreign Languages",
        paragraphs: [
          "French (Français): Lire, c'est voyager sans quitter sa chaise.",
          "Spanish (Español): Un libro abierto es un cerebro que habla.",
          "Arabic (العربية): العلم نور يضيء طريق الحياة.",
          "Japanese (日本語): 読書は心の栄養です。",
          "Korean (한국어): 책은 마음의 양식입니다.",
          "Chinese (中文): 读书破万卷，下笔如有神。",
        ],
      },
    ],
  },
];