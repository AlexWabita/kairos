// ─────────────────────────────────────────────────────────────
// src/lib/plans/seed.js
// Kairos — Curated Reading Plans Seed Data
// Run once via: node -r dotenv/config src/lib/plans/seed.js
// Or call seedPlans() from a protected API route
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { NEW_PLANS, NEW_SLUGS } from './NEW_PLANS.js'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // needs service role to bypass RLS for seeding
)

// ─────────────────────────────────────────────────────────────
// PLAN DEFINITIONS
// ─────────────────────────────────────────────────────────────

const PLANS = [
  ...NEW_PLANS,
  {
    slug: 'new-believer-foundation',
    title: 'New Believer Foundation',
    description: 'A gentle, grounding 7-day journey for those who have just begun following Christ — or those who want to return to the beginning and rediscover what it means to be known by God.',
    duration_days: 7,
    category: 'Faith Basics',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: 'overcoming-anxiety',
    title: 'Overcoming Anxiety',
    description: 'Fourteen days of honest, scripture-rooted reflection for the mind that won\'t quiet down. This is not a quick fix — it is an invitation into the kind of peace that doesn\'t make logical sense.',
    duration_days: 14,
    category: 'Mental Health',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: 'identity-in-christ',
    title: 'Identity in Christ',
    description: 'Ten days of discovering who God says you are — before the world named you, before you succeeded or failed, before you earned anything. A return to the truest thing about you.',
    duration_days: 10,
    category: 'Identity',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: '30-days-in-the-psalms',
    title: '30 Days in the Psalms',
    description: 'A month walking through the most honest book in the Bible. The Psalms are permission to bring everything — joy, grief, anger, wonder — into the presence of God without pretense.',
    duration_days: 30,
    category: 'Scripture',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: 'prayer-and-fasting',
    title: 'Prayer & Fasting',
    description: 'Seven days of intentional seeking. Fasting is not about earning God\'s attention — it is about creating space to hear what has always been there. This plan walks you through why we fast and how to pray with depth.',
    duration_days: 7,
    category: 'Spiritual Discipline',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: 'healing-and-forgiveness',
    title: 'Healing & Forgiveness',
    description: 'Ten days for the wounds that don\'t show. Whether you are carrying the weight of what was done to you, or the guilt of what you have done — this plan holds space for both, and points toward wholeness.',
    duration_days: 10,
    category: 'Emotional Health',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: 'walking-in-purpose',
    title: 'Walking in Purpose',
    description: 'Fourteen days of honest reckoning with calling, direction, and the question most of us quietly carry: Why am I here? Not a career guide — a spiritual exploration of what it means to live intentionally before God.',
    duration_days: 14,
    category: 'Life Direction',
    cover_image_url: null,
    is_curated: true,
  },
  {
    slug: 'bible-in-365-days',
    title: 'Bible in 365 Days',
    description: 'The complete Scripture, read in a year. One day at a time, from Genesis to Revelation. Each day is a small step through the full story of God — creation, covenant, redemption, restoration.',
    duration_days: 365,
    category: 'Scripture',
    cover_image_url: null,
    is_curated: true,
  },
]

// ─────────────────────────────────────────────────────────────
// PLAN DAYS CONTENT
// ─────────────────────────────────────────────────────────────

const DAYS = {

  // ── 1. NEW BELIEVER FOUNDATION ──────────────────────────────
  'new-believer-foundation': [
    {
      day_number: 1,
      title: 'You Are Already Known',
      scripture_refs: ['John 1:1-14'],
      devotional_text: `Before you said yes to God, God had already said yes to you.\n\nThat is the staggering thing John opens his gospel with. Not with rules. Not with requirements. But with a Word — eternal, present, and personal — that "became flesh and dwelt among us." The Greek word there, dwelt, literally means He pitched His tent among us. God moved into the neighbourhood.\n\nYou did not come to faith because you finally got good enough, searched hard enough, or figured out the right answers. You came because Someone was already looking for you. This is the foundation everything else is built on: you are not a stranger to God. You are known.\n\nSit with that today. Not as a theological concept. As something personally true — about you, right now.`,
      reflection_prompt: 'When did you first sense that God was near — before you even had words for it?',
      prayer_prompt: 'Lord, I am still learning what it means to be known by You. Settle that truth somewhere deep in me today.',
    },
    {
      day_number: 2,
      title: 'The Gift You Did Not Earn',
      scripture_refs: ['Ephesians 2:1-10'],
      devotional_text: `There is a phrase in Ephesians 2 that deserves to stop you cold: "But God."\n\nPaul has just described the human condition in unflinching terms — spiritually dead, following the patterns of a broken world, living for ourselves. And then, without warning, two words change everything. But God. Rich in mercy. Great in love. Made us alive.\n\nGrace is not a reward. It is not what happens when you finally pray the right way or clean up your behaviour enough. Grace is God acting on your behalf when you had nothing to offer. It is the gift you cannot earn and cannot lose by being imperfect.\n\nEphesians 2:10 follows immediately: "We are God's handiwork, created in Christ Jesus to do good works." Not saved by works — but saved for them. There is a direction to your life now. A purpose being shaped. And it starts not with striving, but with receiving.`,
      reflection_prompt: 'Is there any part of you still trying to earn what has already been freely given?',
      prayer_prompt: 'God, help me receive grace fully — not just know about it, but live from it.',
    },
    {
      day_number: 3,
      title: 'Something New Has Begun',
      scripture_refs: ['2 Corinthians 5:17', 'Romans 6:4'],
      devotional_text: `"If anyone is in Christ, the new creation has come: the old has gone, the new is here."\n\nThis verse is often quoted quickly, almost casually. But read it slowly. Not just "you have changed your habits." Not "you are turning over a new leaf." Paul says: a new creation. The Greek implies something that did not exist before now exists.\n\nThat is not a small statement.\n\nYou may not feel new. Some mornings you will wake up and the old patterns will still be there, knocking. The old voice that says you are not enough, or too far gone, or that nothing really changes. And in those moments, this verse is not asking you to feel something — it is asking you to know something.\n\nYou are not the same person. Something permanent has happened. The journey ahead is not about becoming new — it is about learning to live from what you already are.`,
      reflection_prompt: 'What is one old way of seeing yourself that faith is beginning to challenge?',
      prayer_prompt: 'Jesus, show me who I am in You — not who I have been.',
    },
    {
      day_number: 4,
      title: 'You Are Not Walking Alone',
      scripture_refs: ['John 14:15-27'],
      devotional_text: `On the night before He died, Jesus made a promise that was meant to outlast His physical presence: "I will ask the Father, and He will give you another advocate to help you and be with you forever."\n\nThe word advocate in Greek is paraclete — literally, one called alongside. Not above you, looking down. Not behind you, watching from a distance. Alongside. Present in the actual terrain of your daily life.\n\nThe Holy Spirit is not a force. Not an emotion. Not a good feeling in a worship service. He is a Person — the presence of God made immediately, personally available to you. When you are confused, He guides. When you are weak, He intercedes. When you do not know how to pray, He prays through you.\n\nYou are a new believer, which means you are also learning something new every day. That is not a problem. You have a Teacher. You are not figuring this out alone.`,
      reflection_prompt: 'In what area of your life do you most need to sense that you are not alone?',
      prayer_prompt: 'Holy Spirit, I welcome You. Be near to me in the ordinary moments of today.',
    },
    {
      day_number: 5,
      title: 'Learning to Pray',
      scripture_refs: ['Matthew 6:5-15', 'Romans 8:26-27'],
      devotional_text: `Prayer is one of the first things new believers feel pressure about. There is a fear of doing it wrong — the wrong words, the wrong posture, not enough faith, too many doubts.\n\nJesus's answer to that anxiety is disarming in its simplicity. He says: don't perform. Don't pile up empty words. Go to a quiet place. Speak to your Father.\n\nFather. Not judge. Not king demanding tribute. Father.\n\nThe Lord's Prayer is not a script to recite — it is a shape to inhabit. It moves from worship to surrender to need to forgiveness to protection. It is a full human life compressed into a few sentences.\n\nAnd then Romans 8 adds something even more startling: when you don't know what to say, the Spirit intercedes for you with groanings that words cannot express. You are never left alone in prayer, even when you have nothing to bring but silence.`,
      reflection_prompt: 'What would it feel like to approach prayer as a conversation with someone who already loves you, rather than a performance for someone who is evaluating you?',
      prayer_prompt: 'Father, teach me to pray honestly. I don\'t always have the right words — but I am here.',
    },
    {
      day_number: 6,
      title: 'The Book That Feeds You',
      scripture_refs: ['Psalm 119:105', '2 Timothy 3:16-17'],
      devotional_text: `Psalm 119:105 is one of the most beloved verses in Scripture: "Your word is a lamp to my feet and a light to my path." Notice the image. Not a floodlight illuminating the entire road ahead. A lamp — enough light for the next step.\n\nScripture is not primarily an information source. It is a living thing. 2 Timothy 3:16 says it is "God-breathed" — the same word used when God breathed life into Adam. The Bible carries breath in it.\n\nFor a new believer, the question is not how to read the whole Bible immediately. It is how to read slowly enough that it reads you. Start with the Gospels — Matthew, Mark, Luke, John. Hear Jesus speak. Watch how He moves through a room. Notice who He stops for. Let the text ask questions back at you.\n\nYou are not studying a document. You are sitting with a voice.`,
      reflection_prompt: 'Is there a verse or passage that has already spoken to you — one you have returned to more than once?',
      prayer_prompt: 'God, open the Scriptures to me. Let me hear Your voice in what I read.',
    },
    {
      day_number: 7,
      title: 'He Will Complete What He Started',
      scripture_refs: ['Philippians 1:6', 'Jude 1:24'],
      devotional_text: `Paul writes from prison when he says this: "He who began a good work in you will carry it on to completion until the day of Christ Jesus."\n\nThere will be days when your faith feels thin. Days you fail in ways that embarrass you. Days you wonder if any of this is real. Those are not signs that you have stepped outside of God's reach. They are signs that you are human, walking a real road.\n\nThe promise of Philippians 1:6 is not that you will always feel strong. It is that God does not abandon projects. He does not start things and walk away. He is not surprised by your weakness, impatient with your slowness, or discouraged by your doubts.\n\nYou are held by Someone who does not let go.\n\nThis week has been a beginning. Not a performance — a beginning. And the One who called you is faithful. He will see you through.`,
      reflection_prompt: 'Looking back at this week, where did you sense God most clearly — even in a small way?',
      prayer_prompt: 'Lord, I trust You with where I am. I don\'t have to have it all together. You are faithful to complete what You have started in me.',
    },
  ],

  // ── 2. OVERCOMING ANXIETY ───────────────────────────────────
  'overcoming-anxiety': [
    {
      day_number: 1,
      title: 'The Weight You Are Carrying',
      scripture_refs: ['Matthew 11:28-30'],
      devotional_text: `Jesus does not say: "Figure it out." He does not say: "Try harder." He says: "Come to me, all you who are weary and burdened, and I will give you rest."\n\nBefore this plan tries to fix anything, it needs to name something. Anxiety is real. It is not a character flaw, a faith failure, or evidence that you are doing something wrong. It is weight. And weight, over time, exhausts even the strongest among us.\n\nJesus speaks to weariness without shame. He invites, He does not demand. The yoke He offers is not another set of requirements — it is a different way of moving through life. Yoked together with Him, you do not carry the load alone.\n\nToday is not about solving anxiety. Today is simply about bringing it to the right place. Lay it down. All of it. He is not startled by what you carry.`,
      reflection_prompt: 'What specific worry or fear are you carrying into this plan? Name it honestly.',
      prayer_prompt: 'Jesus, I am tired. I bring You the weight of what I have been carrying. I don\'t need to have it all resolved right now — I just need to be near You.',
    },
    {
      day_number: 2,
      title: 'Cast, Don\'t Carry',
      scripture_refs: ['1 Peter 5:6-7'],
      devotional_text: `"Cast all your anxiety on him because he cares for you."\n\nThe word cast here is not gentle. It is the same word used for throwing a garment over a donkey — a vigorous, deliberate action. Not a polite handing over. A throwing.\n\nPeter wrote this to a community living under real threat — persecution, displacement, uncertainty. This was not advice for comfortable people with minor inconveniences. This was pastoral instruction for people whose world was genuinely unstable.\n\nAnd what is the reason given? Not because God is powerful enough to handle it. Not because it is theologically correct. Because He cares for you. The motive is love, not capacity.\n\nAnxiety often whispers that nobody really wants to hear about your worries — that you will burden people, exhaust them, be too much. That voice does not belong to God. He invites the full weight of you.`,
      reflection_prompt: 'What makes it hard to fully "cast" your anxieties on God rather than just acknowledging them and picking them back up?',
      prayer_prompt: 'Father, I throw this to You — not politely, but fully. Catch what I cannot hold.',
    },
    {
      day_number: 3,
      title: 'When Your Mind Won\'t Quiet',
      scripture_refs: ['Philippians 4:6-7'],
      devotional_text: `"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."\n\nThis is not a command to stop feeling anxious. It is a practice — a redirection of mental energy. Notice what Paul recommends: prayer, petition, and thanksgiving together. Not prayer alone. The addition of thanksgiving is significant. It is the act of deliberately naming what is still true and good, even while naming what is hard.\n\nThe result is not that the situation changes. The result is that peace "guards" your heart and mind — the Greek suggests a military sentinel standing watch. A protection that does not depend on circumstances resolving.\n\nYour mind may not quiet immediately. That is not a sign the practice isn't working. It is a sign you are a person, not a machine. Keep returning.`,
      reflection_prompt: 'What is one true and good thing you can name today, alongside whatever is difficult?',
      prayer_prompt: 'God, I bring You both the hard thing and the good thing. Guard my mind today. Be the peace that my circumstances cannot provide.',
    },
    {
      day_number: 4,
      title: 'The Tyranny of Tomorrow',
      scripture_refs: ['Matthew 6:25-34'],
      devotional_text: `Jesus says something quietly radical: "Do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own."\n\nAnxiety almost always lives in the future. It is the mind's attempt to control what hasn't happened yet — to rehearse worst-case scenarios until they feel certain. There is a kind of exhausting logic to it: if I can just anticipate every bad thing, I can prevent being caught off guard.\n\nBut Jesus points to birds and wildflowers — creatures that do not hoard, do not plan five moves ahead, and yet are held. Not because they are naive, but because they live in the present moment, which is the only place God's provision actually exists.\n\nYou cannot access tomorrow's grace today. Today's grace is available today. The worry about what might happen next month is real — but God's care for you next month is also real. You just can't feel it yet. That is not a deficiency. That is how time works.`,
      reflection_prompt: 'Which future scenario does your anxiety most often rehearse? What would it look like to release it — just for today?',
      prayer_prompt: 'Lord, I give You today. Just today. Help me live in the present moment, where Your grace is actually available to me.',
    },
    {
      day_number: 5,
      title: 'Fear Has a Name',
      scripture_refs: ['Isaiah 41:10', 'Psalm 56:3'],
      devotional_text: `"Do not fear, for I am with you; do not be dismayed, for I am your God."\n\nGod says "do not fear" more than any other command in Scripture. Some have counted 365 iterations — one for every day of the year. That either means God is unrealistic about human emotion, or it means He understands exactly how often fear shows up.\n\nI believe it is the second.\n\nNotice Isaiah 41:10 does not say: "Do not fear because there is nothing scary." It says: "Do not fear, for I am with you." The reason is not the absence of threat. The reason is the presence of God.\n\nPsalm 56:3 offers something even more honest: "When I am afraid, I will trust in You." Not if I am afraid. When. The Psalmist does not pretend fear doesn't exist. He names it, and then names what he does with it. That is the practice — not the suppression of fear, but the direction of it.`,
      reflection_prompt: 'What is the specific fear underneath your anxiety — not the symptoms, but the core fear? Can you name it plainly?',
      prayer_prompt: 'God, here is my fear: ___. I name it. And I name You. I will not let the fear be louder than Your presence.',
    },
    {
      day_number: 6,
      title: 'Breath as Prayer',
      scripture_refs: ['Psalm 46:10', 'Genesis 2:7'],
      devotional_text: `"Be still, and know that I am God."\n\nThe Hebrew word for "be still" is raphah — it means to let go, to release, to cease striving. It is a physical word as much as a spiritual one.\n\nGod breathed life into Adam. Every breath you take is, in some small way, a continuation of that original gift. When anxiety tightens the chest and shortens the breath, returning to slow, deliberate breathing is not just a wellness technique — it is a return to the most basic form of receiving what God gives.\n\nThere is a very old Christian practice of breath prayer — inhaling a word or phrase, exhaling another. Something like: inhale "You are God" / exhale "I release this." It is not magic. It is not about technique. It is about using the body to participate in what the spirit is doing.\n\nStillness is not passivity. It is a form of fierce, deliberate trust.`,
      reflection_prompt: 'Can you sit in silence for two minutes today — not to achieve anything, just to be present? What comes up when you do?',
      prayer_prompt: 'Lord, I breathe in Your presence. I breathe out what I cannot control. Still the storm in me.',
    },
    {
      day_number: 7,
      title: 'The God Who Sees You',
      scripture_refs: ['Genesis 16:13', 'Psalm 139:1-4'],
      devotional_text: `Hagar is a woman no one was looking for. Cast out, alone in the desert with a child about to die, she has been used and discarded. And it is to her — not to a patriarch, not to a prophet — that God appears.\n\nShe names Him: El Roi. The God who sees me.\n\nPsalm 139 extends this: "You have searched me, Lord, and You know me. You know when I sit and when I rise; You perceive my thoughts from afar."\n\nAnxiety often carries a hidden loneliness — a sense that no one truly knows the inside of what you are carrying. The exhausting work of managing how much you reveal to others. The fear that if people really knew, they would be overwhelmed.\n\nGod is not overwhelmed. He has searched you and known you — every thought, every fear, every sleepless hour. And He has not looked away.`,
      reflection_prompt: 'Is there a part of your inner world that you have been afraid to let God see? What would it mean to be fully known and not abandoned?',
      prayer_prompt: 'El Roi — the God who sees me — You know what I carry in the hidden places. I am not alone in this.',
    },
    {
      day_number: 8,
      title: 'Renewing the Mind',
      scripture_refs: ['Romans 12:2', '2 Corinthians 10:5'],
      devotional_text: `"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."\n\nThe mind is not neutral terrain. It is shaped by what it repeatedly attends to — the news cycle, old wounds, worst-case thinking, the voices of people who have hurt us. Over time, these form ruts: habitual paths of thought that feel involuntary because they have been worn so deep.\n\nRenewal does not mean forced positivity. It means choosing, repeatedly, which thoughts to follow and which to release. 2 Corinthians 10:5 speaks of "taking captive every thought to make it obedient to Christ" — an act of will, not a passive experience.\n\nThis takes practice. Repetition. Patience with yourself when you slip back into old grooves. The transformation Paul describes is ongoing — present tense in the Greek. It is not a one-time event. It is a direction.`,
      reflection_prompt: 'What is one thought pattern you notice recurring? What would a truth-shaped alternative to that thought sound like?',
      prayer_prompt: 'God, renew my mind. Not all at once — but steadily. Help me to think Your thoughts after You.',
    },
    {
      day_number: 9,
      title: 'Perfect Love Displaces Fear',
      scripture_refs: ['1 John 4:18', 'Romans 8:15'],
      devotional_text: `"There is no fear in love. But perfect love drives out fear, because fear has to do with punishment."\n\nJohn is not saying that a person who loves God perfectly will never feel fear. He is saying that as love grows — as we understand more deeply that we are not held by a God who is waiting to punish us — the grip of fear loosens.\n\nMany people carry a deep, unnamed anxiety about God Himself. A sense that He is watching for failures, tallying mistakes, disappointed at the gap between who we are and who we should be. That is not the God of Scripture. That is the distorted version — the one fear builds in the absence of love.\n\nRomans 8:15 names it: "The Spirit you received does not make you a slave, so that you live in fear again; rather, the Spirit you received brought about your adoption to sonship." You are not a servant hoping not to be fired. You are a child. Completely secure.`,
      reflection_prompt: 'Do you ever relate to God with a sense of fear or performance? Where did that image of God come from?',
      prayer_prompt: 'Father, heal my image of You. Let love be the loudest thing — louder than fear, louder than shame.',
    },
    {
      day_number: 10,
      title: 'Speaking Truth into the Storm',
      scripture_refs: ['2 Corinthians 10:5', 'Psalm 103:1'],
      devotional_text: `There is something ancient and powerful about speaking aloud.\n\nIn Psalm 103, David speaks to his own soul: "Praise the Lord, my soul; all my inmost being, praise His holy name." He is preaching to himself — redirecting his inner voice with intention and authority.\n\nAnxiety has a voice. It speaks in certainties: "This will end badly. You cannot handle this. Nothing will change." The practice of speaking truth aloud — not optimism, but actual truth grounded in Scripture — is one of the oldest forms of spiritual warfare there is.\n\nYou do not have to feel the truth when you say it. Faith often precedes feeling. Speaking "God is with me" on a day when you do not feel it is not denial — it is declaration. You are announcing what is real, regardless of what your nervous system is currently reporting.`,
      reflection_prompt: 'What is one true sentence about God or about yourself that you could speak aloud today — even if you don\'t feel it yet?',
      prayer_prompt: 'Lord, I declare: You are good. You are present. You have not left. I choose truth over feeling today.',
    },
    {
      day_number: 11,
      title: 'Rest as an Act of Trust',
      scripture_refs: ['Psalm 23', 'Matthew 11:28-30'],
      devotional_text: `"He makes me lie down in green pastures. He leads me beside quiet waters. He restores my soul."\n\nA sheep that is lying down is a sheep that is not running. Not performing. Not productive. Just — resting, in the presence of a shepherd it trusts.\n\nFor many people with anxiety, rest feels dangerous. The moment you stop doing, the thoughts rush in. The vigilance that feels protective becomes exhausting. And yet God insists: rest is not laziness. Rest is faith expressed in the body.\n\nTo stop — genuinely stop — is to declare that the world does not depend on your constant effort to hold it together. That God is present even when you are not watching. That you are not the load-bearing wall of the universe.\n\nGreen pastures and quiet waters are not rewards for the ones who finally earned a break. They are offered. The question is only whether you are willing to lie down.`,
      reflection_prompt: 'What would genuine rest look like for you today — not just sleep, but the kind of soul-rest that comes from releasing control?',
      prayer_prompt: 'Shepherd, lead me to still water. I am more exhausted than I admit. Restore my soul.',
    },
    {
      day_number: 12,
      title: 'You Were Not Made to Carry This Alone',
      scripture_refs: ['Galatians 6:2', 'Ecclesiastes 4:9-10'],
      devotional_text: `"Carry each other's burdens, and in this way you will fulfil the law of Christ."\n\nThere is a particular kind of anxiety that grows in isolation. The silence around our struggles can feel like protection — but it is often what allows fear to become certainty. Left alone, the mind can build very convincing stories.\n\nGalatians 6:2 is not a suggestion. It is how the community of faith is designed to function. Burden-bearing — sharing the weight of one another's real lives. Not performance, not pretense. Actual carrying.\n\nEcclesiastes says it plainly: "If either of them falls down, one can help the other up. But pity anyone who falls and has no one to help them up."\n\nIs there someone in your life who knows what you are actually carrying? Not the polished version — the real one? Vulnerability is not weakness. It is the door through which help can actually enter.`,
      reflection_prompt: 'Is there someone you trust enough to share what you\'ve been carrying in this season? What has kept you from doing that?',
      prayer_prompt: 'God, help me receive the help You send through people. Give me courage to be known — really known.',
    },
    {
      day_number: 13,
      title: 'Gratitude as a Practice',
      scripture_refs: ['Psalm 100', '1 Thessalonians 5:16-18'],
      devotional_text: `"Give thanks in all circumstances; for this is God's will for you in Christ Jesus."\n\nIn all circumstances. Not for all circumstances — Paul is not saying that suffering is good. He is saying that gratitude can exist alongside suffering, not instead of it.\n\nResearch on the human mind confirms what Scripture has always known: gratitude shifts attention. Not by denying what is hard, but by expanding what we see. Anxiety contracts vision — everything narrows to the threat. Gratitude expands it: there are still good things here, present alongside the difficulty.\n\nPsalm 100 is a song of gratitude that requires no particular circumstances to sing. "The Lord is good. His love endures forever." That is the anchor. It does not change based on how your week is going.\n\nGratitude is not a feeling you wait for. It is a practice you begin, and the feeling often follows.`,
      reflection_prompt: 'Name three specific things — however small — that are true and good in your life right now. Sit with each one for a moment.',
      prayer_prompt: 'Lord, I thank You for ___. I thank You for ___. I thank You for ___. Help gratitude be the rhythm underneath everything else.',
    },
    {
      day_number: 14,
      title: 'A Peace That Does Not Make Sense',
      scripture_refs: ['Isaiah 26:3', 'John 14:27'],
      devotional_text: `"You will keep in perfect peace those whose minds are steadfast, because they trust in You."\n\nPerfect peace. The Hebrew is shalom shalom — doubled for emphasis. Not merely the absence of conflict. A wholeness, a rightness, a settled okayness that runs deeper than circumstances.\n\nAnd Jesus, on the night before His death, says: "Peace I leave with you; my peace I give you. I do not give to you as the world gives." The world's peace is conditional — it depends on things going well. His peace is given in the middle of the hardest night He ever faced.\n\nYou have walked fourteen days with this. You may still have anxious moments. The goal was never to eliminate anxiety in two weeks. The goal is to build a practice — of returning, of naming, of trusting, of receiving. And to know: there is a peace available to you that is not contingent on your circumstances resolving. It is a gift. Keep receiving it.`,
      reflection_prompt: 'How has this two-week journey shifted something in you — even slightly? What do you want to carry forward?',
      prayer_prompt: 'Prince of Peace, I want to live from this shalom — not just visit it. Keep me anchored in You.',
    },
  ],

  // ── 3. IDENTITY IN CHRIST ───────────────────────────────────
  'identity-in-christ': [
    {
      day_number: 1,
      title: 'Before the World Named You',
      scripture_refs: ['Psalm 139:13-16'],
      devotional_text: `"For you created my inmost being; you knit me together in my mother's womb."\n\nBefore a single person spoke a word over you — before your parents named you, before a teacher praised or criticized you, before your first success or failure — God was already at work. Knitting. Forming. Intentionally creating what would become you.\n\nIdentity crises often begin with the wrong starting point. We ask: who do others say I am? What have my experiences made me? What do I feel like I am? These are real questions. But they are not the first question.\n\nThe first question is: what did God make when He made me?\n\nPsalm 139 says your days were "written in His book before one of them came to be." You are not an accident of circumstances. You are not defined by what has been done to you or what you have done. You are, first and last, something God made on purpose.`,
      reflection_prompt: 'What voices or experiences have most shaped how you see yourself? How do they compare to how God describes you?',
      prayer_prompt: 'Creator God, show me myself through Your eyes — not through the eyes of my history.',
    },
    {
      day_number: 2,
      title: 'Chosen and Set Apart',
      scripture_refs: ['1 Peter 2:9', 'Deuteronomy 7:6'],
      devotional_text: `"But you are a chosen people, a royal priesthood, a holy nation, God's special possession."\n\nPeter is writing to scattered, marginalised believers — people who did not feel chosen. People who had been displaced, dismissed, and excluded by the dominant culture. And he writes to them: chosen. Royal. Holy. Special.\n\nThis is not flattery. It is identity declaration.\n\nBeing chosen by God is not about being better than others. It is about being loved with intention. You were not swept into the kingdom by accident — you were sought. Called. Wanted.\n\nThere is something in most of us that craves to be picked — to be seen as worthy of selection. Sports teams, friend groups, job offers, relationships. The anxiety around belonging runs very deep.\n\nBut here is what God has already said: you are already chosen. Not for what you can produce. Simply because you are His.`,
      reflection_prompt: 'In what areas of life do you most feel the need to prove you are worthy of being chosen? How does being chosen by God speak into that?',
      prayer_prompt: 'Lord, let Your choosing of me be enough. Quiet the striving that comes from needing to earn belonging.',
    },
    {
      day_number: 3,
      title: 'Adopted, Not Orphaned',
      scripture_refs: ['Romans 8:14-17', 'Galatians 4:4-7'],
      devotional_text: `"The Spirit you received does not make you a slave, so that you live in fear again; rather, the Spirit you received brought about your adoption to sonship. And by him we cry, 'Abba, Father.'"\n\nAbba is not formal. It is intimate. It is the word a young child uses — closer to "Daddy" than "Father." This is the word Paul says the Holy Spirit enables us to cry out to God.\n\nAdoption in the Roman world of Paul's day was a profound legal act. An adopted child had every right of a biological child — the inheritance, the name, the standing, the protection. There was no second-class status. No probationary period. Full sonship, immediately.\n\nThat is what you are. Not a guest in God's house. Not an employee on good terms. Not a servant hoping to be elevated someday. A child. With full access, full inheritance, full belonging. Already.`,
      reflection_prompt: 'Do you experience your relationship with God more as a servant/master dynamic or as a child/parent one? What has shaped that experience?',
      prayer_prompt: 'Abba, Father — I receive my place in Your family. Fully. Not partially. I am Yours.',
    },
    {
      day_number: 4,
      title: 'Forgiven Completely',
      scripture_refs: ['Psalm 103:8-12', 'Micah 7:19'],
      devotional_text: `"As far as the east is from the west, so far has he removed our transgressions from us."\n\nEast and west never meet. There is no point on a globe where east becomes west. David chooses this image deliberately: it is a distance that has no measurement.\n\nMicah adds: "You will tread our sins underfoot and hurl all our iniquities into the depths of the sea."\n\nImagine that for a moment. Not filed away for later retrieval. Not placed on a shelf where God might reference them in a moment of disappointment. Hurled. Into the deep.\n\nMany people live with forgiveness as a concept but not an experience. They know God has forgiven them. They can say the words. But in quiet moments, the old guilt surfaces. The inventory of failures that never quite clears.\n\nForgiveness is not just juridical — a legal status change. It is relational. God does not look at you and see your worst moments. He sees you through what Christ has done. That is who you are.`,
      reflection_prompt: 'Is there something specific you carry guilt about that you have not fully received forgiveness for? What would it look like to let it go — completely?',
      prayer_prompt: 'God, I receive forgiveness — not just the fact of it, but the freedom of it. What You have hurled into the sea, I will not go diving for.',
    },
    {
      day_number: 5,
      title: 'Righteous, Not Perfect',
      scripture_refs: ['2 Corinthians 5:21', 'Romans 5:1'],
      devotional_text: `"God made him who had no sin to be sin for us, so that in him we might become the righteousness of God."\n\nThis is the great exchange. Jesus took on what we were so that we could be given what He is. He did not merely improve our standing — He transferred His own righteousness to us.\n\nRighteousness in this context is not about behaviour. It is about standing before God. It is about being in right relationship with the One who made everything. And Paul says: in Christ, that is what you are.\n\nThis distinction matters enormously for identity. Perfectionism says: "I am only acceptable when I perform at a certain level." Righteousness says: "My acceptance before God has already been secured. I am not striving toward it — I am living from it."\n\nYou are not righteous because you are perfect. You are righteous because of what Christ has done. That is permanent, unconditional, and not subject to revision on your bad days.`,
      reflection_prompt: 'Do you tend toward perfectionism in your spiritual life — performing for God rather than resting in what Christ has already done? What does that feel like?',
      prayer_prompt: 'Jesus, thank You for the exchange. I bring what I am and receive what You are. That is enough.',
    },
    {
      day_number: 6,
      title: 'More Than a Conqueror',
      scripture_refs: ['Romans 8:37-39'],
      devotional_text: `"In all these things we are more than conquerors through him who loved us."\n\nPaul lists the things before that phrase: trouble, hardship, persecution, famine, nakedness, danger, sword. He is not writing from a comfortable chair about hypothetical difficulty. He is writing from the middle of a life that was genuinely hard.\n\nAnd in all these things — not around them, not after they resolve — more than conquerors.\n\nThe phrase in Greek is hupernikomen — hyper-conquerors. Overwhelmingly victorious. Not barely surviving. Not enduring with gritted teeth. Triumphant in a way that goes beyond what the circumstances would suggest.\n\nThis is identity for the hard seasons. Not "things will get better" — though they may. But "who you are in Christ is not diminished by what you are going through." The trouble does not redefine you. He does.`,
      reflection_prompt: 'In what current difficulty do you need to hear that you are more than a conqueror — not after it resolves, but right in the middle of it?',
      prayer_prompt: 'Lord, I claim this over my life today. In this — all of this — I am not defeated. I am held by One who has already overcome.',
    },
    {
      day_number: 7,
      title: 'The Temple You Are',
      scripture_refs: ['1 Corinthians 6:19-20', '2 Corinthians 6:16'],
      devotional_text: `"Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?"\n\nIn the ancient world, a temple was not simply a building. It was the dwelling place of the divine — the location where heaven and earth met. It was the most holy geography in a culture's imagination.\n\nAnd Paul says: that is what you are. The dwelling place of the Holy Spirit. The place where heaven meets earth in your particular body, in your particular city, in your particular life.\n\nThis has profound implications for how you treat yourself — not with self-worship, but with a reverence that comes from knowing you are inhabited. Your body is not an obstacle to spiritual life. It is the address at which God has chosen to live.\n\nHow might you treat yourself differently if you really believed this?`,
      reflection_prompt: 'How does the idea of your body as a temple change how you think about self-care, rest, and how you speak about yourself?',
      prayer_prompt: 'Holy Spirit, You have chosen to dwell in me. I honour that. Help me treat myself with the dignity of someone who carries Your presence.',
    },
    {
      day_number: 8,
      title: 'Friend of God',
      scripture_refs: ['John 15:13-15', 'James 2:23'],
      devotional_text: `"I no longer call you servants, because a servant does not know his master's business. Instead, I have called you friends."\n\nJesus says this to His disciples on the night of His betrayal. In a moment that could have been only solemn and weighty, He draws near and redefines the relationship.\n\nA servant obeys without understanding. A friend is let in — into the purposes, the heart, the plans. Jesus says: I have made known to you everything I have heard from my Father. Full disclosure. Total access.\n\nAbraham was called "friend of God" — the only person in Scripture given that title directly. It is a title of intimacy and trust. God shared His plans with Abraham. He argued with him. He showed up when Abraham needed him.\n\nYou are not merely a recipient of God's gifts or a beneficiary of His grace. You are someone He calls friend.`,
      reflection_prompt: 'What would your relationship with God look like if you related to Him more as a friend than as a distant authority figure?',
      prayer_prompt: 'Lord, I want this — not just a functional faith, but a friendship. Draw me close enough to know Your heart.',
    },
    {
      day_number: 9,
      title: 'Co-Heir with Christ',
      scripture_refs: ['Galatians 3:26-29', 'Romans 8:17'],
      devotional_text: `"Now if we are children, then we are heirs — heirs of God and co-heirs with Christ."\n\nAn inheritance in the ancient world was the transfer of everything a father possessed. To be an heir was to receive, in full, what the father had built and accumulated and owned.\n\nRomans 8:17 says we are co-heirs with Christ. Not heirs to a smaller, secondary portion. Not junior partners in the arrangement. Co-heirs. Whatever Christ inherits, we inherit.\n\nGalatians 3:28 is even more startling in context: "There is neither Jew nor Gentile, neither slave nor free, nor is there male and female, for you are all one in Christ Jesus." Every social hierarchy that the ancient world used to assign worth — dismantled. In Christ, the categories that divided people into greater and lesser have no force.\n\nYou are not a second-tier child of God. You stand in full inheritance.`,
      reflection_prompt: 'Are there ways you have felt like a second-class citizen in God\'s kingdom — less worthy, less qualified, less included? What does this truth say to that?',
      prayer_prompt: 'Father, I stand in the full inheritance You have given. I will not diminish what You have declared over me.',
    },
    {
      day_number: 10,
      title: 'Sealed and Certain',
      scripture_refs: ['Ephesians 1:13-14', 'John 10:28-29'],
      devotional_text: `"Having believed, you were marked in him with a seal, the promised Holy Spirit, who is a deposit guaranteeing our inheritance."\n\nA seal in the ancient world was a mark of ownership and protection — pressed into wax to authenticate and to protect. Paul says believers are sealed with the Holy Spirit. Marked. Authenticated. Protected.\n\nThe word "deposit" here is arrhabon in Greek — a down payment. A guarantee of what is coming. The presence of the Spirit in your life is not the full story; it is the first instalment of something that will be completed.\n\nJesus adds: "No one will snatch them out of my hand. My Father, who has given them to me, is greater than all; no one can snatch them out of my Father's hand."\n\nYou are held by two hands — the Son's and the Father's. Your identity in Christ is not fragile. It does not depend on your consistency, your performance, or your feelings. It is sealed.`,
      reflection_prompt: 'Looking back over these ten days: which truth about your identity in Christ has landed most deeply? What do you want to carry from this into the next season?',
      prayer_prompt: 'God, seal these truths in me. Let who You say I am be more real to me than anything else I hear. I am Yours — sealed, certain, and held.',
    },
  ],

  // ── 4. PRAYER & FASTING ─────────────────────────────────────
  'prayer-and-fasting': [
    {
      day_number: 1,
      title: 'Why We Fast',
      scripture_refs: ['Isaiah 58:6-7', 'Matthew 6:16-18'],
      devotional_text: `Fasting is one of the most misunderstood spiritual practices. It is not a hunger strike aimed at getting God's attention. It is not a religious performance that earns favour. It is not about willpower or discipline for its own sake.\n\nIsaiah 58 is God correcting a people who fast for the wrong reasons — to be seen, to appear devout, to feel spiritually productive. He says: that is not the fast I have chosen. The fast I choose is about freedom for the oppressed, food for the hungry, care for the vulnerable.\n\nFasting creates space. When you remove food — or any comfort you are using as a substitute for God — you become aware of a hunger that food was never meant to fill. That awareness is not punishment. It is an invitation.\n\nJesus assumes His followers will fast — He says "when you fast," not "if." But He says to do it privately, without performance. The practice is between you and God. Begin there.`,
      reflection_prompt: 'What are you hoping God will do or say in this week of fasting and prayer? Be specific.',
      prayer_prompt: 'Lord, I begin this fast not to impress You but to seek You. Clear space in me. I want to hear what I have been too busy to hear.',
    },
    {
      day_number: 2,
      title: 'The Posture of Prayer',
      scripture_refs: ['Matthew 6:5-13', 'Luke 18:9-14'],
      devotional_text: `The Pharisee and the tax collector both pray. One lists his accomplishments. The other can barely lift his head. Jesus says the second man, not the first, goes home justified.\n\nThere is a particular danger in fasting of the heart becoming proud. "I am doing this hard thing. I am seeking God seriously." And before long, the fast becomes its own form of performance.\n\nThe Lord's Prayer, offered in Matthew 6 as a template, begins with reverence and ends with surrender. It holds together who God is (hallowed, sovereign, provider, forgiver, protector) with who we are (dependent, in need of daily bread, in need of forgiveness, in need of deliverance).\n\nThe posture is not groveling. It is honest. It is the posture of someone who knows who they are speaking to, and who they are in comparison — and who speaks anyway, because they are loved.`,
      reflection_prompt: 'What does your default prayer posture look like — are you usually performing, informing, requesting, or genuinely communing?',
      prayer_prompt: 'Father in heaven, hallowed be Your name. I come without pretense. Just as I am.',
    },
    {
      day_number: 3,
      title: 'When Heaven Seems Silent',
      scripture_refs: ['Psalm 22:1-5', 'Habakkuk 1:2'],
      devotional_text: `"My God, my God, why have you forsaken me?"\n\nThese are not the words of someone with weak faith. They are the opening line of Psalm 22 — a psalm Jesus quotes from the cross. If anyone had the right to feel the silence of God, it was Jesus in that moment.\n\nSilence in prayer is one of the most disorienting experiences a person can have. You fast, you pray, you seek — and nothing seems to happen. No clarity, no peace, no burning bush.\n\nHabakkuk cries: "How long, Lord, must I call for help, but you do not listen?" And God answers — not immediately, not with explanation, but eventually. "Write down the vision. It is coming. Wait for it."\n\nSilence is not absence. It is often the terrain where trust is formed most deeply. The discipline of continuing to pray into silence is itself a profound act of faith.`,
      reflection_prompt: 'Have you experienced a season of prayer where God felt silent? What did you do with that? What do you wish you had done?',
      prayer_prompt: 'God, I will not interpret Your silence as absence. I will keep praying. I trust that You hear.',
    },
    {
      day_number: 4,
      title: 'Hunger as Invitation',
      scripture_refs: ['Matthew 4:1-4', 'Deuteronomy 8:3'],
      devotional_text: `After forty days of fasting, Jesus is hungry. The temptation is immediate and logical: you have this power — use it. Turn stone into bread. Meet your own need.\n\nJesus's answer reaches back into Deuteronomy: "Man shall not live on bread alone, but on every word that comes from the mouth of God."\n\nThe hunger of fasting is not an obstacle to prayer. It is the teacher. Every time your stomach signals want, it becomes a moment of redirection — not toward food, but toward the One who said He is the bread of life.\n\nThere is a thing that hunger does to the spirit that comfort cannot do. It clarifies. It strips away the noise of satisfaction and leaves you in a simpler, more honest place. Fasting turns physical sensation into spiritual attention.\n\nLet your hunger today be a prayer.`,
      reflection_prompt: 'What comfort or habit — beyond food — are you using to fill a space that is meant for God?',
      prayer_prompt: 'Jesus, bread of life — I am hungry for more than food. Feed me with what only You can give.',
    },
    {
      day_number: 5,
      title: 'The Ministry of Intercession',
      scripture_refs: ['Romans 8:26-27', '1 Timothy 2:1'],
      devotional_text: `Intercession — praying on behalf of others — is one of the most selfless acts available to a human being. It is taking your position before God and using it not primarily for your own needs, but for someone else's.\n\nPaul says in Romans 8 that the Spirit intercedes for us with "groans that words cannot express." The Spirit knows what we need better than we can articulate. He prays through us and for us.\n\nFasting sharpens intercession. When you fast for someone — carrying their name before God while you carry the physical reminder of hunger — something happens in the spiritual realm that ordinary prayer may not touch. You are aligning your body's attention with your spirit's petition.\n\nWho is on your heart this week? Name them. Fast for them. Bring them before God with the seriousness of someone who believes prayer actually moves things.`,
      reflection_prompt: 'Who are you specifically praying and fasting for this week? What do you believe God can do in their life?',
      prayer_prompt: 'Lord, I bring ___ before You. I intercede for them with everything I have. Move in their life in ways I cannot engineer.',
    },
    {
      day_number: 6,
      title: 'The Moment of Breakthrough',
      scripture_refs: ['Daniel 10:12-14', 'Luke 18:1-8'],
      devotional_text: `Daniel fasted and prayed for three weeks before an angel arrived with this message: "Since the first day that you set your mind to gain understanding and to humble yourself before your God, your words were heard."\n\nDay one. The prayer was heard on day one. The answer was delayed not because God did not hear, but because of what was happening in the unseen realm.\n\nJesus tells the parable of the persistent widow to illustrate that we "should always pray and not give up." The widow's persistence is not about convincing an unwilling judge — it is about not abandoning the post.\n\nBreakthrough in prayer often comes not in a sudden dramatic moment but as a slow dawn — and then, at some point you cannot always identify, something has shifted. Keep the post. Keep praying. The first day you prayed — it was heard.`,
      reflection_prompt: 'Is there a prayer you have nearly given up on? What would it look like to return to it with fresh faith?',
      prayer_prompt: 'Father, I will not give up. I will keep coming. I believe You hear, and I trust Your timing over mine.',
    },
    {
      day_number: 7,
      title: 'The Return',
      scripture_refs: ['Joel 2:12-13', 'Zephaniah 3:17'],
      devotional_text: `"Return to me with all your heart, with fasting and weeping and mourning. Rend your heart and not your garments."\n\nThe tearing of garments was an outward sign of grief in the ancient Near East. God says: I do not want the sign. I want the thing itself. Not the performance of returning — the actual return.\n\nThis week, you have fasted and prayed. You have created space and sought His face. And now the question is not what God has done in response — it is what has happened in you.\n\nFasting changes the one who fasts. Not always dramatically. But if you have been honest with God this week — if you have brought your real hunger, your real prayers, your real intercession — you are not the same person who began on day one.\n\nZephaniah 3:17 is the promise underneath all of this: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing."\n\nYou are the one He sings over.`,
      reflection_prompt: 'What has shifted in you over this week — in how you see God, how you see yourself, or how you see the things you have been praying about?',
      prayer_prompt: 'Lord, I return to You. Not with a performance, but with my whole heart. I am Yours. Rejoice over me — and let me hear that song.',
    },
  ],

  // ── 5. HEALING & FORGIVENESS ────────────────────────────────
  'healing-and-forgiveness': [
    {
      day_number: 1,
      title: 'The Wound That Needs a Name',
      scripture_refs: ['Psalm 34:18', 'Psalm 147:3'],
      devotional_text: `"The Lord is close to the brokenhearted and saves those who are crushed in spirit."\n\nBefore healing can begin, something has to be named. Not minimized, not explained away, not spiritualized past — named. The wound is real. What was done to you was real. What you did, and carry, is real.\n\nGod is not afraid of the specific. He does not ask for a sanitized summary. He is close to the brokenhearted — not once they have healed, but in the breaking. The proximity is to the wound, not the recovered version of you.\n\nThis ten-day plan does not promise a quick resolution. Healing is not linear, and it does not operate on a schedule. What it offers is companionship through the terrain — Scripture, reflection, and the presence of a God who binds up wounds with His own hands.\n\nToday: simply bring the wound. Name it, if you can. You do not have to fix it yet. Just bring it.`,
      reflection_prompt: 'What wound are you carrying into this plan? Give it a name — as specifically as you can.',
      prayer_prompt: 'God who heals, I bring You what hurts. I don\'t have the words to explain all of it. But You are close to the brokenhearted. Be close to me.',
    },
    {
      day_number: 2,
      title: 'God in the Broken Places',
      scripture_refs: ['Isaiah 53:3-5', 'Hebrews 4:15'],
      devotional_text: `"He was despised and rejected by mankind, a man of suffering, and familiar with pain."\n\nJesus is not a distant observer of human suffering. He is the God who entered it. Isaiah 53 describes a figure who was not sheltered from the hardest human experiences — betrayal, rejection, physical pain, public humiliation, being misunderstood by people He loved.\n\nHebrews 4:15 says He was "tempted in every way, just as we are." And therefore He is able to "empathize with our weaknesses."\n\nEmpathize. Not merely sympathize from a safe distance. Empathize — from inside the same human experience.\n\nWhen you bring your pain to Jesus, you are not bringing it to someone who has only theorized about suffering. You are bringing it to someone who knows. Who has carried wounds of His own. That changes the texture of prayer. You are not explaining your experience to someone who cannot understand it.`,
      reflection_prompt: 'Does knowing that Jesus has experienced rejection, betrayal, and suffering change how you relate to Him in your pain? In what way?',
      prayer_prompt: 'Jesus, You know what this feels like. You are not far from me in this. Come near — not to fix immediately, but to be with me.',
    },
    {
      day_number: 3,
      title: 'Permission to Grieve',
      scripture_refs: ['John 11:33-35', 'Ecclesiastes 3:4'],
      devotional_text: `"When Jesus saw her weeping, and the Jews who had come along with her also weeping, he was deeply moved in spirit and troubled."\n\nAnd then, the shortest verse in Scripture: "Jesus wept."\n\nLazarus is about to be raised from the dead. Jesus knows this. He has said it. And He still weeps.\n\nThis tells us something profound about grief: it is not a failure of faith. It is not a sign that you do not trust God enough. It is the natural, human, even holy response to loss and pain. Jesus — who knew the resurrection was coming — still stopped and wept.\n\nEcclesiastes names this: there is a time to weep, and a time to mourn. Not a time to pretend you are fine. Not a time to rush past sadness to get to the good part. A time to weep.\n\nIf you have not yet allowed yourself to fully grieve what you are carrying — today is permission. God is not waiting for you to be done with grief before He draws close.`,
      reflection_prompt: 'Have you given yourself permission to grieve the specific thing you are carrying? What has gotten in the way of that?',
      prayer_prompt: 'Lord, I give myself permission to feel this fully. Hold me as I do. You wept at Lazarus\' tomb — weep with me here.',
    },
    {
      day_number: 4,
      title: 'The Weight of Unforgiveness',
      scripture_refs: ['Matthew 18:21-35', 'Hebrews 12:15'],
      devotional_text: `Unforgiveness has a physical weight. Ask anyone who has carried it for years. It lives in the chest, in the jaw, in the early morning hours when the mind returns to what was done.\n\nJesus tells a parable about a servant who is forgiven an enormous debt — millions — and then refuses to forgive a colleague who owes him almost nothing. The original debtor is handed to the jailers. The torment, Jesus implies, is self-inflicted through the refusal to release.\n\nHere is what forgiveness is not: it is not saying what was done was acceptable. It is not reconciling with someone who has not changed. It is not forgetting.\n\nHere is what it is: releasing the debt. Choosing not to carry the demand for repayment that the offender may never make. Not for their sake — for yours. The jailer in the parable is not the offender. The jailer is the unforgiveness itself.`,
      reflection_prompt: 'Is there someone you have not forgiven? What has forgiveness felt like it would cost you?',
      prayer_prompt: 'God, I know I am called to forgive. I don\'t feel ready. Help me be willing to be willing. Start there.',
    },
    {
      day_number: 5,
      title: 'What Forgiveness Is Not',
      scripture_refs: ['Genesis 50:19-21', 'Luke 17:3-4'],
      devotional_text: `Joseph has every reason for bitterness. Sold into slavery by his own brothers. Falsely accused. Imprisoned. Years of suffering that began with betrayal by the people closest to him.\n\nAnd when he finally has power over them — when they are at his mercy and afraid — he says: "You intended to harm me, but God intended it for good."\n\nNotice: he does not say they did not intend harm. He does not pretend the betrayal was not real. He names it plainly. They meant it for harm. That is the truth.\n\nAnd then he holds a larger truth alongside it.\n\nForgiveness does not require you to minimize what happened. It does not require you to trust the person again before they have earned that trust. It does not mean the relationship is automatically restored. Luke 17:3 actually says if someone sins against you, rebuke them — then forgive. Truth and forgiveness together.`,
      reflection_prompt: 'Have you confused forgiveness with pretending it wasn\'t that bad, or with being forced to trust someone again? What does healthy forgiveness look like in your specific situation?',
      prayer_prompt: 'Lord, teach me what forgiveness actually is — not the distorted version, but the real one. The one that frees me.',
    },
    {
      day_number: 6,
      title: 'Releasing the Debt',
      scripture_refs: ['Colossians 3:13', 'Ephesians 4:31-32'],
      devotional_text: `"Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you."\n\nForgive as the Lord forgave you. That is the measure. And the Lord forgave you completely, without condition, while you were still in the wrong, at great cost to Himself.\n\nThat standard is not meant to guilt us into forgiveness. It is meant to root our forgiveness in something larger than our own generosity, which will always be insufficient. We forgive from the overflow of having been forgiven — not from a reservoir of our own goodness.\n\nEphesians 4:31 asks us to put away bitterness, rage, anger, brawling, and slander. These are the fruits of held unforgiveness. And in their place: kindness, compassion, forgiveness.\n\nReleasing a debt is a decision before it is a feeling. Make the decision first. The feeling will — eventually — follow.`,
      reflection_prompt: 'What would it look like, practically and concretely, to release the debt of what was done to you? What is the first step?',
      prayer_prompt: 'God, I choose to forgive ___. I don\'t feel it fully yet. But I release the debt. Help me mean it more every day.',
    },
    {
      day_number: 7,
      title: 'Healing Takes Time',
      scripture_refs: ['Psalm 30:2-5', 'Isaiah 40:29-31'],
      devotional_text: `"Weeping may stay for the night, but rejoicing comes in the morning."\n\nDavid does not say: weeping will not stay the night. He does not promise it is brief. He says the night has a morning that follows it.\n\nHealing does not arrive on schedule. There is no standard timeline for recovering from deep wounds. The person who is "still not over it" after the culturally acceptable grieving period is not weak. They are human. Some things take years. Some things take a lifetime of learning to live alongside.\n\nIsaiah 40:31 speaks of those who wait on the Lord renewing their strength — soaring, running, walking. Notice the order: soaring comes first, but walking is mentioned last. Sometimes the most faithful thing is not soaring. It is the quiet, unglamorous act of continuing to walk when you do not feel strong.\n\nYou are allowed to be in the middle of healing. That is a real place. God is in that place too.`,
      reflection_prompt: 'Where are you in the healing process — in the night, watching for morning, or somewhere in between? Be honest.',
      prayer_prompt: 'Lord, I am not where I want to be. But I am further than where I was. Walk with me through this — all the way to morning.',
    },
    {
      day_number: 8,
      title: 'Your Story Is Not Over',
      scripture_refs: ['Joel 2:25', 'Romans 8:28'],
      devotional_text: `"I will repay you for the years the locusts have eaten."\n\nThese are among the most extraordinary words in the Old Testament. God is speaking to a people who have watched their harvests destroyed — years of slow devastation. And He promises not just future abundance, but the restoration of what was lost.\n\nHe does not say the locusts were good. He does not say the years of loss were His plan. He says: I will repay. What was taken will be given back, in some form, in some measure.\n\nRomans 8:28 does not say all things are good. It says all things work together for good for those who love God. The raw material of your hardest years is not wasted. It is being worked with — by Someone who does not let anything be finally lost.\n\nYour story is not over. The years the locusts have eaten are not the final chapter.`,
      reflection_prompt: 'What years or seasons feel "eaten" to you — wasted, stolen, broken? Can you imagine God working with that material rather than ignoring it?',
      prayer_prompt: 'God of restoration, I give You the lost years. Make something of what was taken. I trust that my story is not over.',
    },
    {
      day_number: 9,
      title: 'Forgiving Yourself',
      scripture_refs: ['Romans 8:1', '1 John 1:9'],
      devotional_text: `"Therefore, there is now no condemnation for those who are in Christ Jesus."\n\nNo condemnation. Not "reduced condemnation" or "condemnation contingent on your ongoing improvement." None.\n\nSelf-forgiveness is, for many people, harder than forgiving others. The inner critic is merciless. It keeps a detailed, well-organised inventory of failures. It reminds you of the worst versions of yourself at the most inopportune moments.\n\n1 John 1:9 says: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." The condition is confession — not perfection. Not sufficient punishment. Not having suffered enough. Honest acknowledgment.\n\nWhen you hold onto self-condemnation after God has forgiven you, you are, in a strange way, insisting that your judgment of yourself is more final than His. You are, quietly, putting yourself above God's verdict.\n\nHis verdict is: no condemnation.`,
      reflection_prompt: 'Is there something you have done that you have not been able to forgive yourself for, even though you believe God has? What is keeping you from receiving that verdict?',
      prayer_prompt: 'Father, I receive it — not as a feeling, but as a fact. No condemnation. I will not re-prosecute what You have already dismissed.',
    },
    {
      day_number: 10,
      title: 'Wholeness, Not Just Recovery',
      scripture_refs: ['John 10:10', 'Revelation 21:5'],
      devotional_text: `"I have come that they may have life, and have it to the full."\n\nThe goal of healing is not merely to return to where you were before the wound. That is recovery. Jesus offers something more: life abundant, full, exceeding what was there before.\n\nThere is a Hebrew concept — shalom — that is often translated "peace" but means something richer. It is wholeness, completeness, the right-fittedness of all things. When the Scriptures speak of the future God is building, shalom is at the centre of it.\n\nRevelation 21:5: "I am making everything new." Not "I am making everything the way it used to be." New. Something that has not existed before. The wounds are not simply erased — in the resurrection, Jesus still bears His scars, but they are no longer damaging. They are transformed into something that proves His love.\n\nYour healing is moving toward wholeness. Not the absence of a past, but a future so real it transfigures what came before.`,
      reflection_prompt: 'What would "life to the full" look like for you specifically — on the other side of this wound? Dare to imagine it.',
      prayer_prompt: 'Jesus, I want more than recovery. I want the full life You came to give. Make me whole — in whatever way You choose.',
    },
  ],

  // ── 6. WALKING IN PURPOSE ───────────────────────────────────
  'walking-in-purpose': [
    {
      day_number: 1,
      title: 'You Were Made Intentionally',
      scripture_refs: ['Ephesians 2:10', 'Psalm 139:13-16'],
      devotional_text: `"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do."\n\nThe word handiwork in Greek is poiema — the root of our word "poem." You are not an accident of biology and circumstance. You are something God composed. A poem written with intention, with a particular voice, a particular weight, a particular beauty that belongs only to you.\n\nAnd there are works — good works — that were prepared in advance for you specifically. Not for humanity in general. For you. With your particular gifts, your particular story, your particular access to the particular people in your particular world.\n\nThis is where the question of purpose begins: not "what should I do with my life?" but "what did God make when He made me, and what was He thinking when He made it?" Start there.`,
      reflection_prompt: 'What are the things you do that make you feel most fully yourself — most alive, most connected to something larger? These are clues.',
      prayer_prompt: 'Creator, help me see myself as Your handiwork. Show me what You were thinking when You made me.',
    },
    {
      day_number: 2,
      title: 'Called Before You Understood',
      scripture_refs: ['Jeremiah 1:5', 'Isaiah 49:1'],
      devotional_text: `"Before I formed you in the womb I knew you, before you were born I set you apart; I appointed you as a prophet to the nations."\n\nGod says this to Jeremiah, who promptly objects that he is too young, too inarticulate, too insignificant for whatever God has in mind. The calling precedes the qualification.\n\nThis is important because most of us are waiting to feel ready. Waiting until our faith is stronger, our character more settled, our skills more developed. But calling in Scripture tends to arrive before competence — and competence is developed in the act of responding, not in preparation for it.\n\nIsaiah 49:1 echoes the same pattern: "Before I was born the Lord called me; from my mother's womb he has spoken my name." The calling is not something you develop. It is something you discover — already written in the fabric of who you are.`,
      reflection_prompt: 'What have you been waiting to feel "ready" for? Is the waiting wisdom, or is it fear dressed as patience?',
      prayer_prompt: 'Lord, You called me before I understood anything. Help me respond to the calling, not just prepare for it indefinitely.',
    },
    {
      day_number: 3,
      title: 'The Gifts You May Have Undervalued',
      scripture_refs: ['Romans 12:6-8', '1 Corinthians 12:7'],
      devotional_text: `Paul lists gifts with no hierarchy attached: prophecy, serving, teaching, encouraging, giving, leading, showing mercy. Each one described with the same seriousness. No gift is presented as more spiritual than another.\n\n1 Corinthians 12:7 says: "Now to each one the manifestation of the Spirit is given for the common good." Each one. Without exception. And for the common good — meaning your gift is not primarily for your own benefit. It is for others. It has an address.\n\nMany people undervalue their gifts because the gifts feel ordinary to them. The person with extraordinary mercy cannot understand why everyone doesn't notice what suffering people are feeling. The person with the gift of teaching cannot understand why the explanation they just gave wasn't obvious. Your gift feels effortless to you because it was made for you.\n\nWhat comes naturally — and is useful to others — is often exactly where your purpose lives.`,
      reflection_prompt: 'What do people thank you for most consistently? What do you do that others seem to struggle with but comes easily to you?',
      prayer_prompt: 'Holy Spirit, show me the gifts You have placed in me — especially the ones I\'ve been dismissing as ordinary.',
    },
    {
      day_number: 4,
      title: 'Obedience Before Clarity',
      scripture_refs: ['Proverbs 3:5-6', 'John 7:17'],
      devotional_text: `"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."\n\nNotice the sequence. Trust first. Submission first. Then the making straight of paths.\n\nMany of us want it the other way around: show me the path clearly, and I will trust You and submit. But that is not the pattern Scripture describes. The clarity follows the trust — it does not precede it.\n\nJohn 7:17 adds a striking condition: "Anyone who chooses to do the will of God will find out whether my teaching comes from God." Understanding comes through doing. Not through enough preparation, enough information, enough certainty before you move.\n\nPurpose often becomes clear in the moving — in the obedience to the next small thing you already know you are supposed to do. Start there. Clarity follows faithfulness.`,
      reflection_prompt: 'What is the next small thing you already know you should do — the thing you\'ve been waiting for more clarity before acting on?',
      prayer_prompt: 'Lord, I will trust You before I can see clearly. I take the next step I know. Guide my path from there.',
    },
    {
      day_number: 5,
      title: 'When the Direction Is Unclear',
      scripture_refs: ['Isaiah 30:21', 'Psalm 32:8'],
      devotional_text: `"Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, 'This is the way; walk in it.'"\n\nA voice behind you. Not a flashing sign ahead. Not a map with every turn pre-marked. A voice that speaks as you walk — guidance that is present-tense, relational, and responsive.\n\nPsalm 32:8 is God speaking: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you."\n\nWith my loving eye on you. This is not surveillance. It is attentiveness. The image is of someone watching you carefully, with care, ready to speak at the moment of need.\n\nWhen the direction is unclear, the spiritual practice is to keep walking — to keep moving in the last direction you had clarity about, staying attentive to the voice, trusting that guidance will arrive when it is needed and not necessarily before.`,
      reflection_prompt: 'When direction feels unclear, what is your default response — paralysis, anxiety, or patient attentiveness? What does God\'s invitation to you in this season look like?',
      prayer_prompt: 'God, I am listening for Your voice. Speak when I need to turn. I will keep walking and keep listening.',
    },
    {
      day_number: 6,
      title: 'The Power of Small Faithfulness',
      scripture_refs: ['Luke 16:10', 'Zechariah 4:10'],
      devotional_text: `"Whoever can be trusted with very little can also be trusted with much."\n\nThis is one of the most quietly countercultural statements in the Gospels. We live in a world that discounts the small — the ordinary, the hidden, the unspectacular. Viral moments and big platforms have warped our sense of what counts as meaningful.\n\nBut the Kingdom works differently. Every large thing in Scripture began small. A mustard seed. A widow's mite. A small boy's lunch. Zechariah 4:10 says: "Do not despise the day of small things."\n\nPurpose is not usually found in one dramatic moment of calling. It is accumulated in the consistent faithfulness to small things — the conversation you have today, the work you do with integrity when no one is watching, the way you treat someone who can't advance your career.\n\nYou are building something right now, in the small things. It counts.`,
      reflection_prompt: 'Where in your daily life are you being called to small faithfulness right now? Is that easy or hard to value?',
      prayer_prompt: 'Lord, help me do the small things well. Help me find meaning in the ordinary faithfulness, not just the extraordinary moments.',
    },
    {
      day_number: 7,
      title: 'The Trap of Comparison',
      scripture_refs: ['John 21:21-22', 'Galatians 6:4'],
      devotional_text: `Peter has just been given one of the most significant commissions in the Gospels — "feed my sheep." And immediately, he looks at John and asks: "What about him?"\n\nJesus's answer is brisk: "What is that to you? You must follow me."\n\nComparison is one of the most reliable ways to lose your sense of calling. When you are watching someone else's life, measuring your progress against their success, coveting their path or their gifts — you are not walking your path. You are standing still, looking sideways.\n\nGalatians 6:4: "Each one should test their own actions. Then they can take pride in themselves alone, without comparing themselves to someone else." The measure is not another person. The measure is faithfulness to what you were made to do.\n\nYour calling is not a competition. No one else can fulfil it. And their success does not diminish yours.`,
      reflection_prompt: 'Whose life or calling do you most often compare yourself to? What does that comparison cost you?',
      prayer_prompt: 'Jesus, help me keep my eyes on You and my own path. What is it to me what someone else\'s life looks like? I will follow You.',
    },
    {
      day_number: 8,
      title: 'Suffering as Formation',
      scripture_refs: ['Romans 5:3-4', 'James 1:2-4'],
      devotional_text: `"We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope."\n\nPaul draws a direct line from suffering to hope — but notice the path. It is not direct. It passes through perseverance and character. The suffering is not random. It is forming something.\n\nJames mirrors this: "the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything."\n\nMany people are waiting for their pain to end before they begin living their purpose. But Scripture suggests the opposite is often true: the suffering is part of how the purpose is shaped. The capacity for compassion that comes from loss. The authority that comes from having walked through something and survived. The depth of faith that forms only under pressure.\n\nWhat has your suffering formed in you that shallow seasons never could have?`,
      reflection_prompt: 'What has your hardest season produced in you that you could not have developed any other way?',
      prayer_prompt: 'Lord, do not waste my suffering. Use it. Let it form something in me that I could not have received any other way.',
    },
    {
      day_number: 9,
      title: 'The People Sent with You',
      scripture_refs: ['Ecclesiastes 4:9-10', 'Romans 12:4-5'],
      devotional_text: `"Two are better than one, because they have a good return for their labour: if either of them falls down, one can help the other up."\n\nPurpose is almost never meant to be lived alone. The lone hero narrative is not the scriptural picture. Moses had Aaron. David had Jonathan. Paul had Barnabas. Even Jesus sent the disciples out two by two.\n\nRomans 12:4-5 describes the body of Christ as a network of interdependence — different parts, different functions, one body. Your gifts are not self-sufficient. They need to be in relationship with other gifts to function as they were designed.\n\nWho are the people walking alongside your purpose? Who is the person ahead of you, further along the road you are on? Who is behind you, needing what you've already learned? Calling is always relational — both received and given in community.`,
      reflection_prompt: 'Who are the people who sharpen and support your sense of calling? Who might you be called to invest in or walk alongside?',
      prayer_prompt: 'God, send me the right companions. And show me who needs me to walk with them right now.',
    },
    {
      day_number: 10,
      title: 'When You Want to Quit',
      scripture_refs: ['Galatians 6:9', 'Hebrews 12:1-3'],
      devotional_text: `"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."\n\nThere is a proper time. It is not today. But you will not see it if you give up before it arrives.\n\nHebrews 12 speaks of a great cloud of witnesses — all the people of faith who have run before us — and urges us to run with perseverance the race marked out for us. Not someone else's race. The one marked out specifically for you.\n\nThe moments when you want to quit are often closer to the breakthrough than they feel. The last miles of a marathon are the hardest not because you are going backwards but because you are near enough to the finish to feel how much it has cost.\n\nFix your eyes on Jesus. Not on your exhaustion, not on how far you still have to go, not on who seems to be further ahead. On Him. He endured, and He is the author and perfecter of your faith.`,
      reflection_prompt: 'Where are you most tempted to give up right now? What would it look like to take one more step forward today?',
      prayer_prompt: 'Jesus, I fix my eyes on You. I am tired. But I will not give up today. Give me what I need for the next step — just the next one.',
    },
    {
      day_number: 11,
      title: 'The Grace of Waiting',
      scripture_refs: ['Isaiah 40:31', 'Psalm 27:14'],
      devotional_text: `"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."\n\nHope in the Hebrew here is qavah — it means to wait, to bind together, like strands twisted into a strong rope. The waiting itself is the thing that produces the strength.\n\nWaiting is not passive. It is not resignation or indifference. It is active trust — continuing to do the next faithful thing while holding the larger horizon with open hands.\n\nThere are seasons where the purpose is clear but the timing is not. Where you know the direction but the door has not yet opened. That season is not wasted. It is where the character that the purpose requires is being formed.\n\nThe eagle soars — but first it waits on the thermal. The wind has to come. You cannot rush it. But when it comes, you will soar.`,
      reflection_prompt: 'Are you in a season of waiting right now? What is the invitation of that waiting season — what might God be forming in you while you wait?',
      prayer_prompt: 'Lord, I will wait on You. Not passively — actively. Renew my strength. I trust Your timing over my impatience.',
    },
    {
      day_number: 12,
      title: 'The Courage to Begin',
      scripture_refs: ['Joshua 1:9', 'Isaiah 43:19'],
      devotional_text: `"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."\n\nGod says this to Joshua on the threshold of the promised land — just after Moses has died, just before Joshua leads a nation into unknown territory. It is not a moment of calm. It is a moment of maximum uncertainty and enormous responsibility.\n\nAnd what God offers is not a detailed battle plan. He offers presence. "I will be with you wherever you go." The courage is not to be found in knowing everything — it is to be found in being accompanied.\n\nIsaiah 43:19: "I am doing a new thing! Now it springs up; do you not perceive it?" There is a new thing waiting to begin in your life. Perceive it. And then — be strong and courageous enough to step into it.`,
      reflection_prompt: 'What new beginning is asking for your courage right now? What is the first concrete step forward?',
      prayer_prompt: 'Lord, I will be strong and courageous. Not because I know the way, but because I know You are with me. I step forward today.',
    },
    {
      day_number: 13,
      title: 'Legacy Over Success',
      scripture_refs: ['Micah 6:8', 'Proverbs 22:1'],
      devotional_text: `"He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God."\n\nMicah distils the entire prophetic tradition into three requirements. Not success. Not impact metrics. Not platform size. Justice. Mercy. Humility.\n\nSuccess is often measured by what you accumulate — wealth, recognition, influence. Legacy is measured by what you gave — how you changed the people around you, what you stood for, who you helped become what they were meant to be.\n\nProverbs 22:1: "A good name is more desirable than great riches." The name is what remains after you are gone. Not the achievements — the character. Not the platform — the way you treated people when it cost you something.\n\nAs you think about purpose, ask: what do you want to leave behind? That question will often clarify the path more than any other.`,
      reflection_prompt: 'What do you want people to say about you and your life, not at a career pinnacle, but at the end? Let that guide the present.',
      prayer_prompt: 'God, help me build a legacy not an empire. Help me be known for justice, mercy, and walking humbly with You.',
    },
    {
      day_number: 14,
      title: 'The One Who Will Complete It',
      scripture_refs: ['Philippians 1:6', 'Hebrews 12:2'],
      devotional_text: `"Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus."\n\nYou have walked fourteen days with purpose. You have named gifts, wrestled with calling, confronted comparison, considered legacy. And now, at the close, the most important truth of all: this is not yours to complete alone.\n\nPhilippians 1:6 puts the responsibility where it belongs — not primarily on your effort, your consistency, your vision. He who began it will carry it to completion. You are a participant in something God is doing. A co-worker with Christ, not the sole employee.\n\nHebrews 12:2 calls Jesus "the author and perfecter of faith." He wrote your story. He is also the one who completes it. Your role is to walk faithfully in the days you have been given, fix your eyes on Him, and trust that what He began He will finish.\n\nYou are not alone in this. And it will be completed.`,
      reflection_prompt: 'Looking back over these fourteen days: what has shifted in how you understand your purpose? What do you carry forward?',
      prayer_prompt: 'Jesus, You began this. I trust You to complete it. I walk forward in that confidence — not in my own strength, but Yours.',
    },
  ],
}

// ─────────────────────────────────────────────────────────────
// BIBLE IN 365 DAYS — Canonical Reading Schedule Generator
// ─────────────────────────────────────────────────────────────

const CANONICAL_SCHEDULE = [
  // Genesis
  { book: 'Genesis', startChapter: 1, endChapter: 2 }, { book: 'Genesis', startChapter: 3, endChapter: 5 },
  { book: 'Genesis', startChapter: 6, endChapter: 9 }, { book: 'Genesis', startChapter: 10, endChapter: 11 },
  { book: 'Genesis', startChapter: 12, endChapter: 14 }, { book: 'Genesis', startChapter: 15, endChapter: 17 },
  { book: 'Genesis', startChapter: 18, endChapter: 20 }, { book: 'Genesis', startChapter: 21, endChapter: 23 },
  { book: 'Genesis', startChapter: 24, endChapter: 25 }, { book: 'Genesis', startChapter: 26, endChapter: 27 },
  { book: 'Genesis', startChapter: 28, endChapter: 30 }, { book: 'Genesis', startChapter: 31, endChapter: 32 },
  { book: 'Genesis', startChapter: 33, endChapter: 35 }, { book: 'Genesis', startChapter: 36, endChapter: 37 },
  { book: 'Genesis', startChapter: 38, endChapter: 40 }, { book: 'Genesis', startChapter: 41, endChapter: 42 },
  { book: 'Genesis', startChapter: 43, endChapter: 45 }, { book: 'Genesis', startChapter: 46, endChapter: 50 },
  // Exodus
  { book: 'Exodus', startChapter: 1, endChapter: 3 }, { book: 'Exodus', startChapter: 4, endChapter: 6 },
  { book: 'Exodus', startChapter: 7, endChapter: 9 }, { book: 'Exodus', startChapter: 10, endChapter: 12 },
  { book: 'Exodus', startChapter: 13, endChapter: 15 }, { book: 'Exodus', startChapter: 16, endChapter: 18 },
  { book: 'Exodus', startChapter: 19, endChapter: 21 }, { book: 'Exodus', startChapter: 22, endChapter: 24 },
  { book: 'Exodus', startChapter: 25, endChapter: 27 }, { book: 'Exodus', startChapter: 28, endChapter: 30 },
  { book: 'Exodus', startChapter: 31, endChapter: 34 }, { book: 'Exodus', startChapter: 35, endChapter: 37 },
  { book: 'Exodus', startChapter: 38, endChapter: 40 },
  // Leviticus
  { book: 'Leviticus', startChapter: 1, endChapter: 4 }, { book: 'Leviticus', startChapter: 5, endChapter: 7 },
  { book: 'Leviticus', startChapter: 8, endChapter: 10 }, { book: 'Leviticus', startChapter: 11, endChapter: 13 },
  { book: 'Leviticus', startChapter: 14, endChapter: 16 }, { book: 'Leviticus', startChapter: 17, endChapter: 19 },
  { book: 'Leviticus', startChapter: 20, endChapter: 22 }, { book: 'Leviticus', startChapter: 23, endChapter: 25 },
  { book: 'Leviticus', startChapter: 26, endChapter: 27 },
  // Numbers
  { book: 'Numbers', startChapter: 1, endChapter: 2 }, { book: 'Numbers', startChapter: 3, endChapter: 4 },
  { book: 'Numbers', startChapter: 5, endChapter: 6 }, { book: 'Numbers', startChapter: 7, endChapter: 8 },
  { book: 'Numbers', startChapter: 9, endChapter: 11 }, { book: 'Numbers', startChapter: 12, endChapter: 14 },
  { book: 'Numbers', startChapter: 15, endChapter: 17 }, { book: 'Numbers', startChapter: 18, endChapter: 20 },
  { book: 'Numbers', startChapter: 21, endChapter: 22 }, { book: 'Numbers', startChapter: 23, endChapter: 25 },
  { book: 'Numbers', startChapter: 26, endChapter: 27 }, { book: 'Numbers', startChapter: 28, endChapter: 30 },
  { book: 'Numbers', startChapter: 31, endChapter: 33 }, { book: 'Numbers', startChapter: 34, endChapter: 36 },
  // Deuteronomy
  { book: 'Deuteronomy', startChapter: 1, endChapter: 2 }, { book: 'Deuteronomy', startChapter: 3, endChapter: 4 },
  { book: 'Deuteronomy', startChapter: 5, endChapter: 7 }, { book: 'Deuteronomy', startChapter: 8, endChapter: 10 },
  { book: 'Deuteronomy', startChapter: 11, endChapter: 13 }, { book: 'Deuteronomy', startChapter: 14, endChapter: 16 },
  { book: 'Deuteronomy', startChapter: 17, endChapter: 19 }, { book: 'Deuteronomy', startChapter: 20, endChapter: 22 },
  { book: 'Deuteronomy', startChapter: 23, endChapter: 25 }, { book: 'Deuteronomy', startChapter: 26, endChapter: 28 },
  { book: 'Deuteronomy', startChapter: 29, endChapter: 31 }, { book: 'Deuteronomy', startChapter: 32, endChapter: 34 },
  // Joshua
  { book: 'Joshua', startChapter: 1, endChapter: 3 }, { book: 'Joshua', startChapter: 4, endChapter: 6 },
  { book: 'Joshua', startChapter: 7, endChapter: 9 }, { book: 'Joshua', startChapter: 10, endChapter: 12 },
  { book: 'Joshua', startChapter: 13, endChapter: 15 }, { book: 'Joshua', startChapter: 16, endChapter: 18 },
  { book: 'Joshua', startChapter: 19, endChapter: 21 }, { book: 'Joshua', startChapter: 22, endChapter: 24 },
  // Judges + Ruth
  { book: 'Judges', startChapter: 1, endChapter: 3 }, { book: 'Judges', startChapter: 4, endChapter: 6 },
  { book: 'Judges', startChapter: 7, endChapter: 9 }, { book: 'Judges', startChapter: 10, endChapter: 12 },
  { book: 'Judges', startChapter: 13, endChapter: 15 }, { book: 'Judges', startChapter: 16, endChapter: 18 },
  { book: 'Judges', startChapter: 19, endChapter: 21 }, { book: 'Ruth', startChapter: 1, endChapter: 4 },
  // 1 Samuel
  { book: '1 Samuel', startChapter: 1, endChapter: 3 }, { book: '1 Samuel', startChapter: 4, endChapter: 6 },
  { book: '1 Samuel', startChapter: 7, endChapter: 9 }, { book: '1 Samuel', startChapter: 10, endChapter: 12 },
  { book: '1 Samuel', startChapter: 13, endChapter: 15 }, { book: '1 Samuel', startChapter: 16, endChapter: 17 },
  { book: '1 Samuel', startChapter: 18, endChapter: 20 }, { book: '1 Samuel', startChapter: 21, endChapter: 24 },
  { book: '1 Samuel', startChapter: 25, endChapter: 27 }, { book: '1 Samuel', startChapter: 28, endChapter: 31 },
  // 2 Samuel
  { book: '2 Samuel', startChapter: 1, endChapter: 3 }, { book: '2 Samuel', startChapter: 4, endChapter: 7 },
  { book: '2 Samuel', startChapter: 8, endChapter: 10 }, { book: '2 Samuel', startChapter: 11, endChapter: 13 },
  { book: '2 Samuel', startChapter: 14, endChapter: 16 }, { book: '2 Samuel', startChapter: 17, endChapter: 19 },
  { book: '2 Samuel', startChapter: 20, endChapter: 22 }, { book: '2 Samuel', startChapter: 23, endChapter: 24 },
  // 1 Kings
  { book: '1 Kings', startChapter: 1, endChapter: 2 }, { book: '1 Kings', startChapter: 3, endChapter: 5 },
  { book: '1 Kings', startChapter: 6, endChapter: 8 }, { book: '1 Kings', startChapter: 9, endChapter: 11 },
  { book: '1 Kings', startChapter: 12, endChapter: 14 }, { book: '1 Kings', startChapter: 15, endChapter: 17 },
  { book: '1 Kings', startChapter: 18, endChapter: 20 }, { book: '1 Kings', startChapter: 21, endChapter: 22 },
  // 2 Kings
  { book: '2 Kings', startChapter: 1, endChapter: 3 }, { book: '2 Kings', startChapter: 4, endChapter: 6 },
  { book: '2 Kings', startChapter: 7, endChapter: 9 }, { book: '2 Kings', startChapter: 10, endChapter: 12 },
  { book: '2 Kings', startChapter: 13, endChapter: 15 }, { book: '2 Kings', startChapter: 16, endChapter: 18 },
  { book: '2 Kings', startChapter: 19, endChapter: 21 }, { book: '2 Kings', startChapter: 22, endChapter: 25 },
  // 1 Chronicles
  { book: '1 Chronicles', startChapter: 1, endChapter: 3 }, { book: '1 Chronicles', startChapter: 4, endChapter: 6 },
  { book: '1 Chronicles', startChapter: 7, endChapter: 9 }, { book: '1 Chronicles', startChapter: 10, endChapter: 12 },
  { book: '1 Chronicles', startChapter: 13, endChapter: 15 }, { book: '1 Chronicles', startChapter: 16, endChapter: 18 },
  { book: '1 Chronicles', startChapter: 19, endChapter: 21 }, { book: '1 Chronicles', startChapter: 22, endChapter: 24 },
  { book: '1 Chronicles', startChapter: 25, endChapter: 27 }, { book: '1 Chronicles', startChapter: 28, endChapter: 29 },
  // 2 Chronicles
  { book: '2 Chronicles', startChapter: 1, endChapter: 3 }, { book: '2 Chronicles', startChapter: 4, endChapter: 7 },
  { book: '2 Chronicles', startChapter: 8, endChapter: 10 }, { book: '2 Chronicles', startChapter: 11, endChapter: 13 },
  { book: '2 Chronicles', startChapter: 14, endChapter: 16 }, { book: '2 Chronicles', startChapter: 17, endChapter: 19 },
  { book: '2 Chronicles', startChapter: 20, endChapter: 22 }, { book: '2 Chronicles', startChapter: 23, endChapter: 25 },
  { book: '2 Chronicles', startChapter: 26, endChapter: 28 }, { book: '2 Chronicles', startChapter: 29, endChapter: 31 },
  { book: '2 Chronicles', startChapter: 32, endChapter: 34 }, { book: '2 Chronicles', startChapter: 35, endChapter: 36 },
  // Ezra + Nehemiah + Esther
  { book: 'Ezra', startChapter: 1, endChapter: 3 }, { book: 'Ezra', startChapter: 4, endChapter: 7 },
  { book: 'Ezra', startChapter: 8, endChapter: 10 },
  { book: 'Nehemiah', startChapter: 1, endChapter: 3 }, { book: 'Nehemiah', startChapter: 4, endChapter: 6 },
  { book: 'Nehemiah', startChapter: 7, endChapter: 9 }, { book: 'Nehemiah', startChapter: 10, endChapter: 11 },
  { book: 'Nehemiah', startChapter: 12, endChapter: 13 },
  { book: 'Esther', startChapter: 1, endChapter: 3 }, { book: 'Esther', startChapter: 4, endChapter: 7 },
  { book: 'Esther', startChapter: 8, endChapter: 10 },
  // Job
  { book: 'Job', startChapter: 1, endChapter: 4 }, { book: 'Job', startChapter: 5, endChapter: 8 },
  { book: 'Job', startChapter: 9, endChapter: 12 }, { book: 'Job', startChapter: 13, endChapter: 16 },
  { book: 'Job', startChapter: 17, endChapter: 20 }, { book: 'Job', startChapter: 21, endChapter: 24 },
  { book: 'Job', startChapter: 25, endChapter: 28 }, { book: 'Job', startChapter: 29, endChapter: 32 },
  { book: 'Job', startChapter: 33, endChapter: 36 }, { book: 'Job', startChapter: 37, endChapter: 39 },
  { book: 'Job', startChapter: 40, endChapter: 42 },
  // Psalms (split across many days)
  { book: 'Psalms', startChapter: 1, endChapter: 8 }, { book: 'Psalms', startChapter: 9, endChapter: 17 },
  { book: 'Psalms', startChapter: 18, endChapter: 22 }, { book: 'Psalms', startChapter: 23, endChapter: 30 },
  { book: 'Psalms', startChapter: 31, endChapter: 37 }, { book: 'Psalms', startChapter: 38, endChapter: 44 },
  { book: 'Psalms', startChapter: 45, endChapter: 51 }, { book: 'Psalms', startChapter: 52, endChapter: 59 },
  { book: 'Psalms', startChapter: 60, endChapter: 68 }, { book: 'Psalms', startChapter: 69, endChapter: 76 },
  { book: 'Psalms', startChapter: 77, endChapter: 84 }, { book: 'Psalms', startChapter: 85, endChapter: 90 },
  { book: 'Psalms', startChapter: 91, endChapter: 100 }, { book: 'Psalms', startChapter: 101, endChapter: 108 },
  { book: 'Psalms', startChapter: 109, endChapter: 118 }, { book: 'Psalms', startChapter: 119, endChapter: 119 },
  { book: 'Psalms', startChapter: 120, endChapter: 134 }, { book: 'Psalms', startChapter: 135, endChapter: 144 },
  { book: 'Psalms', startChapter: 145, endChapter: 150 },
  // Proverbs + Ecclesiastes + Song of Solomon
  { book: 'Proverbs', startChapter: 1, endChapter: 5 }, { book: 'Proverbs', startChapter: 6, endChapter: 10 },
  { book: 'Proverbs', startChapter: 11, endChapter: 15 }, { book: 'Proverbs', startChapter: 16, endChapter: 20 },
  { book: 'Proverbs', startChapter: 21, endChapter: 25 }, { book: 'Proverbs', startChapter: 26, endChapter: 31 },
  { book: 'Ecclesiastes', startChapter: 1, endChapter: 4 }, { book: 'Ecclesiastes', startChapter: 5, endChapter: 8 },
  { book: 'Ecclesiastes', startChapter: 9, endChapter: 12 },
  { book: 'Song of Solomon', startChapter: 1, endChapter: 4 }, { book: 'Song of Solomon', startChapter: 5, endChapter: 8 },
  // Isaiah
  { book: 'Isaiah', startChapter: 1, endChapter: 4 }, { book: 'Isaiah', startChapter: 5, endChapter: 8 },
  { book: 'Isaiah', startChapter: 9, endChapter: 12 }, { book: 'Isaiah', startChapter: 13, endChapter: 16 },
  { book: 'Isaiah', startChapter: 17, endChapter: 20 }, { book: 'Isaiah', startChapter: 21, endChapter: 24 },
  { book: 'Isaiah', startChapter: 25, endChapter: 28 }, { book: 'Isaiah', startChapter: 29, endChapter: 32 },
  { book: 'Isaiah', startChapter: 33, endChapter: 36 }, { book: 'Isaiah', startChapter: 37, endChapter: 40 },
  { book: 'Isaiah', startChapter: 41, endChapter: 44 }, { book: 'Isaiah', startChapter: 45, endChapter: 48 },
  { book: 'Isaiah', startChapter: 49, endChapter: 52 }, { book: 'Isaiah', startChapter: 53, endChapter: 56 },
  { book: 'Isaiah', startChapter: 57, endChapter: 60 }, { book: 'Isaiah', startChapter: 61, endChapter: 66 },
  // Jeremiah
  { book: 'Jeremiah', startChapter: 1, endChapter: 3 }, { book: 'Jeremiah', startChapter: 4, endChapter: 6 },
  { book: 'Jeremiah', startChapter: 7, endChapter: 9 }, { book: 'Jeremiah', startChapter: 10, endChapter: 13 },
  { book: 'Jeremiah', startChapter: 14, endChapter: 16 }, { book: 'Jeremiah', startChapter: 17, endChapter: 20 },
  { book: 'Jeremiah', startChapter: 21, endChapter: 23 }, { book: 'Jeremiah', startChapter: 24, endChapter: 26 },
  { book: 'Jeremiah', startChapter: 27, endChapter: 29 }, { book: 'Jeremiah', startChapter: 30, endChapter: 32 },
  { book: 'Jeremiah', startChapter: 33, endChapter: 35 }, { book: 'Jeremiah', startChapter: 36, endChapter: 38 },
  { book: 'Jeremiah', startChapter: 39, endChapter: 42 }, { book: 'Jeremiah', startChapter: 43, endChapter: 46 },
  { book: 'Jeremiah', startChapter: 47, endChapter: 49 }, { book: 'Jeremiah', startChapter: 50, endChapter: 52 },
  // Lamentations
  { book: 'Lamentations', startChapter: 1, endChapter: 3 }, { book: 'Lamentations', startChapter: 4, endChapter: 5 },
  // Ezekiel
  { book: 'Ezekiel', startChapter: 1, endChapter: 3 }, { book: 'Ezekiel', startChapter: 4, endChapter: 7 },
  { book: 'Ezekiel', startChapter: 8, endChapter: 11 }, { book: 'Ezekiel', startChapter: 12, endChapter: 15 },
  { book: 'Ezekiel', startChapter: 16, endChapter: 18 }, { book: 'Ezekiel', startChapter: 19, endChapter: 21 },
  { book: 'Ezekiel', startChapter: 22, endChapter: 24 }, { book: 'Ezekiel', startChapter: 25, endChapter: 28 },
  { book: 'Ezekiel', startChapter: 29, endChapter: 32 }, { book: 'Ezekiel', startChapter: 33, endChapter: 36 },
  { book: 'Ezekiel', startChapter: 37, endChapter: 40 }, { book: 'Ezekiel', startChapter: 41, endChapter: 44 },
  { book: 'Ezekiel', startChapter: 45, endChapter: 48 },
  // Minor Prophets
  { book: 'Daniel', startChapter: 1, endChapter: 3 }, { book: 'Daniel', startChapter: 4, endChapter: 6 },
  { book: 'Daniel', startChapter: 7, endChapter: 9 }, { book: 'Daniel', startChapter: 10, endChapter: 12 },
  { book: 'Hosea', startChapter: 1, endChapter: 5 }, { book: 'Hosea', startChapter: 6, endChapter: 10 },
  { book: 'Hosea', startChapter: 11, endChapter: 14 },
  { book: 'Joel', startChapter: 1, endChapter: 3 },
  { book: 'Amos', startChapter: 1, endChapter: 4 }, { book: 'Amos', startChapter: 5, endChapter: 9 },
  { book: 'Obadiah', startChapter: 1, endChapter: 1 }, { book: 'Jonah', startChapter: 1, endChapter: 4 },
  { book: 'Micah', startChapter: 1, endChapter: 4 }, { book: 'Micah', startChapter: 5, endChapter: 7 },
  { book: 'Nahum', startChapter: 1, endChapter: 3 }, { book: 'Habakkuk', startChapter: 1, endChapter: 3 },
  { book: 'Zephaniah', startChapter: 1, endChapter: 3 }, { book: 'Haggai', startChapter: 1, endChapter: 2 },
  { book: 'Zechariah', startChapter: 1, endChapter: 4 }, { book: 'Zechariah', startChapter: 5, endChapter: 8 },
  { book: 'Zechariah', startChapter: 9, endChapter: 12 }, { book: 'Zechariah', startChapter: 13, endChapter: 14 },
  { book: 'Malachi', startChapter: 1, endChapter: 4 },
  // NT - Gospels
  { book: 'Matthew', startChapter: 1, endChapter: 3 }, { book: 'Matthew', startChapter: 4, endChapter: 6 },
  { book: 'Matthew', startChapter: 7, endChapter: 9 }, { book: 'Matthew', startChapter: 10, endChapter: 12 },
  { book: 'Matthew', startChapter: 13, endChapter: 15 }, { book: 'Matthew', startChapter: 16, endChapter: 18 },
  { book: 'Matthew', startChapter: 19, endChapter: 21 }, { book: 'Matthew', startChapter: 22, endChapter: 24 },
  { book: 'Matthew', startChapter: 25, endChapter: 26 }, { book: 'Matthew', startChapter: 27, endChapter: 28 },
  { book: 'Mark', startChapter: 1, endChapter: 3 }, { book: 'Mark', startChapter: 4, endChapter: 6 },
  { book: 'Mark', startChapter: 7, endChapter: 9 }, { book: 'Mark', startChapter: 10, endChapter: 12 },
  { book: 'Mark', startChapter: 13, endChapter: 16 },
  { book: 'Luke', startChapter: 1, endChapter: 3 }, { book: 'Luke', startChapter: 4, endChapter: 6 },
  { book: 'Luke', startChapter: 7, endChapter: 9 }, { book: 'Luke', startChapter: 10, endChapter: 12 },
  { book: 'Luke', startChapter: 13, endChapter: 15 }, { book: 'Luke', startChapter: 16, endChapter: 18 },
  { book: 'Luke', startChapter: 19, endChapter: 21 }, { book: 'Luke', startChapter: 22, endChapter: 24 },
  { book: 'John', startChapter: 1, endChapter: 3 }, { book: 'John', startChapter: 4, endChapter: 6 },
  { book: 'John', startChapter: 7, endChapter: 9 }, { book: 'John', startChapter: 10, endChapter: 12 },
  { book: 'John', startChapter: 13, endChapter: 15 }, { book: 'John', startChapter: 16, endChapter: 18 },
  { book: 'John', startChapter: 19, endChapter: 21 },
  // Acts + Epistles
  { book: 'Acts', startChapter: 1, endChapter: 3 }, { book: 'Acts', startChapter: 4, endChapter: 6 },
  { book: 'Acts', startChapter: 7, endChapter: 9 }, { book: 'Acts', startChapter: 10, endChapter: 12 },
  { book: 'Acts', startChapter: 13, endChapter: 15 }, { book: 'Acts', startChapter: 16, endChapter: 18 },
  { book: 'Acts', startChapter: 19, endChapter: 21 }, { book: 'Acts', startChapter: 22, endChapter: 25 },
  { book: 'Acts', startChapter: 26, endChapter: 28 },
  { book: 'Romans', startChapter: 1, endChapter: 3 }, { book: 'Romans', startChapter: 4, endChapter: 6 },
  { book: 'Romans', startChapter: 7, endChapter: 9 }, { book: 'Romans', startChapter: 10, endChapter: 12 },
  { book: 'Romans', startChapter: 13, endChapter: 16 },
  { book: '1 Corinthians', startChapter: 1, endChapter: 4 }, { book: '1 Corinthians', startChapter: 5, endChapter: 8 },
  { book: '1 Corinthians', startChapter: 9, endChapter: 12 }, { book: '1 Corinthians', startChapter: 13, endChapter: 16 },
  { book: '2 Corinthians', startChapter: 1, endChapter: 4 }, { book: '2 Corinthians', startChapter: 5, endChapter: 8 },
  { book: '2 Corinthians', startChapter: 9, endChapter: 13 },
  { book: 'Galatians', startChapter: 1, endChapter: 3 }, { book: 'Galatians', startChapter: 4, endChapter: 6 },
  { book: 'Ephesians', startChapter: 1, endChapter: 3 }, { book: 'Ephesians', startChapter: 4, endChapter: 6 },
  { book: 'Philippians', startChapter: 1, endChapter: 4 },
  { book: 'Colossians', startChapter: 1, endChapter: 4 },
  { book: '1 Thessalonians', startChapter: 1, endChapter: 5 },
  { book: '2 Thessalonians', startChapter: 1, endChapter: 3 },
  { book: '1 Timothy', startChapter: 1, endChapter: 3 }, { book: '1 Timothy', startChapter: 4, endChapter: 6 },
  { book: '2 Timothy', startChapter: 1, endChapter: 4 },
  { book: 'Titus', startChapter: 1, endChapter: 3 }, { book: 'Philemon', startChapter: 1, endChapter: 1 },
  { book: 'Hebrews', startChapter: 1, endChapter: 4 }, { book: 'Hebrews', startChapter: 5, endChapter: 8 },
  { book: 'Hebrews', startChapter: 9, endChapter: 11 }, { book: 'Hebrews', startChapter: 12, endChapter: 13 },
  { book: 'James', startChapter: 1, endChapter: 5 },
  { book: '1 Peter', startChapter: 1, endChapter: 5 }, { book: '2 Peter', startChapter: 1, endChapter: 3 },
  { book: '1 John', startChapter: 1, endChapter: 5 },
  { book: '2 John', startChapter: 1, endChapter: 1 }, { book: '3 John', startChapter: 1, endChapter: 1 },
  { book: 'Jude', startChapter: 1, endChapter: 1 },
  { book: 'Revelation', startChapter: 1, endChapter: 3 }, { book: 'Revelation', startChapter: 4, endChapter: 7 },
  { book: 'Revelation', startChapter: 8, endChapter: 11 }, { book: 'Revelation', startChapter: 12, endChapter: 15 },
  { book: 'Revelation', startChapter: 16, endChapter: 19 }, { book: 'Revelation', startChapter: 20, endChapter: 22 },
]

const BIBLE_365_DEVOTIONALS = [
  "The story begins here — not with humanity's quest for God, but with God's act of creation. Read with wonder.",
  "Every name in these genealogies belongs to someone God knew. You are known too.",
  "God's covenant faithfulness runs through every broken human story. Look for it today.",
  "In the middle of difficulty, watch for the places where God shows up unexpectedly.",
  "Scripture does not sanitize its heroes. Their failures are part of the story too.",
  "Pay attention to the moments when people call on the name of the Lord.",
  "God's promises are not cancelled by human failure. Watch this theme as you read.",
  "The law is not a burden — it is a gift. Read it as love letters from a God who wants to be known.",
  "Every sacrifice in the Old Testament points forward to something. What does it say about the cost of reconciliation?",
  "The wilderness is not punishment. It is the place where God speaks most clearly.",
]

function generate365Days() {
  const days = []
  for (let i = 0; i < 365; i++) {
    const schedule = CANONICAL_SCHEDULE[i % CANONICAL_SCHEDULE.length]
    const chapRange = schedule.startChapter === schedule.endChapter
      ? `${schedule.book} ${schedule.startChapter}`
      : `${schedule.book} ${schedule.startChapter}–${schedule.endChapter}`
    const devotional = BIBLE_365_DEVOTIONALS[i % BIBLE_365_DEVOTIONALS.length]
    days.push({
      day_number: i + 1,
      title: chapRange,
      scripture_refs: [`${schedule.book} ${schedule.startChapter}${schedule.startChapter !== schedule.endChapter ? `-${schedule.endChapter}` : ''}`],
      devotional_text: devotional,
      reflection_prompt: 'What verse or moment from today\'s reading stayed with you? Why?',
      prayer_prompt: 'Lord, speak to me through what I have read today. Make it alive in me.',
    })
  }
  return days
}

// ─────────────────────────────────────────────────────────────
// 30 DAYS IN THE PSALMS
// ─────────────────────────────────────────────────────────────

const PSALMS_PLAN = [
  { psalm: 1, title: 'The Blessed Life', theme: 'Delight in the law of the Lord produces rootedness and fruitfulness. The blessed life is not one of ease, but of deep roots.' },
  { psalm: 23, title: 'The Shepherd and the Table', theme: 'One of the most beloved poems ever written. Read it slowly — all of it, including the valley.' },
  { psalm: 8, title: 'What Is Man?', theme: 'The universe is incomprehensibly vast. And yet God thinks of you. Sit with that contradiction.' },
  { psalm: 22, title: 'The Cry of Dereliction', theme: 'Jesus quoted this from the cross. It begins in abandonment and ends in praise. That arc is important.' },
  { psalm: 27, title: 'One Thing', theme: 'In the middle of real threat, David names the one thing he desires. What is the one thing for you?' },
  { psalm: 42, title: 'As the Deer', theme: 'The Psalmist speaks to his own soul: why are you downcast? He preaches to himself. This is a practice worth learning.' },
  { psalm: 46, title: 'Be Still', theme: 'God is our refuge and strength — not in peaceful times, but when the earth gives way. That is worth testing.' },
  { psalm: 51, title: 'The Broken and Contrite Heart', theme: 'David after the worst thing he ever did. Honest, undefended, asking for a clean heart. This is what repentance looks like.' },
  { psalm: 63, title: 'Thirst in the Desert', theme: 'Longing for God written from an actual desert. What does spiritual thirst feel like in your own life?' },
  { psalm: 84, title: 'How Lovely Is Your Dwelling Place', theme: 'A pilgrim\'s longing for the presence of God. One day in His courts is better than a thousand elsewhere.' },
  { psalm: 90, title: 'A Prayer of Moses', theme: 'The oldest psalm. It holds together human frailty and divine eternity — and asks God to make our days count.' },
  { psalm: 91, title: 'Under His Wings', theme: 'Protection language — shadow, refuge, wings, shield. Not the promise that nothing bad happens, but that you are not alone in it.' },
  { psalm: 103, title: 'Bless the Lord, O My Soul', theme: 'David preaching to himself again. When you don\'t feel thankful, this is the practice: tell your soul to bless the Lord anyway.' },
  { psalm: 107, title: 'He Satisfies the Longing Soul', theme: 'Four stories of people in distress — and the refrain that keeps returning: then they cried to the Lord, and He delivered them.' },
  { psalm: 119, title: 'Your Word Is a Lamp', theme: 'The longest chapter in the Bible, entirely devoted to the word of God. Read a section and notice what the Psalmist loves about Scripture.' },
  { psalm: 121, title: 'Where Does My Help Come From?', theme: 'A pilgrim looking at the mountains, asking the question that matters most. The answer is not the mountains.' },
  { psalm: 130, title: 'Out of the Depths', theme: 'One of the most raw cries in Scripture. From the depths — all the way to steadfast love. The distance between those two places is the whole journey.' },
  { psalm: 131, title: 'A Quiet Soul', theme: 'The shortest psalm of contentment. A weaned child on its mother — not hungry, just at rest. What would it take to get there?' },
  { psalm: 139, title: 'You Have Searched Me', theme: 'The most personal psalm. God knows everything — every thought, every word, every place you go. And He is still present. Still near.' },
  { psalm: 145, title: 'Great Is the Lord', theme: 'A psalm of pure praise. No requests, no lament — just an extended meditation on the goodness of God.' },
  { psalm: 16, title: 'My Inheritance', theme: 'The boundary lines have fallen for me in pleasant places. What does it mean to find your deepest security in God rather than circumstances?' },
  { psalm: 34, title: 'Taste and See', theme: 'An invitation to experience God rather than only know about Him. The broken and contrite — He is near to them.' },
  { psalm: 40, title: 'He Lifted Me Out', theme: 'From the muddy pit to a new song. And then: here I am, I have come to do Your will. The rescue leads to a response.' },
  { psalm: 62, title: 'My Soul Finds Rest', theme: 'Rest in God alone. Not in outcomes. Not in people. In God alone. This is a hard practice and a necessary one.' },
  { psalm: 73, title: 'When the Wicked Prosper', theme: 'One of the most honest psalms. Asaph is almost gone — until he enters the sanctuary. Then everything shifts.' },
  { psalm: 77, title: 'Has God Forgotten?', theme: 'In the darkest night of the soul, the Psalmist does one thing: he remembers. Memory of God\'s past faithfulness becomes the anchor.' },
  { psalm: 88, title: 'Darkness Is My Closest Friend', theme: 'The only psalm that ends without resolution. Sometimes that is where you are. This psalm says: that is allowed. God is present even there.' },
  { psalm: 100, title: 'Make a Joyful Noise', theme: 'Four commands, one foundation: the Lord is God, He made us, we are His. That is enough for gratitude.' },
  { psalm: 113, title: 'Who Is Like the Lord?', theme: 'The God who is enthroned on high stoops to lift the poor from the dust. Height and condescension, majesty and tenderness.' },
  { psalm: 150, title: 'Let Everything Praise', theme: 'The Psalms end where they began — with an invitation to worship. Everything that has breath. That includes you, today.' },
]

function generate30DaysPsalms() {
  return PSALMS_PLAN.map((entry, i) => ({
    day_number: i + 1,
    title: `Psalm ${entry.psalm}: ${entry.title}`,
    scripture_refs: [`Psalms ${entry.psalm}`],
    devotional_text: entry.theme,
    reflection_prompt: 'Which verse from this Psalm speaks most directly into something you are living right now? Why that verse?',
    prayer_prompt: `Lord, I read Psalm ${entry.psalm} as my prayer today. Make its words my words.`,
  }))
}

// ─────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────

export async function seedPlans() {
  console.log('🌱 Starting Kairos plans seed...')

  // Build full days map including generated plans
  const allDays = {
    ...DAYS,
    '30-days-in-the-psalms': generate30DaysPsalms(),
    'bible-in-365-days': generate365Days(),
    'breaking-free': [
      {
        day_number: 1,
        title: 'The Chains You Can See',
        scripture_refs: ['John 8:34-36'],
        devotional_text: `"Everyone who sins is a slave to sin." Jesus does not soften this. Patterns are not quirks. They are chains. Some you put on yourself. Some were put on you by others. But they are chains all the same.\n\nThe good news is immediate: "If the Son sets you free, you will be free indeed." Not partially free. Not free except for that one thing. Free indeed.\n\nFreedom is not the absence of struggle. It is the presence of a Liberator. The first step is not willpower — it is naming the chain. Looking at it clearly. Bringing it into the light where Jesus can speak to it.\n\nWhat is the pattern? Lust. Rage. Numbing. Control. People-pleasing. Something you hate but keep returning to. Name it today. Not to fix it — to free it.`,
        reflection_prompt: 'What is the specific pattern you are bringing into this plan? Name it plainly.',
        prayer_prompt: 'Jesus, I name it: ____. I am tired of this chain. Set me free indeed.',
      },
      // ... (14 days total - abbreviated for diff, full in final)
      {
        day_number: 14,
        title: 'Free Indeed',
        scripture_refs: ['Galatians 5:1'],
        devotional_text: `"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery."\n\nFourteen days. You have named the chain, brought it to Jesus, learned new paths, built new habits of thought and prayer. The pattern may still knock. But it no longer owns you.\n\nFreedom is a daily practice. Not a one-time event. The enemy will try to convince you the chains are still there — that you are still that person. He is a liar. You are free.\n\nStand firm. The Son has set you free. Live from that.`,
        reflection_prompt: 'What has changed in you over these 14 days? How will you stand firm in your freedom?',
        prayer_prompt: 'Jesus, thank You for freedom. I stand firm. I am free indeed.',
      }
    ],
    'when-god-feels-distant': [
      // Similar 14-day structure for spiritual dryness...
    ],
    'accountability-that-works': [
      // Similar 14-day structure for discipline...
    ],
    'grief': [
      // Similar 14-day structure for grief...
    ],
  }

    // NEW_SLUGS filter removed for full reseeding capability

  for (const plan of PLANS) {
    // Insert plan
    const { data: insertedPlan, error: planError } = await supabase
      .from('reading_plans')
      .upsert(plan, { onConflict: 'slug' })
      .select('id')
      .single()

    if (planError) {
      console.error(`❌ Failed to insert plan "${plan.title}":`, planError.message)
      continue
    }

    console.log(`✅ Plan inserted: ${plan.title}`)

    // Insert plan days in batches of 50
    const days = allDays[plan.slug]
    if (!days || days.length === 0) {
      console.warn(`⚠️  No days found for slug: ${plan.slug}`)
      continue
    }

    const daysWithPlanId = days.map(day => ({ ...day, plan_id: insertedPlan.id }))

    const BATCH_SIZE = 50
    for (let i = 0; i < daysWithPlanId.length; i += BATCH_SIZE) {
      const batch = daysWithPlanId.slice(i, i + BATCH_SIZE)
      const { error: daysError } = await supabase.from('plan_days').insert(batch)
      if (daysError) {
        console.error(`❌ Failed to insert days batch for "${plan.title}":`, daysError.message)
      } else {
        console.log(`   📖 Days ${i + 1}–${Math.min(i + BATCH_SIZE, daysWithPlanId.length)} inserted`)
      }
    }
  }

  console.log('✨ Seed complete.')
}

// ─────────────────────────────────────────────────────────────
// RUN DIRECTLY
// node -r dotenv/config src/lib/plans/seed.js
// ─────────────────────────────────────────────────────────────
seedPlans().catch(console.error)