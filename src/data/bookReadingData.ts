// ── Textbook Reading Data for Samacheer Kalvi & Oxford Merry Birds ──────────
// Structure: Curriculum → Grade → Term → Chapter (with optional hardcoded content)

export interface ChapterContent {
  title: string;
  type: "prose" | "poem" | "rhyme" | "story" | "lesson";
  emoji: string;
  /** Hardcoded sentences for reading practice. If empty, AI generates content. */
  sentences: string[];
  /** Tamil translation of each sentence (parallel array). If empty, AI generates. */
  tamilTranslations?: string[];
  /** Key vocabulary words with Tamil meanings */
  vocabulary?: { word: string; tamil: string; meaning: string }[];
}

export interface TermData {
  label: string;
  chapters: ChapterContent[];
}

export interface GradeData {
  label: string;
  terms: TermData[];
}

export interface CurriculumData {
  label: string;
  emoji: string;
  grades: Record<string, GradeData>;
}

export const BOOK_READING_DATA: Record<string, CurriculumData> = {
  samacheer: {
    label: "Samacheer Kalvi",
    emoji: "📖",
    grades: {
      "Pre-KG": {
        label: "Pre-KG",
        terms: [
          {
            label: "Term 1",
            chapters: [
              {
                title: "My Family",
                type: "lesson",
                emoji: "👨‍👩‍👧‍👦",
                sentences: [
                  "This is my family.",
                  "My father is tall.",
                  "My mother is kind.",
                  "I have a brother.",
                  "I have a sister.",
                  "We live in a happy home.",
                  "I love my family.",
                ],
                tamilTranslations: [
                  "இது என் குடும்பம்.",
                  "என் அப்பா உயரமானவர்.",
                  "என் அம்மா கருணையானவர்.",
                  "எனக்கு ஒரு தம்பி இருக்கிறான்.",
                  "எனக்கு ஒரு தங்கை இருக்கிறாள்.",
                  "நாங்கள் ஒரு மகிழ்ச்சியான வீட்டில் வாழ்கிறோம்.",
                  "நான் என் குடும்பத்தை நேசிக்கிறேன்.",
                ],
                vocabulary: [
                  { word: "family", tamil: "குடும்பம்", meaning: "a group of parents and children" },
                  { word: "father", tamil: "அப்பா", meaning: "dad, papa" },
                  { word: "mother", tamil: "அம்மா", meaning: "mom, mama" },
                  { word: "brother", tamil: "தம்பி/அண்ணன்", meaning: "a boy sibling" },
                  { word: "sister", tamil: "தங்கை/அக்கா", meaning: "a girl sibling" },
                ],
              },
              {
                title: "Colours Around Me",
                type: "lesson",
                emoji: "🌈",
                sentences: [
                  "Red is the colour of an apple.",
                  "Blue is the colour of the sky.",
                  "Green is the colour of the leaves.",
                  "Yellow is the colour of the sun.",
                  "Orange is the colour of a carrot.",
                  "I can see many colours around me.",
                ],
                tamilTranslations: [
                  "சிவப்பு என்பது ஆப்பிளின் நிறம்.",
                  "நீலம் என்பது வானத்தின் நிறம்.",
                  "பச்சை என்பது இலைகளின் நிறம்.",
                  "மஞ்சள் என்பது சூரியனின் நிறம்.",
                  "ஆரஞ்சு என்பது கேரட்டின் நிறம்.",
                  "நான் என்னைச் சுற்றி பல நிறங்களைப் பார்க்கிறேன்.",
                ],
                vocabulary: [
                  { word: "colour", tamil: "நிறம்", meaning: "the appearance of things" },
                  { word: "apple", tamil: "ஆப்பிள்", meaning: "a round red fruit" },
                  { word: "sky", tamil: "வானம்", meaning: "the space above us" },
                ],
              },
              {
                title: "Twinkle Twinkle Little Star",
                type: "rhyme",
                emoji: "⭐",
                sentences: [
                  "Twinkle, twinkle, little star,",
                  "How I wonder what you are!",
                  "Up above the world so high,",
                  "Like a diamond in the sky.",
                  "Twinkle, twinkle, little star,",
                  "How I wonder what you are!",
                ],
                tamilTranslations: [
                  "மின்னு, மின்னு, சிறிய நட்சத்திரமே,",
                  "நீ என்ன என்று நான் ஆச்சரியப்படுகிறேன்!",
                  "உலகத்திற்கு மேலே மிக உயரமாக,",
                  "வானத்தில் ஒரு வைரம் போல.",
                  "மின்னு, மின்னு, சிறிய நட்சத்திரமே,",
                  "நீ என்ன என்று நான் ஆச்சரியப்படுகிறேன்!",
                ],
                vocabulary: [
                  { word: "twinkle", tamil: "மின்னுதல்", meaning: "to shine with light" },
                  { word: "wonder", tamil: "ஆச்சரியம்", meaning: "to think about curiously" },
                  { word: "diamond", tamil: "வைரம்", meaning: "a precious shining stone" },
                ],
              },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              {
                title: "Animals I See",
                type: "lesson",
                emoji: "🐾",
                sentences: [
                  "I can see a cat.",
                  "The cat says meow.",
                  "I can see a dog.",
                  "The dog says bow wow.",
                  "I can see a cow.",
                  "The cow says moo.",
                  "I love animals.",
                ],
                tamilTranslations: [
                  "நான் ஒரு பூனையைப் பார்க்கிறேன்.",
                  "பூனை மியாவ் என்கிறது.",
                  "நான் ஒரு நாயைப் பார்க்கிறேன்.",
                  "நாய் வௌ வௌ என்கிறது.",
                  "நான் ஒரு பசுவைப் பார்க்கிறேன்.",
                  "பசு மா என்கிறது.",
                  "நான் விலங்குகளை நேசிக்கிறேன்.",
                ],
                vocabulary: [
                  { word: "cat", tamil: "பூனை", meaning: "a small furry pet" },
                  { word: "dog", tamil: "நாய்", meaning: "a loyal pet animal" },
                  { word: "cow", tamil: "பசு", meaning: "gives us milk" },
                ],
              },
              {
                title: "Johnny Johnny Yes Papa",
                type: "rhyme",
                emoji: "👶",
                sentences: [
                  "Johnny, Johnny! Yes, Papa?",
                  "Eating sugar? No, Papa!",
                  "Telling lies? No, Papa!",
                  "Open your mouth. Ha ha ha!",
                ],
                tamilTranslations: [
                  "ஜானி, ஜானி! ஆமா, அப்பா?",
                  "சர்க்கரை சாப்பிடுகிறாயா? இல்லை, அப்பா!",
                  "பொய் சொல்கிறாயா? இல்லை, அப்பா!",
                  "வாயைத் திற. ஹா ஹா ஹா!",
                ],
              },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              {
                title: "Fruits I Like",
                type: "lesson",
                emoji: "🍎",
                sentences: [
                  "I like mangoes.",
                  "Mangoes are sweet and yellow.",
                  "I like bananas.",
                  "Bananas are long and yellow.",
                  "I like grapes.",
                  "Grapes are round and small.",
                  "Fruits are good for health.",
                ],
                tamilTranslations: [
                  "எனக்கு மாம்பழம் பிடிக்கும்.",
                  "மாம்பழங்கள் இனிப்பாகவும் மஞ்சளாகவும் இருக்கும்.",
                  "எனக்கு வாழைப்பழம் பிடிக்கும்.",
                  "வாழைப்பழங்கள் நீளமாகவும் மஞ்சளாகவும் இருக்கும்.",
                  "எனக்கு திராட்சை பிடிக்கும்.",
                  "திராட்சைகள் உருண்டையாகவும் சிறியதாகவும் இருக்கும்.",
                  "பழங்கள் ஆரோக்கியத்திற்கு நல்லது.",
                ],
              },
              {
                title: "Baa Baa Black Sheep",
                type: "rhyme",
                emoji: "🐑",
                sentences: [
                  "Baa, baa, black sheep, have you any wool?",
                  "Yes sir, yes sir, three bags full.",
                  "One for the master, one for the dame,",
                  "And one for the little boy who lives down the lane.",
                ],
                tamilTranslations: [
                  "பா, பா, கருப்பு ஆடு, உன்னிடம் கம்பளி இருக்கிறதா?",
                  "ஆமாம் ஐயா, ஆமாம் ஐயா, மூன்று பை நிறைய.",
                  "ஒன்று எஜமானருக்கு, ஒன்று பெண்மணிக்கு,",
                  "ஒன்று தெருவில் வாழும் சிறுவனுக்கு.",
                ],
              },
            ],
          },
        ],
      },
      LKG: {
        label: "LKG",
        terms: [
          {
            label: "Term 1",
            chapters: [
              {
                title: "My School",
                type: "lesson",
                emoji: "🏫",
                sentences: [
                  "I go to school every day.",
                  "My school is very big.",
                  "I have many friends at school.",
                  "My teacher is very kind.",
                  "I learn to read and write.",
                  "I play with my friends.",
                  "I love my school.",
                ],
                tamilTranslations: [
                  "நான் தினமும் பள்ளிக்குச் செல்கிறேன்.",
                  "என் பள்ளி மிகப் பெரியது.",
                  "பள்ளியில் எனக்கு நிறைய நண்பர்கள் இருக்கிறார்கள்.",
                  "என் ஆசிரியர் மிகவும் கருணையானவர்.",
                  "நான் படிக்கவும் எழுதவும் கற்றுக்கொள்கிறேன்.",
                  "நான் என் நண்பர்களுடன் விளையாடுகிறேன்.",
                  "நான் என் பள்ளியை நேசிக்கிறேன்.",
                ],
                vocabulary: [
                  { word: "school", tamil: "பள்ளி", meaning: "a place to learn" },
                  { word: "teacher", tamil: "ஆசிரியர்", meaning: "one who teaches" },
                  { word: "friends", tamil: "நண்பர்கள்", meaning: "people we like" },
                ],
              },
              {
                title: "Humpty Dumpty",
                type: "rhyme",
                emoji: "🥚",
                sentences: [
                  "Humpty Dumpty sat on a wall.",
                  "Humpty Dumpty had a great fall.",
                  "All the king's horses and all the king's men",
                  "Couldn't put Humpty together again.",
                ],
                tamilTranslations: [
                  "ஹம்ப்டி டம்ப்டி சுவரின் மேல் அமர்ந்தான்.",
                  "ஹம்ப்டி டம்ப்டி கீழே விழுந்தான்.",
                  "ராஜாவின் எல்லா குதிரைகளும் ராஜாவின் எல்லா ஆட்களும்",
                  "ஹம்ப்டியை மீண்டும் சேர்க்க முடியவில்லை.",
                ],
              },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              {
                title: "My Body",
                type: "lesson",
                emoji: "🧒",
                sentences: [
                  "I have a head on top.",
                  "I have two eyes to see.",
                  "I have two ears to hear.",
                  "I have a nose to smell.",
                  "I have a mouth to eat and talk.",
                  "I have two hands to hold things.",
                  "I have two legs to walk and run.",
                  "My body is wonderful!",
                ],
                tamilTranslations: [
                  "எனக்கு மேலே ஒரு தலை இருக்கிறது.",
                  "பார்ப்பதற்கு எனக்கு இரண்டு கண்கள் இருக்கின்றன.",
                  "கேட்பதற்கு எனக்கு இரண்டு காதுகள் இருக்கின்றன.",
                  "மணப்பதற்கு எனக்கு ஒரு மூக்கு இருக்கிறது.",
                  "சாப்பிடவும் பேசவும் எனக்கு ஒரு வாய் இருக்கிறது.",
                  "பொருட்களைப் பிடிக்க எனக்கு இரண்டு கைகள் இருக்கின்றன.",
                  "நடக்கவும் ஓடவும் எனக்கு இரண்டு கால்கள் இருக்கின்றன.",
                  "என் உடல் அற்புதமானது!",
                ],
              },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              {
                title: "Nature Around Us",
                type: "lesson",
                emoji: "🌳",
                sentences: [
                  "The sun gives us light.",
                  "The moon shines at night.",
                  "Trees give us fresh air.",
                  "Birds fly in the sky.",
                  "Fish swim in the water.",
                  "Flowers are beautiful.",
                  "I love nature.",
                ],
                tamilTranslations: [
                  "சூரியன் நமக்கு ஒளி தருகிறது.",
                  "நிலா இரவில் ஒளிர்கிறது.",
                  "மரங்கள் நமக்குச் சுத்தமான காற்றைத் தருகின்றன.",
                  "பறவைகள் வானில் பறக்கின்றன.",
                  "மீன்கள் நீரில் நீந்துகின்றன.",
                  "மலர்கள் அழகானவை.",
                  "நான் இயற்கையை நேசிக்கிறேன்.",
                ],
              },
              {
                title: "Jack and Jill",
                type: "rhyme",
                emoji: "⛰️",
                sentences: [
                  "Jack and Jill went up the hill",
                  "To fetch a pail of water.",
                  "Jack fell down and broke his crown,",
                  "And Jill came tumbling after.",
                ],
                tamilTranslations: [
                  "ஜாக்கும் ஜில்லும் மலை மேல் சென்றார்கள்",
                  "ஒரு வாளி தண்ணீர் எடுக்க.",
                  "ஜாக் கீழே விழுந்து தலையை அடித்துக்கொண்டான்,",
                  "ஜில்லும் உருண்டு விழுந்தாள்.",
                ],
              },
            ],
          },
        ],
      },
      UKG: {
        label: "UKG",
        terms: [
          {
            label: "Term 1",
            chapters: [
              {
                title: "Good Habits",
                type: "lesson",
                emoji: "✨",
                sentences: [
                  "I wake up early in the morning.",
                  "I brush my teeth every day.",
                  "I take a bath and wear clean clothes.",
                  "I eat healthy food.",
                  "I say please and thank you.",
                  "I help my parents at home.",
                  "I share my toys with friends.",
                  "Good habits make us happy.",
                ],
                tamilTranslations: [
                  "நான் காலையில் சீக்கிரம் எழுகிறேன்.",
                  "நான் தினமும் பல் துலக்குகிறேன்.",
                  "நான் குளித்துச் சுத்தமான ஆடை அணிகிறேன்.",
                  "நான் ஆரோக்கியமான உணவு சாப்பிடுகிறேன்.",
                  "நான் தயவுசெய்து என்றும் நன்றி என்றும் சொல்கிறேன்.",
                  "நான் வீட்டில் என் பெற்றோருக்கு உதவுகிறேன்.",
                  "நான் என் பொம்மைகளை நண்பர்களுடன் பகிர்ந்துகொள்கிறேன்.",
                  "நல்ல பழக்கங்கள் நம்மை மகிழ்ச்சியாக வைக்கும்.",
                ],
                vocabulary: [
                  { word: "habits", tamil: "பழக்கங்கள்", meaning: "things we do regularly" },
                  { word: "healthy", tamil: "ஆரோக்கியமான", meaning: "good for the body" },
                  { word: "share", tamil: "பகிர்", meaning: "give part of something" },
                ],
              },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              {
                title: "Seasons",
                type: "lesson",
                emoji: "🌦️",
                sentences: [
                  "Summer is hot and sunny.",
                  "We eat ice cream in summer.",
                  "Rainy season brings cool water.",
                  "We use umbrellas when it rains.",
                  "Winter is cold and windy.",
                  "We wear sweaters in winter.",
                  "I like all the seasons.",
                ],
                tamilTranslations: [
                  "கோடை வெப்பமாகவும் வெயிலாகவும் இருக்கும்.",
                  "கோடையில் நாம் ஐஸ்கிரீம் சாப்பிடுவோம்.",
                  "மழைக்காலம் குளிர்ந்த நீரைக் கொண்டுவருகிறது.",
                  "மழை பெய்யும்போது நாம் குடை பயன்படுத்துவோம்.",
                  "குளிர்காலம் குளிராகவும் காற்றாகவும் இருக்கும்.",
                  "குளிர்காலத்தில் நாம் ஸ்வெட்டர் அணிவோம்.",
                  "எனக்கு எல்லா பருவங்களும் பிடிக்கும்.",
                ],
              },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              {
                title: "Transport",
                type: "lesson",
                emoji: "🚗",
                sentences: [
                  "I go to school by bus.",
                  "Cars run on the road.",
                  "Trains run on tracks.",
                  "Ships sail on the sea.",
                  "Aeroplanes fly in the sky.",
                  "Bicycles have two wheels.",
                  "Transport helps us travel.",
                ],
                tamilTranslations: [
                  "நான் பேருந்தில் பள்ளிக்குச் செல்கிறேன்.",
                  "கார்கள் சாலையில் ஓடுகின்றன.",
                  "ரயில்கள் தண்டவாளத்தில் ஓடுகின்றன.",
                  "கப்பல்கள் கடலில் செல்கின்றன.",
                  "விமானங்கள் வானில் பறக்கின்றன.",
                  "மிதிவண்டிகளுக்கு இரண்டு சக்கரங்கள் உள்ளன.",
                  "போக்குவரத்து நம்மை பயணிக்க உதவுகிறது.",
                ],
              },
              {
                title: "Wheels on the Bus",
                type: "rhyme",
                emoji: "🚌",
                sentences: [
                  "The wheels on the bus go round and round,",
                  "Round and round, round and round.",
                  "The wheels on the bus go round and round,",
                  "All through the town.",
                  "The wipers on the bus go swish, swish, swish.",
                  "The horn on the bus goes beep, beep, beep.",
                ],
                tamilTranslations: [
                  "பேருந்தின் சக்கரங்கள் சுற்றிச் சுற்றி வருகின்றன,",
                  "சுற்றிச் சுற்றி, சுற்றிச் சுற்றி.",
                  "பேருந்தின் சக்கரங்கள் சுற்றிச் சுற்றி வருகின்றன,",
                  "ஊர் முழுவதும்.",
                  "பேருந்தின் ஒயிப்பர்கள் ஸ்விஷ், ஸ்விஷ், ஸ்விஷ் என்கின்றன.",
                  "பேருந்தின் ஹார்ன் பீப், பீப், பீப் என்கிறது.",
                ],
              },
            ],
          },
        ],
      },
      "1st": {
        label: "1st Standard",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "The Lion and the Mouse", type: "story", emoji: "🦁", sentences: [
                "A big lion was sleeping under a tree.",
                "A small mouse ran over the lion.",
                "The lion caught the mouse.",
                "Please let me go, said the mouse.",
                "I will help you one day.",
                "The lion laughed but let the mouse go.",
                "One day, the lion was caught in a net.",
                "The mouse came and cut the net.",
                "The lion was free!",
                "The lion thanked the mouse.",
              ], tamilTranslations: [
                "ஒரு பெரிய சிங்கம் ஒரு மரத்தின் கீழ் தூங்கிக்கொண்டிருந்தது.",
                "ஒரு சிறிய எலி சிங்கத்தின் மேல் ஓடியது.",
                "சிங்கம் எலியைப் பிடித்தது.",
                "தயவுசெய்து என்னை விடுங்கள் என்று எலி சொன்னது.",
                "ஒரு நாள் நான் உங்களுக்கு உதவுவேன்.",
                "சிங்கம் சிரித்தது ஆனால் எலியை விட்டது.",
                "ஒரு நாள், சிங்கம் ஒரு வலையில் சிக்கியது.",
                "எலி வந்து வலையை வெட்டியது.",
                "சிங்கம் விடுபட்டது!",
                "சிங்கம் எலிக்கு நன்றி சொன்னது.",
              ], vocabulary: [
                { word: "lion", tamil: "சிங்கம்", meaning: "the king of the jungle" },
                { word: "mouse", tamil: "எலி", meaning: "a small animal" },
                { word: "net", tamil: "வலை", meaning: "a rope mesh used for catching" },
              ] },
              { title: "Rain, Rain, Go Away", type: "poem", emoji: "🌧️", sentences: [
                "Rain, rain, go away,",
                "Come again another day.",
                "Little Johnny wants to play,",
                "Rain, rain, go away.",
              ], tamilTranslations: [
                "மழையே, மழையே, போய்விடு,",
                "இன்னொரு நாள் மீண்டும் வா.",
                "சிறிய ஜானி விளையாட விரும்புகிறான்,",
                "மழையே, மழையே, போய்விடு.",
              ] },
              { title: "My Classroom", type: "lesson", emoji: "📚", sentences: [], vocabulary: [] },
              { title: "The Clever Fox", type: "story", emoji: "🦊", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "The Thirsty Crow", type: "story", emoji: "🐦‍⬛", sentences: [
                "A crow was very thirsty.",
                "He looked for water everywhere.",
                "He found a pot with a little water.",
                "His beak could not reach the water.",
                "He had a clever idea.",
                "He dropped small stones into the pot.",
                "The water came up slowly.",
                "The crow drank the water happily.",
                "Being clever helps us solve problems.",
              ], tamilTranslations: [
                "ஒரு காகம் மிகவும் தாகமாக இருந்தது.",
                "அது எல்லா இடத்திலும் தண்ணீர் தேடியது.",
                "கொஞ்சம் தண்ணீர் கொண்ட ஒரு பானையைக் கண்டது.",
                "அதன் அலகு தண்ணீரை எட்ட முடியவில்லை.",
                "அது ஒரு புத்திசாலித்தனமான யோசனை கொண்டிருந்தது.",
                "அது சிறிய கற்களை பானையில் போட்டது.",
                "தண்ணீர் மெதுவாக மேலே வந்தது.",
                "காகம் மகிழ்ச்சியாக தண்ணீர் குடித்தது.",
                "புத்திசாலியாக இருப்பது பிரச்சனைகளைத் தீர்க்க உதவுகிறது.",
              ] },
              { title: "Flowers in the Garden", type: "poem", emoji: "🌸", sentences: [], vocabulary: [] },
              { title: "Helping Hands", type: "lesson", emoji: "🤝", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "The Honest Woodcutter", type: "story", emoji: "🪓", sentences: [], vocabulary: [] },
              { title: "Our Earth", type: "poem", emoji: "🌍", sentences: [], vocabulary: [] },
              { title: "Festivals of India", type: "lesson", emoji: "🎉", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      "2nd": {
        label: "2nd Standard",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "The Magic Pot", type: "story", emoji: "🏺", sentences: [
                "There was a poor farmer.",
                "He found a magic pot in his field.",
                "Whatever he put inside the pot doubled.",
                "He put one gold coin and got two.",
                "He put two gold coins and got four.",
                "He became very rich.",
                "He shared his wealth with the villagers.",
                "Everyone was happy.",
              ], tamilTranslations: [
                "ஒரு ஏழை விவசாயி இருந்தான்.",
                "அவன் தன் வயலில் ஒரு மந்திரப் பானையைக் கண்டான்.",
                "பானைக்குள் என்ன போட்டாலும் இரட்டிப்பாகும்.",
                "ஒரு தங்க நாணயத்தைப் போட்டு இரண்டு கிடைத்தது.",
                "இரண்டு தங்க நாணயங்களைப் போட்டு நான்கு கிடைத்தது.",
                "அவன் மிகவும் பணக்காரன் ஆனான்.",
                "அவன் தன் செல்வத்தை கிராம மக்களுடன் பகிர்ந்தான்.",
                "எல்லோரும் மகிழ்ச்சியாக இருந்தார்கள்.",
              ] },
              { title: "Birds and Their Nests", type: "lesson", emoji: "🐦", sentences: [], vocabulary: [] },
              { title: "My Garden", type: "poem", emoji: "🌻", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "The Greedy Dog", type: "story", emoji: "🐕", sentences: [], vocabulary: [] },
              { title: "Water is Life", type: "lesson", emoji: "💧", sentences: [], vocabulary: [] },
              { title: "Boats and Ships", type: "poem", emoji: "⛵", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "The Sun and the Wind", type: "story", emoji: "🌬️", sentences: [], vocabulary: [] },
              { title: "Our Helpers", type: "lesson", emoji: "👮", sentences: [], vocabulary: [] },
              { title: "A Beautiful World", type: "poem", emoji: "🌎", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      "3rd": {
        label: "3rd Standard",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "Birds of a Feather", type: "story", emoji: "🦅", sentences: [
                "Two friends lived in a village.",
                "One was honest and the other was not.",
                "They went to the forest together.",
                "They found a bag of gold coins.",
                "The dishonest friend wanted all the gold.",
                "He hid the gold in a tree.",
                "Later, the tree caught fire.",
                "The dishonest friend lost everything.",
                "Honesty is the best policy.",
              ], tamilTranslations: [
                "இரண்டு நண்பர்கள் ஒரு கிராமத்தில் வாழ்ந்தார்கள்.",
                "ஒருவன் நேர்மையானவன், மற்றவன் இல்லை.",
                "அவர்கள் ஒன்றாக காட்டுக்குச் சென்றார்கள்.",
                "அவர்கள் ஒரு பை தங்க நாணயங்களைக் கண்டார்கள்.",
                "நேர்மையற்ற நண்பன் எல்லா தங்கத்தையும் விரும்பினான்.",
                "அவன் தங்கத்தை ஒரு மரத்தில் ஒளித்தான்.",
                "பின்னர், மரம் தீப்பிடித்தது.",
                "நேர்மையற்ற நண்பன் எல்லாவற்றையும் இழந்தான்.",
                "நேர்மையே சிறந்த கொள்கை.",
              ] },
              { title: "The Rainbow", type: "poem", emoji: "🌈", sentences: [], vocabulary: [] },
              { title: "Science Around Us", type: "lesson", emoji: "🔬", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "The Giving Tree", type: "story", emoji: "🌳", sentences: [], vocabulary: [] },
              { title: "My Country India", type: "lesson", emoji: "🇮🇳", sentences: [], vocabulary: [] },
              { title: "Moon Song", type: "poem", emoji: "🌙", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "The Little Engine", type: "story", emoji: "🚂", sentences: [], vocabulary: [] },
              { title: "Healthy Eating", type: "lesson", emoji: "🥗", sentences: [], vocabulary: [] },
              { title: "Trees are Green", type: "poem", emoji: "🌲", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      "4th": {
        label: "4th Standard",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "The Cap Seller and the Monkeys", type: "story", emoji: "🐒", sentences: [
                "A cap seller walked through a forest.",
                "He was very tired and sat under a tree.",
                "He kept his caps beside him and slept.",
                "When he woke up, all his caps were gone!",
                "He looked up and saw monkeys wearing them.",
                "He thought of a clever plan.",
                "He threw his own cap on the ground.",
                "The monkeys copied him and threw their caps too.",
                "The cap seller collected all his caps and went away happily.",
              ], tamilTranslations: [
                "ஒரு தொப்பி விற்பவன் காட்டு வழியே நடந்தான்.",
                "அவன் மிகவும் சோர்வாக இருந்ததால் ஒரு மரத்தின் கீழ் அமர்ந்தான்.",
                "தொப்பிகளை பக்கத்தில் வைத்துவிட்டு தூங்கினான்.",
                "விழித்தபோது, எல்லா தொப்பிகளும் காணவில்லை!",
                "மேலே பார்த்தான், குரங்குகள் அவற்றை அணிந்திருந்தன.",
                "அவன் ஒரு புத்திசாலித்தனமான திட்டம் நினைத்தான்.",
                "தன் சொந்த தொப்பியை தரையில் எறிந்தான்.",
                "குரங்குகளும் அவனைப் பின்பற்றி தொப்பிகளை எறிந்தன.",
                "தொப்பி விற்பவன் எல்லா தொப்பிகளையும் சேகரித்துக்கொண்டு மகிழ்ச்சியாகச் சென்றான்.",
              ] },
              { title: "The River Song", type: "poem", emoji: "🏞️", sentences: [], vocabulary: [] },
              { title: "Famous Scientists", type: "lesson", emoji: "🧪", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "The Golden Goose", type: "story", emoji: "🪿", sentences: [], vocabulary: [] },
              { title: "Saving Water", type: "lesson", emoji: "🚰", sentences: [], vocabulary: [] },
              { title: "Kite Flying", type: "poem", emoji: "🪁", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "Unity is Strength", type: "story", emoji: "💪", sentences: [], vocabulary: [] },
              { title: "Indian Festivals", type: "lesson", emoji: "🪔", sentences: [], vocabulary: [] },
              { title: "My Dream", type: "poem", emoji: "💭", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      "5th": {
        label: "5th Standard",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "The Brave Little Turtle", type: "story", emoji: "🐢", sentences: [
                "A little turtle lived near the sea.",
                "All the other turtles could swim fast.",
                "But the little turtle was afraid of water.",
                "One day, a big wave came towards the shore.",
                "The little turtle had to be brave.",
                "He jumped into the water to save his friend.",
                "He swam faster than ever before.",
                "Everyone cheered for the brave little turtle.",
                "We must face our fears with courage.",
              ], tamilTranslations: [
                "ஒரு சிறிய ஆமை கடலுக்கு அருகில் வாழ்ந்தது.",
                "மற்ற எல்லா ஆமைகளும் வேகமாக நீந்த முடியும்.",
                "ஆனால் சிறிய ஆமை தண்ணீருக்குப் பயந்தது.",
                "ஒரு நாள், ஒரு பெரிய அலை கரையை நோக்கி வந்தது.",
                "சிறிய ஆமை தைரியமாக இருக்க வேண்டியிருந்தது.",
                "அது தன் நண்பனைக் காப்பாற்ற தண்ணீருக்குள் குதித்தது.",
                "அது முன்னெப்போதும் இல்லாத வேகத்தில் நீந்தியது.",
                "எல்லோரும் தைரியமான சிறிய ஆமைக்கு கை தட்டினார்கள்.",
                "நாம் நம் பயங்களை தைரியத்துடன் எதிர்கொள்ள வேண்டும்.",
              ] },
              { title: "The Wind", type: "poem", emoji: "💨", sentences: [], vocabulary: [] },
              { title: "Wonders of Space", type: "lesson", emoji: "🚀", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "King Bruce and the Spider", type: "story", emoji: "🕷️", sentences: [], vocabulary: [] },
              { title: "Pollution and Solutions", type: "lesson", emoji: "🏭", sentences: [], vocabulary: [] },
              { title: "The Mountain Song", type: "poem", emoji: "⛰️", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "Tenali Raman's Wisdom", type: "story", emoji: "🧠", sentences: [], vocabulary: [] },
              { title: "Digital World", type: "lesson", emoji: "💻", sentences: [], vocabulary: [] },
              { title: "Freedom Song", type: "poem", emoji: "🕊️", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
    },
  },
  oxford: {
    label: "Oxford Merry Birds",
    emoji: "🐦",
    grades: {
      "Pre-KG": {
        label: "Pre-KG",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "Hello Song", type: "rhyme", emoji: "👋", sentences: [
                "Hello, hello, how are you?",
                "I am fine, thank you!",
                "Hello, hello, what is your name?",
                "My name is happy, let us play a game!",
              ], tamilTranslations: [
                "ஹலோ, ஹலோ, நீ எப்படி இருக்கிறாய்?",
                "நான் நலமாக இருக்கிறேன், நன்றி!",
                "ஹலோ, ஹலோ, உன் பெயர் என்ன?",
                "என் பெயர் ஹேப்பி, நாம் ஒரு விளையாட்டு விளையாடலாம்!",
              ] },
              { title: "My Toys", type: "lesson", emoji: "🧸", sentences: [
                "I have a teddy bear.",
                "My teddy bear is brown and soft.",
                "I have a toy car.",
                "My toy car is red and fast.",
                "I have a doll.",
                "My doll has pretty hair.",
                "I love my toys.",
              ], tamilTranslations: [
                "என்னிடம் ஒரு டெடி பியர் இருக்கிறது.",
                "என் டெடி பியர் பழுப்பு நிறம் மற்றும் மென்மையானது.",
                "என்னிடம் ஒரு பொம்மை கார் இருக்கிறது.",
                "என் பொம்மை கார் சிவப்பு நிறம் மற்றும் வேகமானது.",
                "என்னிடம் ஒரு பொம்மை இருக்கிறது.",
                "என் பொம்மைக்கு அழகான தலைமுடி இருக்கிறது.",
                "நான் என் பொம்மைகளை நேசிக்கிறேன்.",
              ] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "One Two Buckle My Shoe", type: "rhyme", emoji: "👟", sentences: [
                "One, two, buckle my shoe.",
                "Three, four, knock at the door.",
                "Five, six, pick up sticks.",
                "Seven, eight, lay them straight.",
                "Nine, ten, a big fat hen!",
              ], tamilTranslations: [
                "ஒன்று, இரண்டு, என் காலணியைக் கட்டு.",
                "மூன்று, நான்கு, கதவைத் தட்டு.",
                "ஐந்து, ஆறு, குச்சிகளை எடு.",
                "ஏழு, எட்டு, அவற்றை நேராக வை.",
                "ஒன்பது, பத்து, ஒரு பெரிய கொழுத்த கோழி!",
              ] },
              { title: "At the Park", type: "lesson", emoji: "🏞️", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "Incy Wincy Spider", type: "rhyme", emoji: "🕷️", sentences: [
                "Incy Wincy Spider climbed up the water spout.",
                "Down came the rain and washed the spider out.",
                "Out came the sun and dried up all the rain.",
                "And Incy Wincy Spider climbed up the spout again.",
              ], tamilTranslations: [
                "சிறிய சிலந்தி நீர் குழாயில் ஏறியது.",
                "மழை வந்து சிலந்தியை அடித்துச் சென்றது.",
                "சூரியன் வந்து மழையை உலர்த்தியது.",
                "சிறிய சிலந்தி மீண்டும் குழாயில் ஏறியது.",
              ] },
              { title: "My Pet", type: "lesson", emoji: "🐶", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      LKG: {
        label: "LKG",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "I Can See", type: "lesson", emoji: "👀", sentences: [
                "I can see a bird in the tree.",
                "I can see a fish in the pond.",
                "I can see a butterfly on the flower.",
                "I can see the sun in the sky.",
                "I can see my friend smiling.",
                "My eyes help me see the beautiful world.",
              ], tamilTranslations: [
                "மரத்தில் ஒரு பறவையைப் பார்க்கிறேன்.",
                "குளத்தில் ஒரு மீனைப் பார்க்கிறேன்.",
                "பூவின் மேல் ஒரு பட்டாம்பூச்சியைப் பார்க்கிறேன்.",
                "வானில் சூரியனைப் பார்க்கிறேன்.",
                "என் நண்பன் சிரிப்பதைப் பார்க்கிறேன்.",
                "அழகான உலகைப் பார்க்க என் கண்கள் உதவுகின்றன.",
              ] },
              { title: "Mary Had a Little Lamb", type: "rhyme", emoji: "🐑", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "Fun at Home", type: "lesson", emoji: "🏠", sentences: [], vocabulary: [] },
              { title: "Head, Shoulders, Knees", type: "rhyme", emoji: "🤸", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "The Little Red Hen", type: "story", emoji: "🐔", sentences: [], vocabulary: [] },
              { title: "If You're Happy", type: "rhyme", emoji: "😊", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      UKG: {
        label: "UKG",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "My Neighbourhood", type: "lesson", emoji: "🏘️", sentences: [], vocabulary: [] },
              { title: "Old MacDonald", type: "rhyme", emoji: "👨‍🌾", sentences: [
                "Old MacDonald had a farm, E-I-E-I-O.",
                "And on his farm he had a cow, E-I-E-I-O.",
                "With a moo-moo here and a moo-moo there.",
                "Here a moo, there a moo, everywhere a moo-moo.",
                "Old MacDonald had a farm, E-I-E-I-O.",
              ], tamilTranslations: [
                "பழைய மக்டொனால்டுக்கு ஒரு பண்ணை இருந்தது, ஈ-ஐ-ஈ-ஐ-ஓ.",
                "அவரது பண்ணையில் ஒரு பசு இருந்தது, ஈ-ஐ-ஈ-ஐ-ஓ.",
                "இங்கே ஒரு மூ-மூ, அங்கே ஒரு மூ-மூ.",
                "இங்கே ஒரு மூ, அங்கே ஒரு மூ, எல்லா இடத்திலும் ஒரு மூ-மூ.",
                "பழைய மக்டொனால்டுக்கு ஒரு பண்ணை இருந்தது, ஈ-ஐ-ஈ-ஐ-ஓ.",
              ] },
            ],
          },
          {
            label: "Term 2",
            chapters: [
              { title: "Things That Fly", type: "lesson", emoji: "✈️", sentences: [], vocabulary: [] },
              { title: "Row Your Boat", type: "rhyme", emoji: "🚣", sentences: [], vocabulary: [] },
            ],
          },
          {
            label: "Term 3",
            chapters: [
              { title: "The Three Little Pigs", type: "story", emoji: "🐷", sentences: [], vocabulary: [] },
              { title: "Teddy Bear Song", type: "rhyme", emoji: "🧸", sentences: [], vocabulary: [] },
            ],
          },
        ],
      },
      "1st": {
        label: "1st Standard",
        terms: [
          {
            label: "Term 1",
            chapters: [
              { title: "A Day at the Zoo", type: "story", emoji: "🦒", sentences: [], vocabulary: [] },
              { title: "Little Bo-Peep", type: "poem", emoji: "🐑", sentences: [], vocabulary: [] },
              { title: "Food We Eat", type: "lesson", emoji: "🍽️", sentences: [], vocabulary: [] },
            ],
          },
          { label: "Term 2", chapters: [
            { title: "The Ant and the Grasshopper", type: "story", emoji: "🦗", sentences: [], vocabulary: [] },
            { title: "The Star", type: "poem", emoji: "⭐", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 3", chapters: [
            { title: "Goldilocks", type: "story", emoji: "🐻", sentences: [], vocabulary: [] },
            { title: "Spring Song", type: "poem", emoji: "🌷", sentences: [], vocabulary: [] },
          ] },
        ],
      },
      "2nd": {
        label: "2nd Standard",
        terms: [
          { label: "Term 1", chapters: [
            { title: "The Ugly Duckling", type: "story", emoji: "🦢", sentences: [], vocabulary: [] },
            { title: "Two Little Hands", type: "poem", emoji: "✋", sentences: [], vocabulary: [] },
            { title: "Weather Around Us", type: "lesson", emoji: "🌤️", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 2", chapters: [
            { title: "The Gingerbread Man", type: "story", emoji: "🍪", sentences: [], vocabulary: [] },
            { title: "Seeds We Sow", type: "poem", emoji: "🌱", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 3", chapters: [
            { title: "The Elves and the Shoemaker", type: "story", emoji: "🧝", sentences: [], vocabulary: [] },
            { title: "Night Time", type: "poem", emoji: "🌙", sentences: [], vocabulary: [] },
          ] },
        ],
      },
      "3rd": {
        label: "3rd Standard",
        terms: [
          { label: "Term 1", chapters: [
            { title: "Rapunzel", type: "story", emoji: "👸", sentences: [], vocabulary: [] },
            { title: "The Wind and the Leaves", type: "poem", emoji: "🍂", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 2", chapters: [
            { title: "Jack and the Beanstalk", type: "story", emoji: "🫘", sentences: [], vocabulary: [] },
            { title: "Butterflies", type: "poem", emoji: "🦋", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 3", chapters: [
            { title: "The Pied Piper", type: "story", emoji: "🎵", sentences: [], vocabulary: [] },
            { title: "The River", type: "poem", emoji: "🏞️", sentences: [], vocabulary: [] },
          ] },
        ],
      },
      "4th": {
        label: "4th Standard",
        terms: [
          { label: "Term 1", chapters: [
            { title: "Robin Hood", type: "story", emoji: "🏹", sentences: [], vocabulary: [] },
            { title: "The Daffodils", type: "poem", emoji: "🌼", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 2", chapters: [
            { title: "Alice in Wonderland", type: "story", emoji: "🐇", sentences: [], vocabulary: [] },
            { title: "Sea Waves", type: "poem", emoji: "🌊", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 3", chapters: [
            { title: "The Secret Garden", type: "story", emoji: "🌿", sentences: [], vocabulary: [] },
            { title: "Winter", type: "poem", emoji: "❄️", sentences: [], vocabulary: [] },
          ] },
        ],
      },
      "5th": {
        label: "5th Standard",
        terms: [
          { label: "Term 1", chapters: [
            { title: "Treasure Island", type: "story", emoji: "🏴‍☠️", sentences: [], vocabulary: [] },
            { title: "The Road Not Taken", type: "poem", emoji: "🛤️", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 2", chapters: [
            { title: "Oliver Twist", type: "story", emoji: "📖", sentences: [], vocabulary: [] },
            { title: "Hope", type: "poem", emoji: "🌅", sentences: [], vocabulary: [] },
          ] },
          { label: "Term 3", chapters: [
            { title: "The Little Prince", type: "story", emoji: "🤴", sentences: [], vocabulary: [] },
            { title: "Tomorrow", type: "poem", emoji: "🌄", sentences: [], vocabulary: [] },
          ] },
        ],
      },
    },
  },
};

export const BOOK_GRADES = ["Pre-KG", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

export function getTypeLabel(type: string): string {
  switch (type) {
    case "prose": return "📝 Prose";
    case "poem": return "📜 Poem";
    case "rhyme": return "🎵 Rhyme";
    case "story": return "📖 Story";
    case "lesson": return "📚 Lesson";
    default: return "📄 Content";
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case "poem": return "from-purple-400 to-pink-500";
    case "rhyme": return "from-pink-400 to-rose-500";
    case "story": return "from-amber-400 to-orange-500";
    case "lesson": return "from-blue-400 to-indigo-500";
    default: return "from-green-400 to-emerald-500";
  }
}
