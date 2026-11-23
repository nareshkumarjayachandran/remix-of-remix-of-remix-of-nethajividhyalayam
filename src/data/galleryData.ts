export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  description?: string;
}

export const galleryImages: GalleryImage[] = [
  // ── School Annual Picnic ──
  {
    id: 1,
    src: "/photos/school-picnic/School_Annual_Picnic.jpg",
    alt: "School Annual Picnic",
    category: "Events",
    description: "Students enjoyed a joyful and refreshing school picnic filled with games, sightseeing, and bonding activities that strengthened friendships and created lasting memories.",
  },
  // ── Annual Day ──
  {
    id: 2,
    src: "/photos/events/Annual_Day_Celebration_2024.jpg",
    alt: "Annual Day Celebration 2024",
    category: "Events",
    description: "A spectacular annual day with cultural performances, prize distribution, and memorable moments celebrating student achievements throughout the year.",
  },
  // ── Sports Day ──
  {
    id: 3,
    src: "/photos/sports/Sports_Day_Highlights.jpg",
    alt: "Sports Day Highlights",
    category: "Sports",
    description: "An exciting sports day filled with relay races, track events, and athletic competitions showcasing the sporting talents of our students.",
  },
  // ── Cultural Festival ──
  {
    id: 4,
    src: "/photos/cultural-festival/Cultural_Fest_Program.jpg",
    alt: "Cultural Fest Program",
    category: "Events",
    description: "A vibrant cultural festival featuring traditional dance performances, music, drama, and artistic showcases by talented students.",
  },
  // ── Science Exhibition ──
  {
    id: 5,
    src: "/photos/science-exhibition/Science_Exhibition.jpg",
    alt: "Science Exhibition",
    category: "Campus",
    description: "Students presented innovative science projects and working models, demonstrating creativity and scientific thinking at the annual science exhibition.",
  },
  // ── Teachers' Day ──
  {
    id: 6,
    src: "/photos/teachers-day/Teachers_Day_Celebration.jpeg",
    alt: "Teachers' Day Celebration",
    category: "Events",
    description: "A heartfelt celebration honoring our dedicated teachers with flowers, gifts, and cultural programs organized by grateful students.",
  },
  // ── Art & Craft ──
  {
    id: 7,
    src: "/photos/art-craft/Art_and_Craft_Exhibition.jpg",
    alt: "Art & Craft Exhibition",
    category: "Events",
    description: "A colorful exhibition showcasing student artwork, paintings, drawings, and creative crafts displayed across the school corridors.",
  },
  // ── Independence Day ──
  {
    id: 8,
    src: "/photos/events/independence-day.jpg",
    alt: "Independence Day Celebration",
    category: "Events",
    description: "A patriotic celebration with flag hoisting, cultural programs, and inspiring speeches commemorating India's independence.",
  },
  // ── Classroom Activities ──
  {
    id: 9,
    src: "/photos/academics/classroom-1.jpg",
    alt: "Classroom Activities & Learning",
    category: "Campus",
    description: "Engaging classroom sessions where students actively participate in learning, experiments, and interactive educational activities.",
  },
  // ── Memories ──
  {
    id: 10,
    src: "/photos/memories/memory-1.jpg",
    alt: "Special Occasion Memories",
    category: "Memories",
    description: "Cherished moments from special school celebrations and cultural events that bring the school community together in joy and festivity.",
  },
  {
    id: 11,
    src: "/photos/memories/memory-2.jpg",
    alt: "Celebration Moments",
    category: "Memories",
    description: "A wonderful gathering of school family members dressed in traditional attire, celebrating the rich cultural heritage and school milestones.",
  },
  {
    id: 12,
    src: "/photos/memories/memory-3.jpg",
    alt: "Cultural Attire Celebration",
    category: "Memories",
    description: "Elegant moments captured during school cultural festivities, showcasing the vibrant traditions and joyful spirit of our school community.",
  },
  {
    id: 13,
    src: "/photos/memories/memory-4.jpg",
    alt: "Festive School Gathering",
    category: "Memories",
    description: "Beautifully dressed participants at a school cultural event, reflecting the pride and tradition that define our school's celebratory occasions.",
  },
  {
    id: 14,
    src: "/photos/memories/memory-5.jpg",
    alt: "School Community Memories",
    category: "Memories",
    description: "Two members of the school community sharing a joyful moment at a cultural celebration, dressed in stunning traditional outfits.",
  },
  {
    id: 15,
    src: "/photos/memories/memory-6.jpg",
    alt: "Memorable Moments",
    category: "Memories",
    description: "A candid, elegant portrait capturing the warmth and grace of our school's cultural events and the cherished memories they create.",
  },
];

/** All unique categories derived from the gallery data */
export const galleryCategories = [
  "All",
  ...Array.from(new Set(galleryImages.map((img) => img.category))),
];

/** Get a subset of images for the homepage preview */
export const getHomepageGallery = (count = 6) => galleryImages.slice(0, count);
