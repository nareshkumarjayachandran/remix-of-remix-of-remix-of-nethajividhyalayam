import { Body, EclipticGeoMoon, Observer, SearchRiseSet, SunPosition } from "astronomy-engine";

// Chennai Thirukanitham calculations. Minor timing differences between almanacs
// are expected from ayanamsa and sunrise conventions; all displayed times are IST.

const TITHIS = [
  "பிரதமை (Prathamai)", "த்விதீயை (Dvitiyai)", "திருதீயை (Tritiyai)", "சதுர்த்தி (Chaturthi)", "பஞ்சமி (Panchami)",
  "ஷஷ்டி (Shashti)", "சப்தமி (Saptami)", "அஷ்டமி (Ashtami)", "நவமி (Navami)", "தசமி (Dasami)",
  "ஏகாதசி (Ekadashi)", "த்வாதசி (Dvadashi)", "திரயோதசி (Trayodashi)", "சதுர்தசி (Chaturdashi)", "பூர்ணிமை (Pournami)"
];

const TITHIS_KRISHNA = [
  "பிரதமை (Prathamai)", "த்விதீயை (Dvitiyai)", "திருதீயை (Tritiyai)", "சதுர்த்தி (Chaturthi)", "பஞ்சமி (Panchami)",
  "ஷஷ்டி (Shashti)", "சப்தமி (Saptami)", "அஷ்டமி (Ashtami)", "நவமி (Navami)", "தசமி (Dasami)",
  "ஏகாதசி (Ekadashi)", "த்வாதசி (Dvadashi)", "திரயோதசி (Trayodashi)", "சதுர்தசி (Chaturdashi)", "அமாவாசை (Amavasai)"
];

const NAKSHATRAS = [
  "அஸ்வினி (Ashwini)", "பரணி (Bharani)", "கிருத்திகை (Krittikai)", "ரோகிணி (Rohini)", "மிருகசீரிடம் (Mrigashirsha)",
  "திருவாதிரை (Thiruvadirai)", "புனர்பூசம் (Punarvasu)", "பூசம் (Pushya)", "ஆயில்யம் (Ayilyam)", "மகம் (Magam)",
  "பூரம் (Pooram)", "உத்திரம் (Uthiram)", "ஹஸ்தம் (Hastham)", "சித்திரை (Chithirai)", "சுவாதி (Swathi)",
  "விசாகம் (Visakam)", "அனுஷம் (Anusham)", "கேட்டை (Kettai)", "மூலம் (Moolam)", "பூராடம் (Pooradam)",
  "உத்திராடம் (Uthiradam)", "திருவோணம் (Thiruvonam)", "அவிட்டம் (Avittam)", "சதயம் (Sadhayam)", "பூரட்டாதி (Poorattadhi)",
  "உத்திரட்டாதி (Uthirattadhi)", "ரேவதி (Revathi)"
];

const YOGAMS = [
  "விஷ்கம்பம் (Vishkambam)", "பிரீதி (Preethi)", "ஆயுஷ்மான் (Ayushman)", "சௌபாக்யம் (Sowbhagyam)", "சோபனம் (Shobanam)",
  "அதிகண்டம் (Athigantam)", "சுகர்மா (Sukarma)", "திருதி (Dhrithi)", "சூலம் (Soolam)", "கண்டம் (Gantam)",
  "விருத்தி (Viruddhi)", "துருவம் (Dhruvam)", "வியாகாதம் (Vyaghatham)", "ஹர்ஷணம் (Harshanam)", "வஜ்ரம் (Vajram)",
  "சித்தி (Siddhi)", "வியதீபாதம் (Vyatheepatham)", "வரியான் (Variyan)", "பரிகம் (Parigam)", "சிவம் (Sivam)",
  "சித்தம் (Siddham)", "சாத்தியம் (Sadhyam)", "சுபம் (Subam)", "சுக்லம் (Suklam)", "பிரம்மம் (Brahmam)",
  "ஐந்திரம் (Aindhiram)", "வைத்ருதி (Vaidhrithi)"
];

const KARANAMS = [
  "பவம் (Bavam)", "பாலவம் (Balavam)", "கௌலவம் (Kaulavam)", "தைதுலம் (Thaithulam)", "கரம் (Garam)",
  "வணிஜம் (Vanijam)", "விஷ்டி (Vishti)", "சகுனி (Sakuni)", "சதுஷ்பாதம் (Chatushpadam)", "நாகம் (Nagam)", "கிம்ஸ்துக்னம் (Kimstughnam)"
];

const VAARAM = [
  { tamil: "ஞாயிறு (Sunday)", deity: "சூரியன்", color: "சிவப்பு (Red)" },
  { tamil: "திங்கள் (Monday)", deity: "சந்திரன்", color: "வெள்ளை (White)" },
  { tamil: "செவ்வாய் (Tuesday)", deity: "செவ்வாய்", color: "சிவப்பு (Red)" },
  { tamil: "புதன் (Wednesday)", deity: "புதன்", color: "பச்சை (Green)" },
  { tamil: "வியாழன் (Thursday)", deity: "குரு", color: "மஞ்சள் (Yellow)" },
  { tamil: "வெள்ளி (Friday)", deity: "சுக்கிரன்", color: "வெள்ளை (White)" },
  { tamil: "சனி (Saturday)", deity: "சனி", color: "கருப்பு (Black)" },
];

const TAMIL_MONTHS = [
  "சித்திரை (Chithirai)", "வைகாசி (Vaikasi)", "ஆனி (Aani)", "ஆடி (Aadi)",
  "ஆவணி (Aavani)", "புரட்டாசி (Purattasi)", "ஐப்பசி (Aippasi)", "கார்த்திகை (Karthigai)",
  "மார்கழி (Margazhi)", "தை (Thai)", "மாசி (Maasi)", "பங்குனி (Panguni)",
];

const TAMIL_YEARS = [
  "பிரபவ (Prabhava)", "விபவ (Vibhava)", "சுக்ல (Shukla)", "பிரமோதூத (Pramodoota)",
  "பிரசோற்பத்தி (Prajothpathi)", "ஆங்கிரச (Angirasa)", "ஸ்ரீமுக (Srimukha)", "பவ (Bhava)",
  "யுவ (Yuva)", "தாது (Dhathu)", "ஈஸ்வர (Eswara)", "வெகுதானிய (Bahudhanya)",
  "பிரமாதி (Pramathi)", "விக்கிரம (Vikrama)", "விஷு (Vishu)", "சித்திரபானு (Chitrabhanu)",
  "சுபானு (Subhanu)", "தாரண (Tharana)", "பார்த்திப (Parthiba)", "விய (Vyaya)",
  "சர்வசித்து (Sarvajith)", "சர்வதாரி (Sarvadhari)", "விரோதி (Virodhi)", "விக்ருதி (Vikruthi)",
  "கர (Khara)", "நந்தன (Nandhana)", "விஜய (Vijaya)", "ஜய (Jaya)",
  "மன்மத (Manmatha)", "துன்முகி (Durmukhi)", "ஹேவிளம்பி (Hevilambi)", "விளம்பி (Vilambi)",
  "விகாரி (Vikari)", "சார்வரி (Sarvari)", "பிலவ (Plava)", "சுபகிருது (Subhakrith)",
  "சோபகிருது (Sobhakrith)", "குரோதி (Krodhi)", "விசுவாவசு (Visvavasu)", "பராபவ (Parabhava)",
  "பிலவங்க (Plavanga)", "கீலக (Keelaka)", "சௌமிய (Saumya)", "சாதாரண (Sadharana)",
  "விரோதிகிருது (Virodhikrith)", "பரிதாபி (Paridhavi)", "பிரமாதீச (Pramadeesha)", "ஆனந்த (Ananda)",
  "ராட்சச (Rakshasa)", "நள (Nala)", "பிங்கள (Pingala)", "காளயுக்தி (Kalayukthi)",
  "சித்தார்த்தி (Siddharthi)", "ரௌத்திரி (Raudri)", "துன்மதி (Durmathi)", "துந்துபி (Dundubhi)",
  "ருத்ரோத்காரி (Rudhirodgari)", "ரக்தாட்சி (Rakthakshi)", "குரோதன (Krodhana)", "அட்சய (Akshaya)",
];

const DAY_MS = 86400000;
const IST_OFFSET = 19800000;
const CHENNAI = new Observer(13.0827, 80.2707, 0);
const wrap = (angle: number) => ((angle % 360) + 360) % 360;

// Shift only for UTC field extraction, never add the browser's timezone offset.
export function getChennaiDateParts(date = new Date()) {
  const local = new Date(date.getTime() + IST_OFFSET);
  return { year: local.getUTCFullYear(), month: local.getUTCMonth() + 1,
    day: local.getUTCDate(), weekday: local.getUTCDay() };
}

function midnightIST(date: Date): Date {
  const { year, month, day } = getChennaiDateParts(date);
  return new Date(Date.UTC(year, month - 1, day) - IST_OFFSET);
}

// Lahiri mean ayanamsa, J2000 epoch; precession advances ~50.29 arcsec/year.
function ayanamsa(date: Date) {
  const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.2425 * DAY_MS);
  return 23.8530556 + years * 50.290966 / 3600;
}

function longitudes(date: Date) {
  const sun = SunPosition(date).elon;
  const moon = EclipticGeoMoon(date).lon;
  return { elongation: wrap(moon - sun), moon: wrap(moon - ayanamsa(date)),
    sun: wrap(sun - ayanamsa(date)), yoga: wrap(sun + moon - 2 * ayanamsa(date)) };
}

function timeIST(date: Date) {
  return date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}

function nextChange(date: Date, angle: (date: Date) => number, width: number) {
  const index = Math.floor(angle(date) / width);
  let low = date.getTime();
  for (let high = low + 2 * 3600000; high <= date.getTime() + 3 * DAY_MS; high += 2 * 3600000) {
    if (Math.floor(angle(new Date(high)) / width) === index) { low = high; continue; }
    let upper = high;
    while (upper - low > 1000) {
      const mid = (low + upper) / 2;
      if (Math.floor(angle(new Date(mid)) / width) === index) low = mid;
      else upper = mid;
    }
    return new Date(upper);
  }
  return date;
}

function until(date: Date, end: Date) {
  const sameDay = midnightIST(date).getTime() === midnightIST(end).getTime();
  const suffix = sameDay ? "" : `, ${end.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}`;
  return `${timeIST(end)}${suffix}`;
}

function solarDate(date: Date) {
  // Tamil solar months start on the ingress civil day when ingress is before sunset.
  const start = midnightIST(date);
  const sunset = SearchRiseSet(Body.Sun, CHENNAI, -1, start, 1)?.date;
  const anchor = sunset ?? new Date(start.getTime() + 18 * 3600000);
  const index = Math.floor(longitudes(anchor).sun / 30);
  let low = anchor.getTime() - 40 * DAY_MS;
  let high = anchor.getTime();
  while (high - low > 1000) {
    const mid = (low + high) / 2;
    if (Math.floor(longitudes(new Date(mid)).sun / 30) === index) high = mid;
    else low = mid;
  }
  const ingress = new Date(high);
  const ingressStart = midnightIST(ingress);
  const ingressSunset = SearchRiseSet(Body.Sun, CHENNAI, -1, ingressStart, 1)?.date;
  const firstDay = ingressStart.getTime() + (ingressSunset && ingress > ingressSunset ? DAY_MS : 0);
  const { year, month } = getChennaiDateParts(date);
  const solarYear = year - (month < 4 || (month === 4 && index === 11) ? 1 : 0);
  return { index, day: Math.round((start.getTime() - firstDay) / DAY_MS) + 1,
    year: TAMIL_YEARS[((solarYear - 1987) % 60 + 60) % 60], kaliYear: solarYear + 3102 };
}

export interface TodayPanchangam {
  date: string; day: string; tamilDay: string; tamilDayDeity: string; tamilDayColor: string;
  tamilMonth: string; tamilDate: number; tamilYear: string; kaliYear: number; ayanam: string;
  tithi: string; paksham: string; nakshatra: string; yogam: string; karanam: string;
  tithiUntil: string; nakshatraUntil: string; yogamUntil: string; karanamUntil: string;
  rahuKalam: string; sunrise: string; sunset: string;
}

export function calculateTodayPanchangam(date = new Date()): TodayPanchangam {
  const { weekday } = getChennaiDateParts(date);
  const start = midnightIST(date);
  const sunrise = SearchRiseSet(Body.Sun, CHENNAI, 1, start, 1)?.date;
  const sunset = SearchRiseSet(Body.Sun, CHENNAI, -1, start, 1)?.date;
  const positions = longitudes(date);
  const tithiIndex = Math.floor(positions.elongation / 12);
  const karanaAbsolute = Math.floor(positions.elongation / 6);
  const karanaIndex = karanaAbsolute === 0 ? 10 : karanaAbsolute >= 57 ? 7 + karanaAbsolute - 57 : (karanaAbsolute - 1) % 7;
  const solar = solarDate(date);
  const vaaram = VAARAM[weekday];
  const rahuSegment = [7, 1, 6, 4, 5, 3, 2][weekday];
  const segment = sunrise && sunset ? (sunset.getTime() - sunrise.getTime()) / 8 : 0;
  const rahuKalam = sunrise && sunset
    ? `${timeIST(new Date(sunrise.getTime() + rahuSegment * segment))} – ${timeIST(new Date(sunrise.getTime() + (rahuSegment + 1) * segment))}`
    : "Unavailable";

  return {
    date: date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    day: date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long" }),
    tamilDay: vaaram.tamil, tamilDayDeity: vaaram.deity, tamilDayColor: vaaram.color,
    tamilMonth: TAMIL_MONTHS[solar.index], tamilDate: solar.day, tamilYear: solar.year, kaliYear: solar.kaliYear,
    ayanam: solar.index >= 3 && solar.index <= 8 ? "தக்ஷிணாயணம் (Dakshinayanam)" : "உத்தராயணம் (Uttarayanam)",
    tithi: tithiIndex < 15 ? TITHIS[tithiIndex] : TITHIS_KRISHNA[tithiIndex - 15],
    paksham: tithiIndex < 15 ? "வளர்பிறை — சுக்ல பக்ஷம் (Shukla Paksham)" : "தேய்பிறை — கிருஷ்ண பக்ஷம் (Krishna Paksham)",
    nakshatra: NAKSHATRAS[Math.floor(positions.moon / (360 / 27))],
    yogam: YOGAMS[Math.floor(positions.yoga / (360 / 27))], karanam: KARANAMS[karanaIndex],
    tithiUntil: until(date, nextChange(date, d => longitudes(d).elongation, 12)),
    nakshatraUntil: until(date, nextChange(date, d => longitudes(d).moon, 360 / 27)),
    yogamUntil: until(date, nextChange(date, d => longitudes(d).yoga, 360 / 27)),
    karanamUntil: until(date, nextChange(date, d => longitudes(d).elongation, 6)),
    rahuKalam, sunrise: sunrise ? timeIST(sunrise) : "Unavailable", sunset: sunset ? timeIST(sunset) : "Unavailable",
  };
}
