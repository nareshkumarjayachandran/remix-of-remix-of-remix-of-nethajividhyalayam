import type { KindleDocument } from "./kindleFileParser";

export const KINDLE_SAMPLE_BOOKS: KindleDocument[] = [
  {
    id: "sample-en-story",
    title: "The Clever Rabbit & The Lion (Panchatantra)",
    fileName: "Panchatantra-Sample.txt",
    format: "sample",
    wordCount: 162,
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
    ],
  },
  {
    id: "sample-ta-kural",
    title: "திருக்குறள் — கல்வி (Thirukkural on Learning)",
    fileName: "Thirukkural-Tamil.txt",
    format: "sample",
    wordCount: 74,
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
    ],
  },
  {
    id: "sample-hi-story",
    title: "सच्चा मित्र (A True Friend — Hindi)",
    fileName: "Sacha-Mitra-Hindi.txt",
    format: "sample",
    wordCount: 78,
    pages: [
      {
        title: "अध्याय 1 — जंगल की दोस्ती",
        paragraphs: [
          "एक सुंदर जंगल में एक हिरण और एक कौआ बहुत अच्छे मित्र थे। वे रोज़ सुबह नदी के किनारे मिलते और मिलकर भोजन खोजते थे।",
          "एक दिन हिरण शिकारी के जाल में फँस गया। कौए ने तुरंत अपने मित्र चूहे को बुलाया। चूहे ने अपने तेज़ दाँतों से जाल काट दिया और हिरण आज़ाद हो गया।",
          "सीख: सच्चा मित्र वही है जो मुसीबत के समय काम आए।",
        ],
      },
    ],
  },
];