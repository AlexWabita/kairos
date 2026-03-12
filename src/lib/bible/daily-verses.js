// ─────────────────────────────────────────────────────────────
// Daily Verses — 60 curated entries, cycling by day of year
// Each entry: { ref, thought }
// Verse text is fetched live from the Bible API
// ─────────────────────────────────────────────────────────────

export const DAILY_VERSES = [
  { ref: "Psalm 23:1",          thought: "Whatever you are facing today, you are not facing it alone." },
  { ref: "Isaiah 41:10",        thought: "Fear is not the final word. His strength is." },
  { ref: "John 3:16",           thought: "Love this vast does not forget you." },
  { ref: "Romans 8:28",         thought: "Even the hard chapters are being written into something good." },
  { ref: "Philippians 4:13",    thought: "The strength you need is already being given." },
  { ref: "Jeremiah 29:11",      thought: "Your story is not finished. There is still a hope and a future." },
  { ref: "Matthew 11:28",       thought: "You do not have to carry this alone." },
  { ref: "Psalm 46:1",          thought: "In every storm, He is the stillness that holds." },
  { ref: "Isaiah 40:31",        thought: "Rest in Him, and find yourself rising again." },
  { ref: "Romans 5:8",          thought: "Love found you before you had anything to offer." },
  { ref: "John 14:27",          thought: "The peace He gives is not borrowed from circumstances." },
  { ref: "Psalm 119:105",       thought: "One step at a time — His word lights the way." },
  { ref: "Proverbs 3:5",        thought: "Let go of the need to understand everything. Trust the One who does." },
  { ref: "2 Corinthians 12:9",  thought: "In your weakness, something greater is at work." },
  { ref: "Lamentations 3:22",   thought: "Every morning is proof that mercy has not given up." },
  { ref: "Philippians 4:6",     thought: "Bring it all to Him — the worry, the what-ifs, the unknowns." },
  { ref: "Psalm 139:14",        thought: "You are not an accident. You are a deliberate act of love." },
  { ref: "Romans 8:1",          thought: "The condemnation you feel is not His voice." },
  { ref: "Isaiah 43:2",         thought: "He does not promise the absence of fire. He promises to walk through it with you." },
  { ref: "Joshua 1:9",          thought: "Courage is not the absence of fear — it is moving forward knowing He is near." },
  { ref: "John 16:33",          thought: "Trouble will come. But the overcomer lives in you." },
  { ref: "1 Peter 5:7",         thought: "He invites you to lay it down. He can carry what you cannot." },
  { ref: "Psalm 34:18",         thought: "The broken-hearted are not abandoned. He draws near." },
  { ref: "Ephesians 3:20",      thought: "What He can do exceeds what you can imagine asking." },
  { ref: "Romans 8:38",         thought: "Nothing — not even the worst of it — can separate you from His love." },
  { ref: "Matthew 6:34",        thought: "Today has enough for today. His grace is daily, not annual." },
  { ref: "Hebrews 11:1",        thought: "Faith is the bridge between what is and what will be." },
  { ref: "Psalm 37:4",          thought: "Delight in Him and find that your deepest desires shift." },
  { ref: "2 Timothy 1:7",       thought: "Fear does not come from God. Power, love, and a sound mind do." },
  { ref: "Isaiah 26:3",         thought: "A mind fixed on Him finds a peace that circumstances cannot explain." },
  { ref: "John 8:36",           thought: "Freedom is not earned. It is given." },
  { ref: "Romans 15:13",        thought: "Hope is not wishful thinking — it is rooted in the God who keeps promises." },
  { ref: "Galatians 5:1",       thought: "You were made for freedom, not performance." },
  { ref: "Psalm 91:1",          thought: "In His shelter, you are not hidden — you are held." },
  { ref: "Hebrews 4:16",        thought: "You do not need to clean yourself up before coming. Come as you are." },
  { ref: "1 John 4:18",         thought: "Perfect love leaves no room for the fear that punishes." },
  { ref: "Colossians 3:2",      thought: "What you set your mind on shapes the world you live in." },
  { ref: "Psalm 27:1",          thought: "When He is your light, darkness has no final claim." },
  { ref: "2 Corinthians 4:17",  thought: "The weight you carry now is light compared to what is being prepared." },
  { ref: "James 1:2",           thought: "Trials are not punishment. They are the classroom of character." },
  { ref: "Micah 7:8",           thought: "Falling is not the end. Rising in His strength is." },
  { ref: "Zephaniah 3:17",      thought: "He does not merely tolerate you. He rejoices over you." },
  { ref: "Matthew 5:6",         thought: "Hunger for what is right, and you will find it satisfied." },
  { ref: "Psalm 16:11",         thought: "In His presence is where fullness of joy is found." },
  { ref: "Ephesians 2:10",      thought: "You are not an accident. You are His workmanship — a living masterpiece." },
  { ref: "Romans 12:2",         thought: "Transformation begins not with behavior but with a renewed mind." },
  { ref: "Philippians 1:6",     thought: "He who began a good work in you is still working." },
  { ref: "John 10:10",          thought: "Abundant life is not a reward for good performance. It is a gift." },
  { ref: "Psalm 40:1",          thought: "He heard the cry. He drew near. He lifted. That is who He is." },
  { ref: "Isaiah 55:8",         thought: "His ways are above yours — not as rejection, but as invitation." },
  { ref: "Revelation 21:4",     thought: "Every tear, every loss — He will wipe them all away." },
  { ref: "Psalm 73:26",         thought: "Even when everything else fails, He is the strength of your heart." },
  { ref: "1 Corinthians 13:13", thought: "Of everything that remains, love is the greatest." },
  { ref: "John 15:5",           thought: "Apart from Him you can do nothing. In Him, everything flourishes." },
  { ref: "Hebrews 12:1",        thought: "Run with endurance, eyes fixed on the one who ran before you." },
  { ref: "Romans 8:15",         thought: "You were not given a spirit of slavery. You received adoption." },
  { ref: "Psalm 62:5",          thought: "In God alone your soul can truly rest." },
  { ref: "Isaiah 30:15",        thought: "In quietness and trust is where your strength is found." },
  { ref: "Matthew 6:26",        thought: "If He tends to the birds of the air, He tends to you." },
  { ref: "Revelation 3:20",     thought: "He is standing at the door. Not as judge. As guest." },
  { ref: "Psalm 28:7",          thought: "He is your strength and your shield. Your heart can trust Him." },
]

// ─────────────────────────────────────────────────────────────
// Returns today's verse based on day of year
// Cycles annually — same verse on the same calendar day each year
// ─────────────────────────────────────────────────────────────
export function getTodaysVerse() {
  const now       = new Date()
  const start     = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / 86400000)
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length]
}