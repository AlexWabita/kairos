/**
 * KAIROS — Knowledge Base Seed Route
 * POST /api/admin/seed
 *
 * Populates the Supabase knowledge_base table with curated entries.
 * Each entry is embedded using Gemini and stored with its vector.
 *
 * IMPORTANT: This route is for admin use only during setup.
 * Protect it with SEED_SECRET in production.
 *
 * Run once: POST http://localhost:3000/api/admin/seed
 * with header: Authorization: Bearer <SEED_SECRET>
 */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateEmbedding } from "@/lib/rag/embeddings"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── KNOWLEDGE BASE ENTRIES ────────────────────────────────────
// 113 curated entries across 7 categories:
//   apologetics, pastoral, scripture_context, faq,
//   formation, advanced, + expanded pastoral domains
// Each entry carries tags, audience, mode_affinity, weight
// from migration 007. Older entries (no metadata fields) fall
// back to the backfill defaults applied in that migration.
const KNOWLEDGE_ENTRIES = [

  // ── APOLOGETICS ─────────────────────────────────────────────

  {
    title: "Why does God allow suffering and evil?",
    category: "apologetics",
    scripture_ref: "Romans 8:18, Job 38-42",
    source: "Kairos curated",
    content: `The problem of suffering is the most honest question anyone can bring to faith. There is no answer that makes suffering painless to look at — and any response that pretends otherwise is hollow. The Christian answer is not that God is absent from suffering, but that He entered it. The cross is not God watching from a distance; it is God absorbing the worst of what this world does to people. Suffering exists in a world where genuine freedom was given to created beings — both human and spiritual. A love that cannot be refused is not love. The Christian tradition does not promise that suffering will be explained, but that it will be redeemed. Romans 8:18 speaks of present suffering as not worth comparing to what is coming — not as dismissal, but as horizon. Job never received an explanation for his suffering; he received a presence. That is often what people need most — not an answer, but a God who shows up.`,
  },

  {
    title: "Is the Bible reliable and historically accurate?",
    category: "apologetics",
    scripture_ref: "2 Timothy 3:16, Luke 1:1-4",
    source: "Kairos curated",
    content: `The Bible is the most scrutinised document in human history — and it has survived that scrutiny remarkably well. The New Testament is supported by over 5,800 Greek manuscripts, far more than any other ancient text. Historians like Luke wrote with explicit care for accuracy, interviewing eyewitnesses. Archaeological discoveries have consistently confirmed details once doubted — the Pool of Siloam, the existence of Pontius Pilate, the city of Jericho. The Dead Sea Scrolls confirmed that the Old Testament text we have today is essentially identical to manuscripts from over 2,000 years ago. The Bible does not claim to be a science textbook or a history in the modern academic sense — it claims to be the revelation of God's character and purposes through real human history. Its unity across 66 books, 40 authors, and 1,500 years is itself a remarkable thing.`,
  },

  {
    title: "Why are there so many religions if God is real?",
    category: "apologetics",
    scripture_ref: "Acts 17:22-28, Romans 1:19-20",
    source: "Kairos curated",
    content: `The diversity of religions is often raised as evidence against God — but it can be read differently. Every human culture, across every century, with no contact with one another, reached independently toward something beyond themselves. This near-universal impulse toward transcendence is harder to explain if the idea of God is purely invented. The disagreements between religions are largely about who God is and how to reach Him — not really about whether something is there at all. Paul in Athens did not dismiss the Athenians' religiosity; he said God had placed an awareness of Himself in all people. Christianity does not claim that all religions are wrong about everything — it claims that Jesus is the clearest, fullest revelation of who God actually is. The question is not whether to seek — every culture has sought — but whether Jesus is the answer to what all that seeking has been reaching toward.`,
  },

  {
    title: "Did Jesus actually exist historically?",
    category: "apologetics",
    scripture_ref: "1 Corinthians 15:3-8",
    source: "Kairos curated",
    content: `The historical existence of Jesus is one of the most well-attested facts of ancient history. Even scholars who do not accept His divinity affirm His existence. Roman historian Tacitus, writing around 116 AD, referenced Christ's execution under Pontius Pilate. Jewish historian Josephus mentioned Jesus twice. The letters of Paul — written within 20 years of the crucifixion — contain early creedal material that historians date to within 3-5 years of the resurrection. The question historians debate is not whether Jesus lived and died, but what to make of the resurrection. The disciples' willingness to die for their testimony — not for a belief but for a specific claimed event they said they witnessed — is one of the most difficult facts for purely naturalistic explanations to account for.`,
  },

  {
    title: "Why does God send people to hell?",
    category: "apologetics",
    scripture_ref: "John 3:17, 2 Peter 3:9, Revelation 20:15",
    source: "Kairos curated",
    content: `Hell is one of the hardest doctrines in Christianity — and anyone who presents it without discomfort probably has not thought about it seriously. A few things are worth holding: First, the biblical picture of hell is primarily separation from God — not a torture chamber God gleefully operates. Second, the same God who allows hell sent His Son to prevent people from going there. John 3:17 says God did not send the Son to condemn, but to save. The offer is genuine and universal. Third, if human freedom is real — if love cannot be forced — then God ultimately honours the choice of those who reject Him, even to the end. C.S. Lewis put it plainly: the gates of hell are locked from the inside. The Christian answer is not that God eagerly condemns, but that He has done everything possible to make another way — and that way is the cross.`,
  },

  {
    title: "How can Christianity be true if Christians are hypocrites?",
    category: "apologetics",
    scripture_ref: "Matthew 23:1-3, Romans 3:23",
    source: "Kairos curated",
    content: `Hypocrisy in the church is real, it causes real harm, and it should be named clearly rather than defended. Jesus Himself was the sharpest critic of religious hypocrisy — Matthew 23 contains His most devastating words, and they were aimed at the religious leaders of His day. The existence of hypocrites in the church says something true about human nature — that religious structures attract people who want power and respectability — but it does not settle the question of whether Jesus is who He claimed to be. The standard Christianity points to is Christ, not Christians. Every generation of believers has failed to live up to that standard. That failure is not evidence that Christianity is false — it is evidence for what Christianity has always said: that all people, including the religious, are broken and in need of grace.`,
  },

  {
    title: "Does evolution contradict the Bible and Christian faith?",
    category: "apologetics",
    scripture_ref: "Genesis 1:1, Psalm 19:1-4, John 1:3",
    source: "Kairos curated",
    content: `The relationship between evolution and Christian faith is genuinely complex, and Christians hold a range of thoughtful positions. The tension often lives not in the facts themselves, but in the lenses through which we read Genesis. When Genesis is read as a scientific account competing with biology, the conflict appears sharp. When it is read as theological poetry — answering why creation exists and who it belongs to, rather than how it unfolded mechanically — the conflict softens considerably. Many serious Christians, including scientists, hold that evolutionary processes can be the mechanism through which God created. Others hold to a more literal reading. What Christianity requires is not a particular view of the mechanism of creation, but a belief in the Creator. Science asks how; Genesis asks why and who. These are not the same question.`,
  },

  {
    title: "Why does God seem silent when I pray?",
    category: "apologetics",
    scripture_ref: "Psalm 22:1-2, Isaiah 55:8-9, Hebrews 11:1",
    source: "Kairos curated",
    content: `The silence of God is one of the most honest complaints in scripture — Psalm 22 opens with "My God, my God, why have you forsaken me?" and Jesus quoted it from the cross. The experience of God's silence is not a sign of weak faith; it is part of the biblical record of what it means to seek God seriously. A few things are worth sitting with: God's silence is not the same as God's absence. His ways are described in Isaiah as higher than human ways — not as a dismissal but as a genuine acknowledgment that His perspective and timing exceed ours. Faith, by its very nature, operates in the space where certainty is not yet given. The saints who trusted most deeply often describe seasons of profound silence. The invitation is not to manufacture certainty, but to remain in the relationship through the silence — which is itself a profound act of trust.`,
  },

  {
    title: "Is Jesus the only way to God?",
    category: "apologetics",
    scripture_ref: "John 14:6, Acts 4:12, 1 Timothy 2:5",
    source: "Kairos curated",
    content: `This is one of Christianity's most exclusive claims and one of its hardest to hold in a pluralistic world. Jesus said plainly in John 14:6 that He is the way, the truth, and the life, and that no one comes to the Father except through Him. This is not a claim the church invented — it comes directly from Jesus. The honest response to this claim is not to soften it into meaninglessness, but to examine the person making it. If Jesus is who He claimed to be — God in human form, risen from the dead — then the claim carries the weight of the universe behind it. If He is not, then nothing else He said matters either. Christianity does not ask people to accept exclusivity as a doctrine first; it asks them to look at Jesus first. The exclusivity follows from who He is, not from institutional arrogance.`,
  },

  {
    title: "What is the resurrection and why does it matter?",
    category: "apologetics",
    scripture_ref: "1 Corinthians 15:14-19, Luke 24:1-12",
    source: "Kairos curated",
    content: `Paul said it plainly: if Christ has not been raised, faith is futile and Christians are to be pitied above all people. The resurrection is not a peripheral doctrine — it is the hinge on which everything turns. The early disciples did not preach a set of ethical teachings; they preached a specific event. The empty tomb was not explained away by the authorities — they claimed the body was stolen, which concedes it was gone. The post-resurrection appearances were to hundreds of people, including to Paul himself who had been an active persecutor of the church. The transformation of the disciples from hiding in fear to preaching publicly at risk of death is one of history's most dramatic reversals. The resurrection means death is not the final word — for Jesus or for anyone who is in Him. It is the foundation of Christian hope, not its wishful conclusion.`,
  },

  // ── APOLOGETICS — FAQ (from reference images) ───────────────

  {
    title: "If God exists, why isn't His exact identity more obvious?",
    category: "apologetics",
    scripture_ref: "Luke 16:31, Romans 1:19-20",
    source: "Kairos curated — FAQ reference",
    content: `That God exists is a fact most people have agreed on throughout history. It is the exact identity of God that causes disagreement. Perhaps God's identity is more obvious than we think. Jesus told a parable about a man who died and went to Hades. The condemned man insinuated to Father Abraham that God's identity was not as obvious as it should have been — otherwise he wouldn't have ended up there. He begged Abraham to send someone from the dead to warn his brothers. Abraham responded that if they don't listen to Moses and the prophets, they will not be persuaded even if someone rises from the dead. God has made His identity clear. Our problem is that we are like children who cover their ears and shout. In our sinfulness we are not eager to learn truth about God because it costs us some of the things we love best — our independence, our opinions, our sinful ways. Sinful humanity cannot bear very much reality about God. The clarity is there. The willingness to look is the question.`,
  },

  {
    title: "Has science proven there is no God?",
    category: "apologetics",
    scripture_ref: "Genesis 1:1, Psalm 19:1-4, John 1:3",
    source: "Kairos curated — FAQ reference",
    content: `The existence of an immaterial and eternal God is beyond the purview of science, which studies material reality and the laws and forces that help explain the structure and function of the universe. Science cannot prove or disprove God — that is not a failure of science, it is simply outside its domain. But science has its roots in biblical teachings. The Bible says God created humanity in His image — one implication is that our minds are ready-made for understanding the world if we will bother to investigate it. God commanded humanity to be fruitful and subdue the earth — a call to stewardship that requires observing the law-like regularities and exquisite complexities in nature. It is no accident that many of the pioneers of science held a biblical worldview that expects the orderly, law-like phenomena that enable life to flourish. Science and faith are not at war. They are answering different questions with different tools.`,
  },

  {
    title: "Has science proven miracles are impossible?",
    category: "apologetics",
    scripture_ref: "Exodus 14:21, Matthew 14:25-27",
    source: "Kairos curated — FAQ reference",
    content: `The idea that science has proven the impossibility of miracles stems from a faulty understanding of the relationship between God and science. This mistaken view — held by Christians and agnostics alike — gives the laws of nature a status they don't have in reality. The biblical understanding is that phenomena that function in a law-like manner all owe their being to God moment by moment. A meteorologist might well have given a thorough scientific explanation of the parting of the Red Sea. The Bible itself hints at that possibility — the Lord drove the sea back with a powerful east wind all that night and turned the sea into dry land. In that case the miracle was not that a scientific explanation was lacking. It was the timing — the Israelites being at the edge of the sea precisely when the east wind dried it up. God is not beholden to scientific law. Scientific law is our attempt to make sense of what God is doing all the time. Miracles are not violations of nature — they are God acting with intentionality in time.`,
  },

  {
    title: "If God is good, why does He allow evil to exist?",
    category: "apologetics",
    scripture_ref: "Matthew 19:26, Habakkuk 1:13, Genesis 50:15-21, Romans 5:6-11",
    source: "Kairos curated — FAQ reference",
    content: `Scripture affirms God's unlimited power, His perfect goodness, and the reality of evil — and does not resolve the tension cheaply. God doesn't give a comprehensive account of why He allows evil. But for those who follow the evidence carefully, God sets forth a pattern: where He allows evil, He turns it toward a greater good. The greatest example of this pattern is the death of Jesus — through whom God's enemies are made His children. The cross is not God failing to prevent evil; it is God absorbing evil in order to redeem it. This does not make evil acceptable or minimise its horror. It means that evil does not have the final word. The biblical response to evil is not explanation — it is redemption. God enters the worst of what this world produces and transforms it. That is not a comfortable answer, but it is a true one, and it is the only answer that takes evil seriously enough without surrendering to despair.`,
  },

  {
    title: "How important is it to believe the right things about God?",
    category: "apologetics",
    scripture_ref: "Mark 8:36-37, John 17:3",
    source: "Kairos curated — FAQ reference",
    content: `When you board a jet, you do so because you believe it is airworthy and will get you to your destination safely. If you did not believe that, you would not board. If your belief in the jet's safety were mistaken, you would want someone to tell you so. Our beliefs about the jet and the reality about the jet are not necessarily in agreement — and clearly it matters that they line up. How much more is at stake when it comes to beliefs about God. God is our maker and judge. If what you believe about God turns out to be false, you have staked everything on a faulty foundation. This is not an argument for rigid dogmatism — it is an argument for honest inquiry. The stakes of getting God wrong are higher than almost any other question we face. That is not a reason for fear; it is a reason to take the question seriously and to pursue it with everything you have.`,
  },

  {
    title: "Am I at odds with God? What exactly is sin?",
    category: "apologetics",
    scripture_ref: "Romans 3:10-18, 1 John 1:8-10",
    source: "Kairos curated — FAQ reference",
    content: `Human beings are naturally at odds with God, and this aversion may be hidden by a veneer of respectability — but given the right circumstances it becomes evident in each of us. Sin is not primarily a list of prohibited behaviours. Sin is a refusal to live humbly under God's reign and acknowledge our obligations to Him. It is the fundamental posture of independence — living as though we are the centre of our own universe rather than as creatures in relationship with our Creator. The philosopher Sartre, as a schoolboy, burned a small rug and felt — in his own words — the gaze of God. He fell into a rage against God. By Sartre's account, "He never looked at me again." In reality, it was Sartre who never looked at God again. That story captures something true about all of us. We are all guilty of this turning away — and we all need the forgiveness that comes from returning.`,
  },

  {
    title: "What is the reason anyone is sent to hell?",
    category: "apologetics",
    scripture_ref: "Psalm 97:2, Colossians 2:14, Romans 5:6-11",
    source: "Kairos curated — FAQ reference",
    content: `Sin violates God's law, which expresses His righteous character. Sin involves rebellion against the Creator-King whose throne is founded on righteousness and justice. Sin incurs a debt of guilt and punishment. The crucifixion of the innocent and eternal God-Man, Jesus Christ, is the only possible satisfaction of divine justice — but it is only for those who attach themselves to Christ by faith. Others must endure their own punishment for their offenses against the infinite and holy God. This is not a doctrine to be held lightly or with any satisfaction. It is one of the hardest realities in scripture. It is also what makes the gospel genuinely good news — not good advice, not helpful suggestions, but rescue from a real danger. The cross only makes sense in light of what it rescues us from. And 2 Peter 3:9 makes clear that God is not willing that any should perish — He is patient, holding the door open.`,
  },

  {
    title: "How can God send sincere people of other faiths to hell?",
    category: "apologetics",
    scripture_ref: "Deuteronomy 6:4, Acts 4:12, John 14:6",
    source: "Kairos curated — FAQ reference",
    content: `Only one God is the Creator and Ruler of all. Sin violates His laws, summarised as love the Lord your God with all your heart, soul, and strength. Such love has no room for other gods. Worship of false gods — no matter how devout the worship — involves rebellion against the true God who provided salvation only through His Son. Imagine the pain and offense your parents would feel if you identified someone else as your father and mother. In a similar way, it is painful and offensive to God when we misidentify Him, saying things of Him that are not true and which conflict with His eternal nature. This is one of Christianity's most difficult claims, and it should be held with genuine humility and grief — not triumphalism. The response to it is not to soften the claim, but to recognise that it makes the urgent sharing of the genuine gospel not a burden but an act of love toward people we care about.`,
  },

  {
    title: "Why can't God simply annihilate those who die in unbelief?",
    category: "apologetics",
    scripture_ref: "Matthew 25:46, Luke 12:4-5, John 5:28-29, Revelation 9:5-6",
    source: "Kairos curated — FAQ reference",
    content: `Scripture says God is both perfectly just and loving, and that the penalty for living in rebellion against God is eternal punishment. Annihilation would not satisfy God's perfect justice because the offense of our sins is infinite — committed against an infinite and holy God. Just as the reward for faith-righteousness through Christ is eternal fellowship with God, the penalty for rebellion against Him is eternal ruin and separation from God. This doctrine is not one that any honest person holds with comfort. It should produce urgency — urgency in receiving the grace that is offered, and urgency in extending it to others. The weight of eternity is precisely why the gospel matters so profoundly. God does not delight in the death of the wicked — Ezekiel 33:11 records Him saying so plainly. He takes no pleasure in judgment. That He permits it is the measure of how seriously He takes human freedom and the reality of moral choice.`,
  },

  {
    title: "If there is one God, why are there so many religions?",
    category: "apologetics",
    scripture_ref: "Romans 1:18-23, Acts 17:22-28",
    source: "Kairos curated — FAQ reference",
    content: `God has made Himself known to everyone through creation and the conscience. This knowledge has not been well received by human beings. Rather than acknowledging who God is and being grateful, we have suppressed this original knowledge. The result is a darkening of the mind. People create gods they prefer rather than worshipping God as He is. Given the diversity of people and cultures, it is no surprise that a variety of religions has emerged — each one a variation on the human attempt to reach toward something transcendent, shaped by local culture, history, and the particular ways in which people have suppressed or distorted the original revelation. This is not a counsel of despair about other religions — many contain genuine fragments of truth. But it is an honest account of why the picture is fragmented. The Christian claim is that in Jesus, the fragmented picture finds its complete form. Not because Christians are wiser, but because God chose to make Himself fully known in a person.`,
  },

  // ── PASTORAL ─────────────────────────────────────────────────

  {
    title: "Grief — responding to loss and bereavement",
    category: "pastoral",
    scripture_ref: "John 11:35, Psalm 34:18, Romans 8:38-39",
    source: "Kairos curated",
    content: `Grief is not something to be fixed or resolved quickly — it is the price of love, and it deserves to be honoured. The shortest verse in the Bible is "Jesus wept" — at the tomb of Lazarus, even knowing He was about to raise him. This matters: God does not stand above grief and dispense comfort from a distance. He enters it. The right response to someone who is grieving is almost never information or scripture in the first moment — it is presence. Sitting with someone in their pain without rushing to explain or comfort is one of the most profound things a person can do. Grief has no timeline. The expectation that people should "be over it" after a certain period causes enormous secondary harm. Psalm 34:18 says God is close to the brokenhearted — close, not watching from a distance. The invitation in grief is not to stop feeling it but to bring it to God exactly as it is.`,
  },

  {
    title: "Addiction and recovery — a pastoral response",
    category: "pastoral",
    scripture_ref: "Romans 7:15-25, 2 Corinthians 12:9, Galatians 5:1",
    source: "Kairos curated",
    content: `Addiction is one of the places where the gap between what a person wants to do and what they actually do is most painfully visible. Paul described this very experience in Romans 7 — doing the thing he hated, unable to do the thing he wanted. That description resonates across centuries because it is profoundly human. Shame is one of addiction's most powerful fuel sources — and shame-based responses to addiction have caused enormous harm in religious communities. The response that actually helps is rarely condemnation — it is honest presence, consistent relationship, and practical support for recovery. Addiction involves real changes in brain chemistry and real spiritual bondage, often both simultaneously. Recovery is rarely linear. Relapse is part of the process for many people, not evidence of failure or lack of faith. Community — real, non-judgmental community — is one of the strongest protective factors in recovery.`,
  },

  {
    title: "Church hurt and spiritual abuse — a pastoral response",
    category: "pastoral",
    scripture_ref: "Ezekiel 34:1-10, Matthew 18:6, Luke 4:18",
    source: "Kairos curated",
    content: `Church hurt is real, it causes deep harm, and it should never be minimised or explained away. People who have been wounded by religious communities — by leaders who abused power, by communities that rejected them, by theology weaponised against them — carry genuine trauma. The first and most important response is to believe them and acknowledge that what happened to them was wrong. God Himself speaks with remarkable severity about leaders who harm the sheep entrusted to them — Ezekiel 34 is one of scripture's most searing passages, directed at shepherds who exploit rather than protect. The distinction between Christ and the people who claim to represent Him is not a deflection — it is a genuine and important one. But it should only be offered after someone feels fully heard and believed. Many people's faith can be separated from their experience of a particular community. Many others need significant time and distance before that separation is possible.`,
  },

  {
    title: "Anxiety and fear — a pastoral and spiritual response",
    category: "pastoral",
    scripture_ref: "Philippians 4:6-7, Matthew 6:25-34, Psalm 46:1-2",
    source: "Kairos curated",
    content: `Anxiety is one of the most common experiences people bring to conversations about faith, and it is important to respond to it with both pastoral care and honesty about its complexity. Anxiety is not a moral failing or a sign of weak faith — it is a human experience with both psychological and spiritual dimensions. The biblical instruction to "be anxious for nothing" in Philippians 4 is not a command to simply stop feeling anxious; it is followed immediately by a practice — bring everything to God in prayer, with thanksgiving, and the peace of God will guard your heart. This is a relational practice, not a willpower exercise. At the same time, anxiety that is severe, persistent, or debilitating may also need professional support. Faith and therapy are not opposites. Encouraging someone to seek professional help is not a failure of faith — it is wisdom.`,
  },

  {
    title: "Depression and darkness of soul — a pastoral response",
    category: "pastoral",
    scripture_ref: "Psalm 88, 1 Kings 19:3-8, Lamentations 3:1-23",
    source: "Kairos curated",
    content: `Depression is not the same as sadness, and it is not a sign of spiritual failure. Some of the most faithful people in scripture experienced profound darkness — Elijah asked God to take his life under a broom tree; Jeremiah cursed the day he was born; Psalm 88 ends without resolution, in darkness. These are not exceptions in the Bible — they are part of its honest witness to human experience. The first response to someone describing depression is to take it seriously, not to offer quick spiritual remedies. Clinical depression involves real neurological processes that spiritual disciplines alone may not address. Encouraging someone to seek professional support alongside spiritual care is not faithlessness — it is wisdom and love. What faith offers in depression is not an immediate fix but a companion in the darkness and a horizon beyond it — Lamentations 3 moves from utter despair to "great is your faithfulness" within a few verses, not because the pain disappeared but because something steadier was found beneath it.`,
  },

  {
    title: "Doubt — when faith feels impossible",
    category: "pastoral",
    scripture_ref: "Mark 9:24, John 20:24-29, Jude 1:22",
    source: "Kairos curated",
    content: `Doubt is not the opposite of faith — it is often the beginning of a deeper faith. The man in Mark 9 cried out "I believe — help my unbelief" and Jesus responded with a miracle, not a lecture. Thomas required evidence and received it; Jesus did not condemn him for that. Jude tells the church to be merciful to those who doubt. The history of Christian faith is full of people who wrestled with profound uncertainty — including many of its greatest thinkers and most faithful servants. The most dangerous thing to tell someone who is doubting is that they should not be. Doubt that is suppressed does not disappear — it goes underground and does more damage there. Doubt that is brought into honest conversation can become the ground for a faith that is genuinely owned rather than merely inherited. The invitation is not to have no questions, but to bring the questions to God rather than away from Him.`,
  },

  {
    title: "Shame — the difference between shame and guilt",
    category: "pastoral",
    scripture_ref: "Romans 8:1, Psalm 34:5, Isaiah 61:7",
    source: "Kairos curated",
    content: `Shame and guilt are not the same thing, and the distinction matters enormously for how people experience faith and recovery. Guilt says "I did something wrong." Shame says "I am something wrong." Guilt can lead to repentance and restoration. Shame tends to drive people into hiding and isolation — the very conditions that prevent healing. Many people who have been harmed by religious communities carry not guilt but shame — a deep sense that they are fundamentally unacceptable, damaged, or beyond redemption. The gospel is specifically addressed to this condition. Romans 8:1 declares no condemnation for those in Christ — not "no condemnation if you perform well enough," but a declaration about identity. The movement of the gospel is always from shame to dignity, from hiding to belonging, from "I am unworthy" to "I am beloved." This is not a self-help message — it is a specific claim about what God has done in Christ.`,
  },

  {
    title: "Loneliness and the search for belonging",
    category: "pastoral",
    scripture_ref: "Genesis 2:18, Psalm 68:6, John 15:15",
    source: "Kairos curated",
    content: `Loneliness is one of the most pervasive experiences of modern life, and it is one that the Bible takes seriously from its earliest pages. The first thing declared "not good" in creation was that the human being was alone — before any moral failure, in a perfect garden, in the presence of God. This is a striking acknowledgment: divine presence does not automatically resolve the human need for human connection. God's response was not to tell Adam to pray more — it was to give him another person. The longing for belonging is not weakness; it is how human beings were made. Jesus described His disciples not as servants but as friends — a word that carries intimacy and mutual knowing. The church, at its best, is meant to be the community that meets this longing. When it fails to be that — when it is cold, performance-based, or unwelcoming — it causes harm that goes very deep. Real belonging requires being known and accepted as one actually is.`,
  },

  {
    title: "Forgiveness — when it feels impossible",
    category: "pastoral",
    scripture_ref: "Matthew 18:21-22, Ephesians 4:32, Luke 23:34",
    source: "Kairos curated",
    content: `Forgiveness is one of the most misunderstood concepts in Christian life, and the misunderstanding causes real harm. Forgiveness is not the same as reconciliation. Forgiveness does not mean pretending the harm did not happen, or that it was not serious, or that the relationship must be restored. Forgiveness is the internal release of the debt someone owes you — a decision to stop requiring payment for what was done. It is primarily for the person who was harmed, not for the person who caused the harm. Reconciliation, where it is safe and possible, is a separate step that requires genuine repentance from the one who caused harm. Telling a victim of serious abuse that they must reconcile with their abuser in the name of forgiveness is a profound misapplication of scripture. Forgiveness can begin before the other person has changed. It is a process, not a single moment, and it often needs to happen multiple times for the same wound.`,
  },

  {
    title: "Divorce and relationship breakdown — a pastoral response",
    category: "pastoral",
    scripture_ref: "Malachi 2:16, Matthew 19:8, 1 Corinthians 7:15",
    source: "Kairos curated",
    content: `Divorce is one of the areas where the church has most consistently added pain to people who are already in profound pain. The harm caused by handling divorce poorly — with condemnation, exclusion, or rigid rule-application without pastoral wisdom — has driven many people permanently from faith communities. The biblical texts on divorce are more complex and contextual than they are often presented. Jesus' words in Matthew 19 were addressed to a specific question about a specific practice of easy divorce that left women destitute. The pastoral response to someone whose marriage has ended must begin with compassion, not with a verdict. Many marriages end because of abuse, abandonment, addiction, or profound incompatibility — not simple selfishness. People who have been through divorce carry grief, shame, and often profound failure — whether or not they were the one who initiated it. They need presence and grace, not a tribunal.`,
  },

  // ── PASTORAL — Where to Turn (from reference images) ────────

  {
    title:        "When you feel discouraged and nothing seems to be going right",
    category:     "pastoral",
    scripture_ref: "2 Corinthians 1:3-11, Psalm 37:1-4",
    source:       "Kairos curated — Where to Turn reference",
    content: `Discouragement is one of the most common and most draining experiences of the spiritual life. It is the slow erosion of hope — not a single blow but the accumulation of setbacks, delays, and disappointments that make continuing feel pointless. Paul wrote 2 Corinthians from within his own suffering — he described being under pressure far beyond his ability to endure, to the point of despairing of life itself. But he also described the God who raises the dead — who specialises in situations beyond human capacity. Psalm 37 is a long, patient meditation on what to do when life seems unfair and the wicked seem to prosper — it returns again and again to trust, delight, commit, rest, wait. These are not passive instructions. They are active postures of the heart that reorient us toward God's perspective rather than our own limited view. Discouragement often tells us the truth about our own limits — but lies about whether God's limits are the same.`,
  },

  {
    title:        "When you need forgiveness and are weighed down by what you have done",
    category:     "pastoral",
    scripture_ref: "Psalm 51, 1 John 1:8-10",
    source:       "Kairos curated — Where to Turn reference",
    content: `Psalm 51 is David's prayer after his gravest moral failure — adultery, deception, and the arranged killing of an innocent man. It is one of the most honest prayers in all of scripture. What is remarkable about it is where it goes: not into minimising, not into despair, but into the full weight of what happened followed by a request for the full weight of God's mercy. "Have mercy on me, O God, according to your steadfast love; according to your abundant mercy blot out my transgressions." The prayer does not flinch at what was done. Neither does God. 1 John 1:9 makes the mechanics simple: if we confess our sins, He is faithful and just to forgive them and to cleanse us from all unrighteousness. Not some. All. The gospel is not a second chance — it is a new life. Forgiveness in Christ is not reluctant; it is the very reason the cross happened.`,
  },

  {
    title:        "When you are afraid and facing danger",
    category:     "pastoral",
    scripture_ref: "Psalm 27, Acts 27:13-26",
    source:       "Kairos curated — Where to Turn reference",
    content: `Fear is one of the most honest human responses to a dangerous world — and the Bible never mocks it or tells people to simply stop feeling it. Psalm 27 opens with a declaration — "The Lord is my light and my salvation — whom shall I fear?" — but David was not speaking from a safe and comfortable life. He was surrounded by enemies who wanted to destroy him. The declaration is not the absence of threat; it is the presence of God in the middle of it. Paul's experience in Acts 27 — shipwrecked in a violent storm — is one of the most vivid accounts of physical danger in the New Testament. An angel appeared to him not to remove the danger but to promise presence and outcome within it. Fear is not the opposite of faith. Bringing fear to God honestly — not pretending it is not there — is itself an act of trust. What does the Lord mean when He says "Fear not" so often in scripture? Not that danger is unreal, but that He is more real than the danger.`,
  },

  {
    title:        "When you are tired, exhausted, and running on empty",
    category:     "pastoral",
    scripture_ref: "Psalm 127:1-2, Matthew 11:28-30",
    source:       "Kairos curated — Where to Turn reference",
    content: `Exhaustion is not a spiritual failure. Even Elijah — immediately after one of the greatest demonstrations of divine power in the Old Testament — lay down under a tree and asked God to take his life. He was done. God's response was not a rebuke or a theology lecture. An angel touched him and said "Get up and eat — the journey is too much for you." God fed him and let him sleep. Twice. The rest and nourishment came before the mission continued. Psalm 127 is honest about human limits — "It is in vain that you rise up early and go late to rest, eating the bread of anxious toil." There is a rest that is a gift, not a reward. Jesus' invitation in Matthew 11 is to those who are weary and burdened — "Come to me, and I will give you rest." The rest He offers is not the absence of work but the presence of a yoke that fits — partnered with One whose strength never runs out.`,
  },

  {
    title:        "When someone has betrayed you or friends have let you down",
    category:     "pastoral",
    scripture_ref: "Psalm 55, Colossians 3:13",
    source:       "Kairos curated — Where to Turn reference",
    content: `Psalm 55 is David writing about betrayal by a close friend — not an enemy, which would have been easier to bear. "If an enemy were insulting me, I could endure it... But it is you, a man like myself, my companion, my close friend." The specific pain of betrayal by someone trusted is one of the most destabilising human experiences. It shakes not just a relationship but the capacity to trust. The Psalms do not rush past this pain. They sit in it, name it, and bring it honestly to God. Colossians 3 eventually speaks of bearing with one another and forgiving as God has forgiven — but that is not a first response. The first response to betrayal is to bring the wound honestly before God, to let the grief be real, and not to perform a forgiveness that has not yet been processed. What God gives in these moments is not an immediate resolution but a steady companionship through the disorientation.`,
  },

  {
    title:        "When your past haunts you and you cannot seem to move forward",
    category:     "pastoral",
    scripture_ref: "Colossians 1:21-22, Isaiah 43:18-19",
    source:       "Kairos curated — Where to Turn reference",
    content: `The past has enormous power over the present — and spiritual communities do not always handle this well. Sometimes the message is "just give it to God" in a way that minimises how deeply the past can be embedded in a person's sense of self, their patterns of relating, and even their neurology. Colossians 1:21-22 speaks of people who were once alienated and enemies in their minds — and who have now been reconciled and presented holy and blameless. The past is real. The transformation is also real. But the work of moving from one to the other is rarely simple or immediate. Isaiah 43 contains one of the most striking instructions in all of scripture: "Forget the former things; do not dwell on the past. See, I am doing a new thing." The invitation is not to pretend the past did not happen — it is to fix the gaze on what God is doing now and ahead. That shift of attention is often the hardest work a person does.`,
  },

  {
    title:        "When you feel like giving up and your faith feels insufficient",
    category:     "pastoral",
    scripture_ref: "Luke 11:5-13, Mark 9:14-24",
    source:       "Kairos curated — Where to Turn reference",
    content: `The man in Mark 9 who brought his suffering son to Jesus said one of the most honest things in the entire New Testament: "I believe — help my unbelief." He did not pretend to have more faith than he had. He did not manufacture certainty. He brought what he had — incomplete, mixed with doubt — and it was enough. Jesus healed his son. The parable of the persistent friend in Luke 11 is about the kind of prayer that does not give up — not because God is reluctant but because persistence shapes us and deepens trust. The invitation to keep asking, keep seeking, keep knocking is not about wearing God down. It is about the work that sustained asking does in the one who asks. Faith that feels insufficient is still faith. A mustard seed is almost invisible — and Jesus said that is enough to move mountains. The measure of faith required is not enormous; it is honest.`,
  },

  {
    title:        "When you doubt your worth and wonder if God truly loves you",
    category:     "pastoral",
    scripture_ref: "Psalm 139:13-18, John 3:16, Romans 8:38-39",
    source:       "Kairos curated — Where to Turn reference",
    content: `Psalm 139 is one of scripture's most intimate declarations about how God knows and values each person. "You created my inmost being; you knit me together in my mother's womb." The psalmist is not speaking abstractly — this is a deeply personal claim that God's knowledge of us extends to our formation before we had any capacity to earn or deserve His attention. John 3:16 specifies that God so loved the world — not the impressive parts of it, not the people who had figured things out, but the broken, hostile, fallen world. That includes the parts of us we most doubt and are most ashamed of. The question "does God truly love me?" is often asked from within a specific wound — an experience of rejection, abandonment, or unworthiness that has shaped how God feels. The answer is not a feeling; it is a historical event. The cross happened when we were still enemies. That is the measure.`,
  },

  {
    title:        "When you carry a heavy load and need rest for your soul",
    category:     "pastoral",
    scripture_ref: "Matthew 11:28-30, Psalm 46",
    source:       "Kairos curated — Where to Turn reference",
    content: `"Come to me, all you who are weary and burdened, and I will give you rest." These words of Jesus are among the most widely known in the gospel — and among the most frequently received as metaphor when they are meant as a literal invitation. The rest Jesus offers is not the rest of having fewer problems. It is the rest of a different kind of burden — a yoke that fits, carried with One who is gentle and humble in heart. Psalm 46 describes God as a refuge and strength — an ever-present help in trouble. The psalm does not describe the trouble going away; it describes God being present within it. "Therefore we will not fear, though the earth give way and the mountains fall into the heart of the sea." The heaviness you carry is real. The invitation is not to pretend it is light but to stop carrying it alone. That is what it means to cast your burden on the Lord — not a spiritual technique but a genuine transfer of weight.`,
  },

  {
    title:        "When you need direction and wisdom for a decision",
    category:     "pastoral",
    scripture_ref: "Proverbs 3:5-6, Psalm 25:9, James 1:5-8",
    source:       "Kairos curated — Where to Turn reference",
    content: `The need for direction is one of the most consistent experiences of the life of faith — and one of the areas where people most often feel they are not hearing clearly from God. Proverbs 3:5-6 offers the most concise summary: trust in the Lord with all your heart, do not lean on your own understanding, acknowledge Him in all your ways, and He will make your paths straight. This is not a formula for receiving a divine GPS signal — it is a description of an orientation of life in which decisions are made within a posture of trust rather than self-sufficiency. James says that if anyone lacks wisdom, ask God — who gives generously without finding fault. But James adds a condition: ask in faith, not doubting. Uncertainty about outcome is not the same as doubt about God's character. The direction that comes from God often arrives through scripture, through wise counsel, through circumstances, and through the slow formation of desire in a surrendered heart.`,
  },

  {
    title:        "When you are angry and struggling to control it",
    category:     "pastoral",
    scripture_ref: "Ephesians 4:26-27, James 1:19-20",
    source:       "Kairos curated — Where to Turn reference",
    content: `Anger is not inherently sinful — the Bible is clear on that. "Be angry and do not sin" in Ephesians 4 assumes the anger, and then addresses what to do with it. God Himself is described as angry at injustice and evil throughout scripture. Jesus overturned the tables in the temple. The question is not whether anger is present but what it is doing and where it goes. James says to be quick to hear, slow to speak, and slow to anger — because human anger does not produce the righteousness of God. Unprocessed anger handed over to the enemy gives him a foothold. Anger that is held honestly before God, that is not acted upon impulsively, that is brought into the light — that anger can be transformed. It can become the energy of righteous action rather than destruction. The invitation is not to suppress anger but to bring it to God before it controls us.`,
  },

  {
    title:        "When you feel weak and your strength has run out",
    category:     "pastoral",
    scripture_ref: "2 Corinthians 12:9, Isaiah 40:28-31",
    source:       "Kairos curated — Where to Turn reference",
    content: `Paul's experience of weakness is one of the most counterintuitive things in the New Testament. He prayed three times to have his thorn removed — and God said no. Not because God was indifferent, but because the response was something more valuable: "My grace is sufficient for you, for my power is made perfect in weakness." Paul's conclusion is startling: "Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me." Weakness, in the economy of God, is not an obstacle to His work — it is often the condition for it. The strength that runs out is the strength that was always insufficient. What God offers in its place is not a restored version of our own strength, but access to something that does not run out. Isaiah 40 ends with a progression — soaring like eagles, running without weariness, walking without fainting. Walking without fainting is the most honest picture of what endurance actually looks like for most people.`,
  },

  {
    title:        "When God does not seem to act and His delays feel unbearable",
    category:     "pastoral",
    scripture_ref: "John 11:1-44, Psalm 13",
    source:       "Kairos curated — Where to Turn reference",
    content: `John 11 contains one of the most painful details in the gospels — not the grief of Mary and Martha at Lazarus's death, but verse 6: "When Jesus heard that Lazarus was sick, he stayed where he was two more days." He waited on purpose. He let what could have been prevented happen. The sisters' grief when He finally arrived was real and He did not dismiss it — "Lord, if you had been here, my brother would not have died." Jesus wept. He did not correct their theology or explain His delay. He mourned with them. Then He acted with a power that could not have been displayed if He had arrived earlier. The delay was not indifference — it was purpose. Psalm 13 is David crying "How long, O Lord? Will you forget me forever?" — and ending with trust. The distance between those two places is not made by argument but by the long, honest practice of bringing the pain to God rather than turning away from Him.`,
  },

  {
    title:        "When you have left God and feel too far gone to return",
    category:     "pastoral",
    scripture_ref: "Luke 15:11-32, Romans 8:38-39",
    source:       "Kairos curated — Where to Turn reference",
    content: `The parable of the Prodigal Son is Jesus' answer to the feeling of being too far gone. The son in the story did not simply wander — he took his inheritance, which in his culture was equivalent to saying "I wish you were dead," and he wasted every bit of it in deliberate, sustained rebellion. When he came to his senses, he did not expect full restoration. He rehearsed a speech asking to be made a servant. He never got to deliver it. The father saw him "while he was still a long way off" — which means the father was watching for him. He ran to meet him. He interrupted the rehearsed speech with restoration. The robe, the ring, the sandals, the feast — these are not a cautious welcome. They are the full reinstatement of sonship. Jesus told this story to people who thought some people had gone too far. The only thing the story requires of the returning one is the turning — coming back is enough.`,
  },

  // ── SCRIPTURE CONTEXT ─────────────────────────────────────────

  {
    title:        "John 3:16 — God so loved the world",
    category:     "scripture_context",
    scripture_ref: "John 3:16",
    source:       "Kairos curated",
    content: `John 3:16 is the most memorised verse in Christianity and one of the most misread. "For God so loved the world" — the word "so" in the original Greek is "houtōs," meaning "in this way," not "so much." The emphasis is on the manner of love, not merely its intensity. The love is demonstrated by an action — giving the only Son — not merely felt. "The world" (kosmos) in John's writing often carries a negative connotation — it is the fallen, hostile, broken world that God loves. This is not sentimental love for a world that deserves it; it is costly love for a world in rebellion. The purpose is salvation ("should not perish") and life ("eternal life") — where eternal life in John's gospel is not primarily about duration but quality: knowing God. The verse sits within a night conversation with Nicodemus, a religious leader who came to Jesus in secret — and it expanded the scope of salvation beyond what Nicodemus expected.`,
  },

  {
    title:        "Romans 8:28 — All things work together for good",
    category:     "scripture_context",
    scripture_ref: "Romans 8:28",
    source:       "Kairos curated",
    content: `Romans 8:28 is one of the most quoted verses in Christian comfort — and one of the most easily misapplied. "All things work together for good for those who love God, who are called according to His purpose." A few things are essential to understand: First, this verse is not a promise that everything will feel good or turn out the way we hope. It is a promise about ultimate purpose, not immediate comfort. Second, the "good" in view is defined by the next verse — being conformed to the image of Christ. The good God is working toward is character and redemption, not necessarily prosperity or the avoidance of pain. Third, this verse belongs to a chapter that begins with "no condemnation" and ends with "nothing can separate us from the love of God." It is a declaration of God's sovereign care in the context of suffering — not a dismissal of suffering. Using this verse to minimise someone's pain is a misuse of it.`,
  },

  {
    title:        "Psalm 23 — The Lord is my shepherd",
    category:     "scripture_context",
    scripture_ref: "Psalm 23",
    source:       "Kairos curated",
    content: `Psalm 23 is one of the most beloved passages in all of scripture, and its power is inseparable from its imagery. David was a shepherd before he was a king — he knew exactly what a shepherd does and what sheep need. The psalm moves through green pastures and still waters, then through the valley of the shadow of death — without apology for that transition. The comfort of the psalm is not that the valley is avoided, but that the shepherd is present in it. "I will fear no evil, for you are with me" — the comfort is presence, not escape. The table prepared in the presence of enemies is remarkable: abundance not after the danger has passed, but in the middle of it. The psalm ends not with retirement from difficulty but with goodness and mercy following all the days of one's life — pursuit, not just accompaniment. Verse 4 in Hebrew contains a significant shift: from "He" to "You" — the psalmist moves from speaking about God to speaking to God in the darkest moment.`,
  },

  {
    title:        "Jeremiah 29:11 — Plans to give you hope and a future",
    category:     "scripture_context",
    scripture_ref: "Jeremiah 29:11",
    source:       "Kairos curated",
    content: `Jeremiah 29:11 is one of the most frequently misapplied verses in contemporary Christianity. "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." The context is essential: God spoke these words to a people who had just been taken into Babylonian captivity — and He told them they would be there for 70 years. The verse immediately follows instructions to settle down, build houses, plant gardens, and seek the peace of the city where they had been taken captive. This is not a promise of immediate blessing or escape from difficulty. It is a promise of ultimate purpose and faithfulness in the middle of a very long and painful season. Applied without its context, this verse can set up unrealistic expectations and cause people to feel abandoned when difficulty does not quickly resolve. With its context, it is one of the most honest and sustaining promises in scripture.`,
  },

  {
    title:        "Philippians 4:13 — I can do all things through Christ",
    category:     "scripture_context",
    scripture_ref: "Philippians 4:11-13",
    source:       "Kairos curated",
    content: `Philippians 4:13 — "I can do all things through Christ who strengthens me" — is one of the most quoted and most misunderstood verses in the New Testament. It is frequently used as a motivational declaration for human achievement. But its context changes its meaning entirely. Paul wrote Philippians from prison. The verses immediately before 4:13 describe learning to be content in all circumstances — in abundance and in need, in plenty and in hunger. "All things" does not mean all accomplishments or ambitions; it means all circumstances — including the hard ones. The verse is about endurance and contentment in suffering, not victory and achievement in competition. The strength Paul describes is not power to perform but grace to remain faithful regardless of circumstances. This is a much more demanding and honest promise than the motivational version — and a much more useful one for people in actual difficulty.`,
  },

  {
    title:        "The Beatitudes — Blessed are those who mourn",
    category:     "scripture_context",
    scripture_ref: "Matthew 5:1-12",
    source:       "Kairos curated",
    content: `The Beatitudes open the Sermon on the Mount and immediately overturn every human expectation of what blessed means. Blessed are the poor in spirit, those who mourn, the meek, those who hunger and thirst for righteousness, the merciful, the pure in heart, the peacemakers, the persecuted. These are not the people the world celebrates — they are the people the world often overlooks or pities. The word "blessed" (makarios in Greek) carries a sense of deep wellbeing or flourishing — not happiness in the surface sense. Jesus is not saying mourning feels good; He is saying that mourning people are held in God's particular care and will be comforted. The Beatitudes describe the character of those who belong to the kingdom — people who know their need, who feel the weight of what is wrong, who pursue peace at personal cost. They are descriptive as much as prescriptive — this is what life in the kingdom looks like, not just what we should aspire to.`,
  },

  {
    title:        "The Prodigal Son — a portrait of the Father's love",
    category:     "scripture_context",
    scripture_ref: "Luke 15:11-32",
    source:       "Kairos curated",
    content: `The parable of the Prodigal Son is perhaps Jesus' most complete portrait of what God is like. The younger son's request for his inheritance early was, in that culture, equivalent to saying "I wish you were dead." The father's response — giving it — is breathtaking. When the son returns, having squandered everything, the father sees him "while he was still a long way off" — which means the father was looking. He ran to meet him — undignified for a patriarch in that culture. He did not wait for the rehearsed speech; he interrupted it with restoration. The robe, the ring, the sandals, the feast — each was a restoration of full sonship, not a conditional probation. The elder brother is equally important: his resentment reveals that he had been serving from duty, not love, and had not understood the father's heart at all. The parable ends without resolution for the elder brother — the question left open is whether he will come into the feast. Jesus told this story to people who were offended by His welcome of sinners.`,
  },

  {
    title:        "Lamentations 3 — Great is thy faithfulness",
    category:     "scripture_context",
    scripture_ref: "Lamentations 3:1-23",
    source:       "Kairos curated",
    content: `Lamentations 3 contains some of the most desperate language in all of scripture — "He has driven me away and made me walk in darkness rather than light," "He has made my skin and my flesh grow old and has broken my bones." This is not a polite complaint. This is anguish expressed with full force. And yet, in verse 21, something shifts: "Yet this I call to mind and therefore I have hope." What follows is "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness." This is not the resolution of pain — the surrounding chapters return to lament. It is the discovery of something beneath the pain that is steadier. The passage is honest about how dark the darkness can be, and it does not rush through it. The famous words of hope emerge not despite the lament but from within it. This is why Lamentations belongs in the canon — it teaches that hope and honest suffering can coexist.`,
  },

  {
    title:        "Romans 8:38-39 — Nothing can separate us from the love of God",
    category:     "scripture_context",
    scripture_ref: "Romans 8:38-39",
    source:       "Kairos curated",
    content: `Romans 8 ends with one of the most comprehensive declarations of divine love in scripture. Paul lists every possible category of threat — death, life, angels, rulers, present things, future things, powers, height, depth, anything in all creation — and declares that none of it can separate believers from the love of God in Christ Jesus. This is not a passive reassurance. Paul has just finished describing suffering, groaning creation, and the Spirit interceding with wordless groans. The declaration of inseparability comes at the end of honest engagement with how hard life can be. "Nothing in all creation" is an exhaustive category — it includes circumstances, our own failures, our worst moments, our doubts, our distance. The love described is not conditional on performance or emotional state. It is a love that holds even when we cannot feel it, even when we have run from it, even in death.`,
  },

  {
    title:        "Isaiah 40 — They who wait upon the Lord",
    category:     "scripture_context",
    scripture_ref: "Isaiah 40:28-31",
    source:       "Kairos curated",
    content: `Isaiah 40 is addressed to a people in exile — people who felt forgotten and overlooked by God. Verse 27 records their complaint: "My way is hidden from the Lord; my cause is disregarded by my God." The response does not dismiss this — it builds toward it. God is described as the everlasting God who does not faint or grow weary, whose understanding no one can fathom. Then comes the famous promise: those who wait upon the Lord will renew their strength; they will soar on wings like eagles; they will run and not grow weary; they will walk and not faint. The progression is significant — it goes from soaring to running to walking. Walking and not fainting is the least dramatic of the three, but it may be the most faithful description of what endurance actually looks like. Not soaring above difficulty, but continuing to walk through it without giving up. The word "wait" (qavah in Hebrew) means to bind together, to hope with expectation — not passive resignation.`,
  },



  /**
 * KAIROS — Knowledge Base Expansion (8C)
 * 50 new entries across 5 domains:
 *   Formation (15) · Advanced Spirituality (10) · Addiction & Struggle (8)
 *   Unanswered Prayer (7) · Social Faith (10)
 *
 * Each entry includes the new metadata fields from migration 007.
 * Drop these into the KNOWLEDGE_ENTRIES array in /api/admin/seed/route.js.
 * Run the seed route with ?replace=false to upsert without touching existing entries.
 */

// ── DOMAIN 1: FORMATION (15 entries) ────────────────────────────────────────
// Repentance, sanctification, Holy Spirit, spiritual disciplines, growth.
// The largest gap in the current corpus. People asking "how do I actually change?"

  {
    title:        "What repentance actually means — and what it does not",
    category:     "formation",
    scripture_ref: "Luke 15:17-20, 2 Corinthians 7:10, Acts 3:19",
    source:       "Kairos curated",
    tags:         ["repentance", "guilt", "shame", "forgiveness_of_self", "formation"],
    audience:     ["anyone", "new_believer", "growing"],
    mode_affinity: ["FORMATION", "CLARITY", "COURAGE"],
    weight:       2,
    content: `Repentance is one of the most misunderstood words in the Christian vocabulary. In many religious environments it has been used as a synonym for shame — for feeling as bad as possible about what you have done. But that is not what the New Testament means by it.
  
The Greek word is metanoia — a change of mind, a turning. Not a feeling, primarily. A  direction. The Prodigal Son "came to himself" in the pigsty — he did not wallow in self-hatred for months before returning. He turned and walked home.
  
Paul draws a crucial distinction in 2 Corinthians 7:10: "Godly sorrow brings repentance that leads to salvation and leaves no regret, but worldly sorrow brings death." Worldly sorrow is  shame that curves inward, consuming the person. Godly sorrow looks outward and moves — toward  God, toward restoration, toward change.
  
What repentance is not: it is not achieving a sufficient level of guilt before God will  accept you. It is not a performance of remorse. It is not the guarantee that you will never  fail in the same way again.
  
What it is: a genuine turning. An acknowledgment of what was wrong. A change of direction. And in the economy of God, that turning is met — like the father in the parable — while you are still a long way off.
  
Repentance is the door, not the hallway. You do not have to stand in it indefinitely before  entering.`,
  },

  {
    title:        "The Holy Spirit's role in transformation",
    category:     "formation",
    scripture_ref: "Romans 8:13, Galatians 5:16-25, Ezekiel 36:26-27",
    source:       "Kairos curated",
    tags:         ["holy_spirit", "sanctification", "formation", "spiritual_growth", "obedience"],
    audience:     ["new_believer", "growing"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       2,
    content: `One of the most important questions in the Christian life is: who is responsible for my growth? If the answer is entirely "me" — through effort, discipline, and willpower — the result is either pride when it works or despair when it doesn't. If the answer is entirely "God" — and I simply wait for transformation to happen — the result is passivity that never produces change.
  
The New Testament holds both together, but with a clear order. Ezekiel 36:26-27 is God's promise through the prophet: "I will give you a new heart... I will put my Spirit in you and  move you to follow my decrees." The initiative is God's. The movement comes from within, placed there by God, not manufactured by the person.
  
Paul builds on this in Romans 8:13: "If by the Spirit you put to death the misdeeds of the body, you will live." The action is yours — putting to death. But the agent is the Spirit — by the Spirit. Both are present in the same sentence.
  
Galatians 5 describes the fruit of the Spirit — not the fruit you produce for the Spirit, but  what the Spirit produces in you as you remain connected. The image is organic, not mechanical. Fruit is not manufactured; it grows from the inside out when the conditions are right.
  
The practical implication: spiritual transformation is not primarily about trying harder. It is about remaining in close relationship with the Holy Spirit — through prayer, through Scripture, through community, through honest confession — and trusting that He will do from the inside what willpower alone cannot do from the outside.`,
  },

  {
    title:        "Sanctification — the long work of becoming",
    category:     "formation",
    scripture_ref: "Philippians 1:6, 1 Thessalonians 5:23-24, Hebrews 12:14",
    source:       "Kairos curated",
    tags:         ["sanctification", "spiritual_growth", "formation", "patience", "holiness"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `Sanctification is the theological word for the long, ongoing process of  becoming more like Christ. It is distinct from justification — the moment of being declared righteous before God — which is immediate and complete. Sanctification is  neither immediate nor complete in this life. It is the work of a lifetime.
  
This matters because many sincere believers carry guilt about how slowly they seem to be changing. They expected that conversion would mean their struggles would significantly  diminish. When they find the same patterns, the same temptations, the same failures recurring  years later, they wonder if they are doing something wrong — or if they are truly saved at all.
  
Paul's letter to the Philippians was written to mature believers he deeply loved. And he does  not say to them: "By now you should have it together." He says: "He who began a good work in you will carry it on to completion until the day of Christ Jesus." The completion is not in this lifetime. It is in the day of Christ.
  
Hebrews 12:14 says: "Make every effort to live in peace with everyone and to be holy." Make  every effort — so human agency is real. But the standard of holiness described throughout the  New Testament is not a bar to clear before God will accept you; it is a direction to walk in for the rest of your life.
  
Sanctification is not a sprint. It is more like walking in a direction — sometimes stumbling,  sometimes moving well, but fundamentally oriented toward something. The question is not  whether you have arrived. It is whether you are still moving.`,
  },

  {
    title:        "How to read the Bible — not as a rule book but as a relationship",
    category:     "formation",
    scripture_ref: "Psalm 119:97-105, John 5:39-40, 2 Timothy 3:16-17",
    source:       "Kairos curated",
    tags:         ["scripture_meditation", "formation", "prayer", "biblical_interpretation"],
    audience:     ["new_believer", "growing"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `Jesus said something startling to the Pharisees in John 5:39-40: "You study the  Scriptures diligently because you think that in them you have eternal life. These are the  very Scriptures that testify about me, yet you refuse to come to me to have life." The Pharisees knew the Bible better than almost anyone. And they missed the whole point of it.
  
Scripture is not a set of rules to comply with or information to accumulate. It is a witness — to a Person. The goal of reading it is not to master a text but to encounter the God the  text is about.
  
That changes how you read. Instead of moving through chapters for coverage, you slow down. You ask: what is this saying about who God is? What does this ask of me specifically, today?  Is there a promise here I am not yet believing? A command I have been avoiding? A character  whose struggle mirrors something I am living?
  
The ancient practice of lectio divina — sacred reading — offers one form of this: read a passage slowly, notice what word or phrase lands differently, sit with it, let it become a  prayer. Not analysis but listening.
  
Psalm 119 is the testimony of someone for whom Scripture has become love, not obligation:  "How I love your law. I meditate on it all day long." That posture is available to anyone —  but it is built slowly, through consistent, unhurried return to the text. It is a  relationship developed over years, not a technique mastered in a weekend.`,
  },

  {
    title:        "The spiritual discipline of confession",
    category:     "formation",
    scripture_ref: "James 5:16, Psalm 32:3-5, 1 John 1:9",
    source:       "Kairos curated",
    tags:         ["repentance", "confession", "formation", "shame", "community"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "COURAGE", "PASTORAL"],
    weight:       1,
    content: `James 5:16 is one of the more uncomfortable verses in the New Testament: "Confess your sins to each other and pray for each other so that you may be healed." Not  confess to God alone — to each other.
  
Most Christians are comfortable with private confession to God, which is real and important. Far fewer practice the communal confession James describes. And the result, often, is hidden  shame that grows in the dark — sins carried alone that take on increasing weight and begin to  shape identity in ways that honest community would disrupt.
  
Psalm 32 is David describing what it felt like before he confessed: "When I kept silent, my  bones wasted away through my groaning all day long." The physical metaphor is significant —  unconfessed sin has a bodily weight. Then he speaks: "I acknowledged my sin to you and did not cover up my iniquity." And the release was immediate.
  
Confession is not primarily about feeling bad. It is about bringing what is hidden into the  light — where it loses its power. Sin that is confessed to God and, where appropriate, to a  trusted person, can be met with grace. Sin that remains hidden festers.
  
The practice requires discernment about who and when — not every sin needs to be confessed to  every person. But a faith community where no one ever speaks honestly about struggle is not a  community of grace. It is a community of performance. And performance is exhausting.`,
  },

  {
    title:        "Spiritual disciplines are not about earning — they are about access",
    category:     "formation",
    scripture_ref: "1 Timothy 4:7-8, Luke 5:16, Matthew 6:6",
    source:       "Kairos curated",
    tags:         ["spiritual_discipline", "formation", "prayer", "solitude", "grace"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `There is a version of spiritual discipline that is really just performance — accumulating practices to feel like a serious Christian, or to earn God's favour through  consistency. That version is exhausting and spiritually dangerous, because it subtly relocates the foundation from grace to effort.
  
But there is another way to understand spiritual disciplines that is entirely compatible with  grace. Dallas Willard used a helpful analogy: you do not lift weights to earn the ability to run a marathon. You train to become the kind of person who can run it. The training is not  the goal — it creates the capacity for the goal.
  
Paul says in 1 Timothy 4:7-8: "Train yourself to be godly. For physical training is of some  value, but godliness has value for all things." The word train is the root of our word gymnasium. Spiritual formation is an athletic metaphor — not effort to earn, but practice to  develop capacity.
  
Jesus himself practised disciplines: He withdrew to lonely places to pray (Luke 5:16). He  fasted. He kept the Sabbath. These were not performances for the crowds — they were the means  by which He maintained connection to the Father in the middle of an active, demanding  ministry.
  
Disciplines are not the point. They are the path. Prayer, fasting, solitude, Scripture,  service, community — these create the conditions in which God's grace can do its transforming  work. They do not compel God to act. They place us in the place where He tends to show up.`,
  },

  {
    title:        "The practice of solitude and silence",
    category:     "formation",
    scripture_ref: "Mark 1:35, Psalm 46:10, Lamentations 3:26-28",
    source:       "Kairos curated",
    tags:         ["solitude", "silence", "spiritual_discipline", "formation", "contemplative"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "PASTORAL"],
    weight:       1,
    content: `Modern life is structured against silence. Notifications, music, podcasts, conversation — the spaces between things are immediately filled. Many people have not sat in genuine silence for more than a few minutes in years. And the effect on the spiritual  life is significant: we become unable to hear what requires quietness to receive.
  
Jesus returned repeatedly to solitude. Mark 1:35 is characteristic: "Very early in the morning, while it was still dark, Jesus got up, left the house, and went off to a solitary  place, where he prayed." This is immediately after one of His most demanding ministry days.  His response to depletion was not more activity — it was withdrawal.
  
The discipline of solitude is not about achieving emptiness or a particular emotional state. It is about deliberately removing the noise that makes it possible to avoid God and ourselves. In silence, things surface that busyness buries — fears, desires, unprocessed  grief, the quiet voice that speaks beneath the noise.
  
Lamentations 3:26-28 describes a posture that is rare in contemporary life: "It is good to wait quietly for the salvation of the Lord. It is good for a man to bear the yoke while he is young, to sit alone in silence, for the Lord has laid it on him."
  
Sit alone in silence. This is presented as good — not comfortable, not natural for most  people, but good. Formative. The thing that the yoke is preparing a person for requires the  capacity that silence builds.
  
Start with minutes, not hours. The goal is not achievement but direction — a regular turning toward the quiet, where God tends to speak most clearly.`,
  },

  {
    title:        "Obedience — why it is not a transaction",
    category:     "formation",
    scripture_ref: "John 14:21, Deuteronomy 10:12-13, 1 Samuel 15:22",
    source:       "Kairos curated",
    tags:         ["obedience", "formation", "calling", "love", "spiritual_growth"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `Obedience is a word that can carry two very different weights depending on the relationship it is embedded in. Obedience to an employer is primarily contractual — you perform the required tasks in exchange for compensation. Obedience to a parent who loves  you, when you are young and trust them, is different — it is the expression of a relationship, not a transaction.
  
Much of the religious anxiety around obedience comes from understanding it transactionally — as though keeping God's commands is what secures His favour. But Jesus reframes it entirely in John 14:21: "Whoever has my commands and keeps them is the one who loves me." Obedience is the language of love, not the currency of acceptance.
  
Deuteronomy 10:12-13 gives the same frame in the Old Testament: "What does the Lord your God ask of you but to fear the Lord your God, to walk in obedience to him, to love him, to serve  the Lord your God with all your heart and with all your soul, and to observe the Lord's  commands... for your own good."
  
For your own good. Not to satisfy an arbitrary requirement — because what God commands is  aligned with how things actually work, with what human flourishing looks like, with what love  requires.
  
Samuel's word to Saul is blunt: "Does the Lord delight in burnt offerings and sacrifices as  much as in obeying the Lord? To obey is better than sacrifice." Performing religious acts  while disobeying God's actual requirements is not more impressive — it is less. Obedience is the thing itself.`,
  },

  {
    title:        "Discernment — learning to tell the difference",
    category:     "formation",
    scripture_ref: "Hebrews 5:14, 1 John 4:1, Romans 12:2",
    source:       "Kairos curated",
    tags:         ["discernment", "formation", "holy_spirit", "calling", "spiritual_growth"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `Discernment is the capacity to tell the difference — between what is from God  and what is not, between wisdom and cleverness, between the Spirit's leading and one's own desires dressed in spiritual language. It is one of the most needed and most  underdeveloped capacities in modern Christian life.
  
Hebrews 5:14 says solid food — deeper spiritual teaching — is for those "who by constant use have trained themselves to distinguish good from evil." The word is trained. Discernment is not a spiritual superpower that arrives suddenly. It is a skill developed through practice —  through making choices, observing what happens, returning to prayer, being wrong and learning  from it.
  
1 John 4:1 warns: "Dear friends, do not believe every spirit, but test the spirits to see  whether they are from God." This assumes that not everything that presents itself as spiritual is from God. Counterfeits exist. Not every impressive religious experience, every compelling voice, every strong inner conviction is trustworthy.
  
The tests John gives include: does this affirm or deny the incarnation? Does the teaching  produce love or division? Does this spirit align with what is already known of God through Scripture?
  
The Romans 12:2 frame is also important: transformation through the renewing of the mind enables you to "test and approve what God's will is." Discernment is not primarily mystical — it is the fruit of a transformed mind shaped by Scripture, prayer, and honest community,  operating over time.`,
  },

  {
    title:        "Dealing with persistent sin — why the same struggle keeps returning",
    category:     "formation",
    scripture_ref: "Romans 7:15-24, Galatians 5:17, James 1:14-15",
    source:       "Kairos curated",
    tags:         ["sin", "temptation", "formation", "sanctification", "shame_cycle"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "PASTORAL", "COURAGE"],
    weight:       2,
    content: `Paul's description in Romans 7 is one of the most honest passages in the New Testament: "I do not understand what I do. For what I want to do I do not do, but what I  hate I do." He is describing a mature believer — himself — still wrestling with the gap  between intention and action.
  
The persistence of sin in the life of a Christian is not evidence that they are not truly  saved. It is evidence of the ongoing war Paul describes in Galatians 5:17 between the flesh  and the Spirit. That war does not end in this life. It changes in character and intensity  over years of formation, but it does not simply stop.
  
Understanding why certain sins keep returning is more useful than simply intensifying the  effort not to do them. James 1:14-15 traces the anatomy: "Each person is tempted when they are dragged away by their own evil desire and enticed. Then, after desire has conceived, it gives birth to sin." The issue is desire — what we want, at depth. Willpower applied to behaviour without addressing the desire underneath is like mowing weeds without pulling roots.
  
The formation question is: what is this sin offering me? What legitimate need is it meeting  in an illegitimate way? Anxiety relief, comfort, significance, connection, control?  Understanding the need allows it to be brought to God honestly — rather than just fighting the symptom repeatedly.
  
The shame cycle — sin, shame, hiding, more sin — is what grace is designed to interrupt. Confession, not concealment, is where the cycle breaks.`,
  },

  {
    title:        "The Sabbath — rest as spiritual formation",
    category:     "formation",
    scripture_ref: "Genesis 2:2-3, Exodus 20:8-11, Mark 2:27",
    source:       "Kairos curated",
    tags:         ["sabbath", "rest", "formation", "spiritual_discipline", "exhaustion"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["FORMATION", "PASTORAL"],
    weight:       1,
    content: `The Sabbath is the only rhythm God built into creation before human beings had done anything wrong. On the seventh day, God rested — not from exhaustion, but as a pattern, a declaration that rest is woven into the fabric of existence, not earned after  sufficient productivity.
  
The Fourth Commandment in Exodus 20 is the longest of the ten — detailed, specific, inclusive  of servants and animals and foreigners. The thoroughness of the command suggests that rest does not come naturally and requires deliberate architecture.
  
Jesus' words in Mark 2:27 are important: "The Sabbath was made for man, not man for the  Sabbath." The Sabbath is a gift, not an obligation. Not a legalistic requirement to satisfy  but a pattern of life that serves the people who inhabit it. It acknowledges: you are not the  load-bearing wall of the universe. The world continues when you stop.
  
The spiritual formation dimension of Sabbath is often missed. Regular, rhythmic stopping does  something in the soul that cannot be done any other way — it interrupts the underlying belief  that your value is in your productivity, that you are only acceptable when you are useful. To  stop on principle, weekly, is to declare: I am more than what I produce.
  
In an age of always-on work and 24-hour availability, Sabbath practice is one of the most  countercultural things a person can do. It is also one of the most spiritually formative.`,
  },

  {
    title:        "Spiritual accountability — what it is and what it is not",
    category:     "formation",
    scripture_ref: "Proverbs 27:17, Hebrews 10:24-25, Galatians 6:1-2",
    source:       "Kairos curated",
    tags:         ["accountability", "formation", "community", "spiritual_discipline", "habits"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "COURAGE"],
    weight:       1,
    content: `Accountability has developed a poor reputation in many Christian communities — partly because it has been practiced as surveillance, partly because it creates shame without healing, and partly because many accountability relationships never move beyond asking "did you fail this week?"
  
But the problem is not accountability itself. It is a thin version of it.
  
Proverbs 27:17 says: "As iron sharpens iron, so one person sharpens another." Sharpening is  not inspection. It is friction that produces refinement — and it requires both parties to be genuinely engaged.
  
Galatians 6:1-2 gives the framework for what this looks like when someone is struggling: "If someone is caught in a sin, you who live by the Spirit should restore that person gently. But watch yourselves, or you also may be tempted. Carry each other's burdens." Three things are held together: restoration, not just correction; gentleness; and mutual vulnerability — not a superior helping an inferior.
  
Hebrews 10:24-25 says to "spur one another on toward love and good deeds, not giving up  meeting together." The ongoing community is itself the accountability — not a weekly checklist, but a sustained relationship in which each person's life is genuinely known.
  
Real accountability requires: honesty without shame, challenge without contempt, consistency over time, and genuine relationship rather than a formal arrangement. It is less like a performance review and more like a friendship with agreed-upon honesty.`,
  },

  {
    title:        "Vocation — the theology of ordinary work",
    category:     "formation",
    scripture_ref: "Colossians 3:23-24, Genesis 2:15, 1 Corinthians 10:31",
    source:       "Kairos curated",
    tags:         ["vocation", "calling", "formation", "stewardship", "purpose"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `The Reformation's recovery of the doctrine of vocation was one of its most practically significant contributions. Before Luther, "calling" was primarily reserved  for priests and monks — ordinary people did ordinary work, and spiritual life was a  separate category. Luther insisted that every legitimate occupation is a calling, a place  where God is served through service to neighbour.
  
Colossians 3:23-24 gives the frame: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." The recipient of your work changes everything.  The teacher in a classroom, the doctor in a ward, the engineer building infrastructure, the  parent raising children — all of these are addressed by "whatever you do."
  
Genesis 2:15 places work before the fall — God put the human being in the garden "to work it and take care of it." Work is not a result of sin; it is part of the original goodness of creation. The fall corrupted work — made it frustrating, painful, resistant. But work itself  is not the problem.
  
This matters for people who feel the distance between their daily work and their faith. The  question is not "how do I find something more spiritual to do?" It is "how do I do the work I  have as someone who is working ultimately for God?" That shift in orientation — not location — is the heart of vocation. The sacred and the ordinary occupy the same address.`,
  },

  {
    title:        "Developing a rule of life — structure for formation",
    category:     "formation",
    scripture_ref: "Psalm 1:1-3, Luke 9:23, Ephesians 5:15-16",
    source:       "Kairos curated",
    tags:         ["spiritual_discipline", "formation", "habits", "accountability",  "calling"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `A rule of life is not a schedule or a set of rules to comply with. The word  "rule" comes from the Latin regula — a trellis, the structure that a growing vine clings to. A rule of life is the framework that allows growth to happen in a direction rather  than randomly in all directions.
  
The monastic tradition developed detailed rules of life — the Rule of St. Benedict being the most influential. But the principle is available to anyone: deliberate, structured rhythms of prayer, work, rest, community, and service that create the conditions for a person to become  who they are trying to become.
  
Psalm 1 describes the person whose "delight is in the law of the Lord" and who meditates on  it day and night — like a tree planted by streams of water, bearing fruit in season. The structure of consistent return to God produces the stability and fruitfulness described.
  
A personal rule of life might ask: how am I ordering my days around prayer? When and how do I  engage Scripture? What community rhythms am I committed to? How do I handle rest and work? What practices help me stay honest about my interior life?
  
The goal is not legalistic compliance with a plan. It is intentionality — the recognition  that formation does not happen accidentally. What shapes us is primarily not the extraordinary moments but the accumulated weight of ordinary choices, practised daily over  years.
  
Luke 9:23 — "deny yourself, take up your cross daily" — is the daily rhythm that underlies all of it.`,
  },

  {
    title:        "Gratitude as spiritual practice — not just positive thinking",
    category:     "formation",
    scripture_ref: "1 Thessalonians 5:18, Psalm 103:1-5, Philippians 4:8",
    source:       "Kairos curated",
    tags:         ["formation", "spiritual_discipline", "gratitude", "anxiety", "prayer"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["FORMATION", "PASTORAL"],
    weight:       1,
    content: `Gratitude in the Christian tradition is not the same as positive thinking — the  discipline of focusing on good things to manufacture a cheerful outlook. It is a theological practice rooted in a specific claim about reality: that everything good is a  gift, and that the giver is a Person who can be thanked.
  
Paul says in 1 Thessalonians 5:18: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." Not for all circumstances — the distinction matters. Paul is not  saying cancer is good or loss is good. He is saying that gratitude can inhabit all circumstances because it is oriented not toward the circumstances themselves but toward the God who is present within them.
  
Psalm 103 opens with David speaking to himself: "Praise the Lord, my soul; all my inmost being, praise his holy name." He then works through a list — forgiveness, healing,  redemption, love, compassion, renewal. He is building a case for his own soul. This is not spontaneous feeling; it is deliberate practice.
  
Philippians 4:8 is the cognitive component: "Whatever is true, whatever is noble, whatever is  right, whatever is pure, whatever is lovely, whatever is admirable — think about such things." Attention is a choice. Gratitude directs attention toward what is real and good alongside what is hard.
  
Practiced over time, gratitude reshapes the perception of daily life. Not by denying difficulty but by refusing to let difficulty become the only thing the eyes can see.`,
  },

// ── DOMAIN 2: ADVANCED SPIRITUALITY (10 entries) ────────────────────────────
// Contemplative prayer, spiritual dryness, discernment of spirits, mystical
// experience, union with God, dark night of the soul, mature faith questions.

  {
    title:        "Spiritual dryness — when God feels absent in prayer",
    category:     "advanced",
    scripture_ref: "Psalm 88, Lamentations 3:8, 1 Kings 19:4-8",
    source:       "Kairos curated",
    tags:         ["spiritual_dryness", "prayer", "dark_night_of_soul", "unanswered_prayer", "formation"],
    audience:     ["growing", "mature"],
    mode_affinity: ["PASTORAL", "LAMENT", "FORMATION"],
    weight:       2,
    content: `Spiritual dryness — the experience of praying and feeling nothing, of seeking  God and finding only silence, of going through the motions of faith without any sense of life in them — is one of the most common and most disorienting experiences in the mature  Christian life. It is also one of the least talked about.
  
Many Christians experiencing spiritual dryness assume they have done something wrong, or that  their faith was never real, or that God has withdrawn from them in displeasure. None of these  is the most likely explanation.
  
John of the Cross, the 16th-century Spanish mystic, described what he called the "dark night of the soul" — a period of spiritual aridity that God uses not as punishment but as purification. The removal of the felt sense of God's presence is not the removal of God's actual presence. It is often the transition from an immature faith that depends on emotional  experience to a deeper faith that holds without feeling.
  
Psalm 88 ends in complete darkness — no resolution, no dawn, just "darkness is my closest  friend." This psalm exists in the canon. The Spirit of God preserved it. That means some seasons simply are that dark, and the testimony of Scripture does not demand a false  resolution.
  
Elijah under the broom tree (1 Kings 19) is the other model — God's response to profound spiritual and physical depletion was not a lesson in faith. It was sleep and food. Twice. Sometimes dryness needs rest before it needs theology.
  
The practice in dry seasons is not to generate what you do not feel but to continue showing  up — to maintain the forms of prayer and Scripture even when they seem empty, trusting that  the emptiness is not the whole truth.`,
  },

  {
    title:        "Contemplative prayer — beyond words and petitions",
    category:     "advanced",
    scripture_ref: "Psalm 46:10, Romans 8:26, Matthew 6:6",
    source:       "Kairos curated",
    tags:         ["contemplative_prayer", "prayer_advanced", "silence", "union_with_god", "spiritual_discipline"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "PASTORAL"],
    weight:       1,
    content: `Most Western Christians understand prayer primarily as talking to God — making requests, offering thanks, expressing praise. These are real and important forms of prayer. But the tradition of the Church has always included something more — a form of  prayer that is less about speaking and more about attending. Less about communicating  information and more about being present.
  
Contemplative prayer is not emptying the mind in the Eastern sense — it is directing an  attentive, receptive silence toward God. It rests on the conviction that God is already  present, already speaking, and that the noise of our words can sometimes fill the space where  we might otherwise simply be with Him.
  
Romans 8:26 says the Spirit intercedes for us "with groans that words cannot express." There is a depth in the spiritual life where words are inadequate — where what is happening between God and the soul is too large for language. Contemplative prayer creates space for that depth.
  
The practical tradition includes practices like lectio divina (resting in a word or phrase of  Scripture until it becomes prayer), the Prayer of Examen (reviewing the day with attentive awareness of God's presence), and centring prayer (sitting in silent receptivity before God,  returning attention whenever the mind wanders).
  
None of these is a technique for producing spiritual experience. They are postures of  availability. The fruit of contemplative prayer is not dramatic encounters — it is usually a deepening stability, a growing attentiveness to God in ordinary moments, and a slow reformation of the interior life that is difficult to describe but unmistakable over time.`,
  },

  {
    title:        "Mystical experience — how to receive it without losing grounding",
    category:     "advanced",
    scripture_ref: "2 Corinthians 12:1-4, Acts 2:17, 1 Corinthians 14:29",
    source:       "Kairos curated",
    tags:         ["mystical_experience", "visions_dreams", "discernment", "holy_spirit",  "spiritual_dryness"],
    audience:     ["growing", "mature"],
    mode_affinity: ["CLARITY", "FORMATION", "PASTORAL"],
    weight:       1,
    content: `The Christian tradition has always made room for extraordinary spiritual experience — visions, dreams, profound encounters with God's presence, moments of unusual clarity or conviction. Paul himself described being "caught up to the third heaven" without being able to say whether he was in or out of the body (2 Corinthians 12:1-4).  Acts 2:17 quotes the prophecy of Joel: "Your sons and daughters will prophesy, your young  men will see visions, your old men will dream dreams."
  
These are real. They are part of the scriptural witness. And they can be deeply formative.
  
But they also require careful handling. 1 Corinthians 14:29 says prophetic utterances should be "weighed carefully" — and the same principle applies to any claimed spiritual experience.  Not everything that presents itself as divine is. Intense emotion, sleep deprivation,  psychological states, and wishful thinking can all produce experiences that feel spiritual.
  
The tests the tradition has developed include: Does this experience produce fruit consistent with the character of the Spirit — love, humility, greater love for others, deeper commitment to Christ? Does the content align with or contradict Scripture? Does the experience increase  dependence on God or on the experiences themselves? Is there a wise community that can hold  this with you?
  
The danger in extraordinary experience is the subtle shift from seeking God to seeking experience. When the experience becomes the goal rather than the relationship, spiritual life becomes unstable — dependent on peaks and devastated by ordinary seasons. The mystics who endured well were consistently grounded in community, Scripture, and the slow work of ordinary formation.`,
  },

  {
    title:        "The dark night of the soul — a theological account",
    category:     "advanced",
    scripture_ref: "Psalm 22:1-2, Job 23:3, Isaiah 50:10",
    source:       "Kairos curated",
    tags:         ["dark_night_of_soul", "spiritual_dryness", "suffering", "contemplative",  "lament"],
    audience:     ["mature"],
    mode_affinity: ["LAMENT", "PASTORAL", "FORMATION"],
    weight:       2,
    content: `John of the Cross described two movements he called the "dark night" — one affecting the senses, one affecting the spirit. The first involves the loss of pleasure and satisfaction in spiritual practices that once felt life-giving. The second, deeper  and rarer, involves the apparent withdrawal of God from the soul's capacity to perceive  Him at all — not just dryness in prayer but a sense of radical spiritual desolation.
  
He argued, controversially and carefully, that both of these are not crises of faith but gifts of purification — that God removes the felt consolations of spiritual life in order to  wean the soul from dependence on spiritual feeling and root it in naked faith. The person  learns to hold to God without any supporting sensory or emotional evidence — which produces a  kind of faith that cannot be shaken by the removal of experience, because it has learned to  exist without it.
  
Isaiah 50:10 speaks directly to this: "Who among you fears the Lord and obeys the word of his  servant? Let the one who walks in the dark, who has no light, trust in the name of the Lord  and rely on their God."
  
Walk in the dark. No light. Trust anyway. This is not presented as failure — it is presented as a specific and honourable form of faithfulness available only to those in darkness.
  
The theological point that sustains through this season: God's presence does not depend on our perception of it. The felt absence and the actual absence are not the same thing. Psalm 22 opens with God-forsakenness and ends with God's reign. The distance between those two  verses is walked, not skipped.`,
  },

  {
    title:        "Spiritual warfare — a grounded, undramatic account",
    category:     "advanced",
    scripture_ref: "Ephesians 6:10-18, 1 Peter 5:8-9, James 4:7",
    source:       "Kairos curated",
    tags:         ["spiritual_warfare", "discernment_of_spirits", "formation", "prayer", "temptation"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY", "COURAGE"],
    weight:       1,
    content: `Spiritual warfare is one of the most mishandled topics in contemporary Christianity — either dismissed entirely by those embarrassed by its supernatural claims, or made into a dramatic frame through which everything is a demonic attack requiring  intense spiritual combat.
  
The New Testament treatment is neither dismissive nor dramatic. Paul in Ephesians 6 describes  armour — truth, righteousness, the gospel, faith, salvation, the Word, prayer. These are largely the ordinary instruments of Christian formation. The battle is real; the weapons are  not exotic.
  
1 Peter 5:8 describes the adversary as one who "prowls around like a roaring lion looking for  someone to devour." The response is not terror or elaborate ritual. It is this: "resist him, standing firm in the faith." James 4:7 echoes: "Submit yourselves to God. Resist the devil, and he will flee from you."
  
The ordinary means of spiritual warfare are: confession, prayer, Scripture, community, and the straightforward exercise of faith. These are not exciting. They are not dramatic. But they are what the tradition has consistently commended, and they have a record of effectiveness that unusual and dramatic practices often do not.
  
The discernment question — whether a particular struggle is spiritual warfare versus psychological difficulty versus ordinary human weakness — is important and not always easy to answer. A general principle: the same practices that address one tend to address all three. Formation, prayer, community, and honest self-examination serve in every case.`,
  },

  {
    title:        "Angels in Scripture — what the Bible actually says",
    category:     "advanced",
    scripture_ref: "Hebrews 13:2, Daniel 10:12-14, Psalm 91:11",
    source:       "Kairos curated",
    tags:         ["angels", "spiritual_warfare", "discernment", "mystical_experience"],
    audience:     ["growing", "mature"],
    mode_affinity: ["CLARITY", "APOLOGETICS"],
    weight:       1,
    content: `Angels appear throughout Scripture — announcing births, delivering messages, protecting individuals, engaging in spiritual conflict, ministering to the exhausted  (Elijah), accompanying the dying, and surrounding God's throne in awe. They are a  significant part of the biblical world.
  
What the Bible presents about angels: they are created beings, not divine. They are  messengers (the Greek word angelos means messenger). They can appear in human form without being immediately recognisable — Hebrews 13:2 suggests some have "entertained angels without  knowing it." They are real, active in the world, and involved in both protection and in the  larger spiritual conflict Paul describes in Ephesians 6.
  
What the Bible does not support: praying to angels, seeking their guidance independently of  God, treating individual angel encounters as ongoing relationships to cultivate, or the  elaborate angelology that has developed in some popular spirituality. Angels consistently  redirect attention toward God — the ones in Revelation who are worshipped immediately refuse it.
  
Daniel 10:12-14 is one of the most striking passages regarding angels in conflict — a  messenger delayed 21 days by spiritual opposition before arriving. This text is often cited  in discussions of spiritual warfare and the relationship between prayer and heavenly activity. It is honest to say the text is genuinely mysterious and any interpretation requires humility.
  
The practical conclusion: angels are real, active, and sometimes involved in human experience. They are not to be sought directly or relied upon as personal guides. They serve  the purposes of God, and encounter with them — should it occur — should produce greater awe  of God, not fascination with the angel.`,
  },

  {
    title:        "Suffering and holiness — what long pain produces",
    category:     "advanced",
    scripture_ref: "Romans 5:3-5, Hebrews 12:10-11, 1 Peter 4:1-2",
    source:       "Kairos curated",
    tags:         ["suffering", "sanctification", "formation", "patience", "holiness"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "PASTORAL", "LAMENT"],
    weight:       2,
    content: `There is a kind of holiness that can only be formed by extended suffering. Not the dramatic crisis but the long sustained difficulty — chronic pain, years of unanswered prayer, a grief that does not lift, a circumstance that does not change. The kind of  suffering that outlasts the initial spiritual resources you brought to it and forces you to find something deeper.
  
Hebrews 12:10-11 is remarkably direct: "God disciplines us for our good, in order that we may  share in his holiness. No discipline seems pleasant at the time, but painful. Later on,  however, it produces a harvest of righteousness and peace for those who have been trained by it."
  
Trained by it. The suffering is a teacher. Not a punishment, not evidence of God's absence or  displeasure — a training in the holiness that cannot be developed in ease. The fruit is  described: righteousness and peace. The particular kind of peace that only people who have suffered long tend to carry — not the absence of difficulty, but an interior settledness that is no longer dependent on circumstances being manageable.
  
1 Peter 4:1-2 adds a remarkable phrase: "Therefore, since Christ suffered in his body, arm yourselves also with the same attitude, because whoever suffers in the body is done with sin. " Suffering, paradoxically, burns away the attachments to lesser things that sin offers. When  you have been in the furnace long enough, the comforts that once tempted you lose their power.
  
This is not a theology that seeks suffering or presents it as good in itself. It is a  theology that refuses to waste it — that insists suffering in the hands of God becomes something.`,
  },

  {
    title:        "Death and dying — a Christian account of the final passage",
    category:     "advanced",
    scripture_ref: "Psalm 23:4, 1 Corinthians 15:54-55, Philippians 1:21-23",
    source:       "Kairos curated",
    tags:         ["death", "dying", "grief_death", "resurrection", "eternal_life"],
    audience:     ["anyone", "growing", "mature"],
    mode_affinity: ["PASTORAL", "LAMENT", "CLARITY"],
    weight:       2,
    content: `Death is the one certainty everyone shares and the one subject most modern cultures handle worst. We have medicalised and institutionalised it, moving it largely  out of sight, and the result is that most people arrive at the end of life — their own or  someone they love — without any real preparation.
  
The Christian tradition has always understood death differently. Not as the worst thing, and not as nothing — but as a passage, real and weighty, that those who are held by Christ need not face in terror.
  
Psalm 23:4 — "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me" — places the emphasis not on the absence of the valley but on the  presence of the shepherd within it. The valley is real. The shadow is real. And the shepherd does not leave it.
  
Paul in Philippians 1:21-23 expresses something more startling: "For to me, to live is Christ  and to die is gain. I am torn between the two: I desire to depart and be with Christ, which  is better by far." He is not performing courage. He is describing a genuine orientation  toward death as passage to something better, not annihilation.
  
1 Corinthians 15's great hymn of resurrection ends: "Where, O death, is your victory? Where, O death, is your sting?" The sting is not denied — death is real and costs real grief. But it is not final, and the finality is what made it sting.
  
For those accompanying someone who is dying: presence, honesty, and the willingness to name  both the grief and the hope are more valuable than any formula.`,
  },

  {
    title:        "Questions about the afterlife — what Scripture does and does not say",
    category:     "advanced",
    scripture_ref: "John 14:2-3, Revelation 21:1-5, 1 Corinthians 15:42-44",
    source:       "Kairos curated",
    tags:         ["heaven", "eternal_life", "death", "resurrection",  "biblical_interpretation"],
    audience:     ["anyone", "growing", "mature"],
    mode_affinity: ["CLARITY", "APOLOGETICS", "PASTORAL"],
    weight:       1,
    content: `The popular image of heaven — clouds, harps, disembodied souls floating in eternal worship — is largely absent from Scripture. The biblical picture is considerably  more concrete, more physical, and more interesting.
  
1 Corinthians 15 describes the resurrection body not as ghostly but as transformed — "sown a natural body, raised a spiritual body," where "spiritual" does not mean immaterial but  something like "animated by the Spirit." The resurrected Jesus ate, was touched, was recognised — and also moved through walls and ascended. This is not a tidy category.
  
Revelation 21 describes the New Jerusalem coming down to earth — not souls going up to heaven, but heaven coming to a renewed earth. "God's dwelling place is now among the people,  and he will dwell with them." The direction of movement is significant: the ultimate destination is a renewed physical creation, not an escape from physicality.
  
John 14:2-3 gives Jesus' own promise: "My Father's house has many rooms; if that were not so,  would I have told you that I am going there to prepare a place for you?" The emphasis is on  presence — being with Jesus — more than on a detailed geography of what that will look like.
  
What Scripture does not settle with clarity: the state of the dead before resurrection, the  precise relationship between present heaven and the final new creation, questions about those  who have never heard the gospel.
  
What it does settle: death is not the end. The resurrection of Jesus is the first instalment of a resurrection that will eventually include all who are in Him. The final destination is not escape from the world but the world made right.`,
  },

  {
    title:        "Experiencing union with God — what the mystics describe",
    category:     "advanced",
    scripture_ref: "John 17:21-23, Galatians 2:20, Colossians 3:3",
    source:       "Kairos curated",
    tags:         ["union_with_god", "contemplative", "mystical_experience", "formation",  "prayer_advanced"],
    audience:     ["mature"],
    mode_affinity: ["FORMATION", "PASTORAL", "CLARITY"],
    weight:       1,
    content: `The language of union with God runs throughout the Christian mystical tradition  but is grounded in Scripture itself. Jesus prays in John 17 that his followers would be  "one as we are one — I in them and you in me." Paul says in Galatians 2:20: "I have been crucified with Christ and I no longer live, but Christ lives in me." Colossians 3:3 states: "Your life is now hidden with Christ in God."
  
This is not metaphor. The New Testament genuinely claims that through the indwelling Spirit, a believer participates in a real union with Christ — not a merger in which individuality is  lost, but an intimate indwelling in which God and the human person are genuinely together.
  
The mystics of the Christian tradition — Augustine, Bernard of Clairvaux, Julian of Norwich, John of the Cross, Thomas Merton — describe the deepening of this union as the goal of the  contemplative life. The direction of formation is always toward greater intimacy, greater  surrender, greater conformation to Christ.
  
What distinguishes Christian mysticism from other traditions is the relational and personal  character of union. It is not absorption into an impersonal absolute. It is intimacy with a  Person. The self is not dissolved but purified — becoming more fully what it was created to  be as it is more fully indwelt by the One who made it.
  
The ordinary believer may not use mystical language, but they are participating in this  reality. Every act of prayer, every moment of genuine trust, every surrender of the will is  movement in the direction of what John 17 describes. The mystics are not a special category —  they are people who pursued intentionally what is available to all.`,
  },

// ── DOMAIN 3: ADDICTION & STRUGGLE (8 entries) ──────────────────────────────
// Staged by recovery phase. Grace-first, shame-aware, practically grounded.

  {
    title:        "When you think you might have a problem — the awareness stage",
    category:     "pastoral",
    scripture_ref: "Luke 15:17, Proverbs 20:1, Romans 6:16",
    source:       "Kairos curated",
    tags:         ["addiction", "awareness", "shame", "repentance", "formation"],
    audience:     ["anyone"],
    mode_affinity: ["PASTORAL", "COURAGE"],
    weight:       2,
    content: `There is a moment that comes before the decision to change — the moment of seeing. The Prodigal Son "came to himself." He saw his situation clearly, perhaps for the first time in a long time. That moment of honest seeing is not yet recovery. But it is  the beginning of the path toward it.
  
If you are reading this and something has surfaced — a pattern you keep returning to, a habit  that has gotten bigger than you intended, a behaviour you hide from people who know you —  that awareness is not something to suppress or minimise. It is something to honour. Many people live for years without it.
  
Romans 6:16 asks a stark question: "Don't you know that when you offer yourselves to someone as obedient slaves, you are slaves of the one you obey?" Dependency and bondage are real. They do not begin at a dramatic low point — they begin with a thousand small choices that seemed manageable, until the thing began to choose for you.
  
The first step is not willpower. It is honesty — with yourself, with God, and eventually with  at least one other person. The hiding is often more damaging than the thing itself. Shame  grows in secrecy. Light is what shrinks it.
  
You do not need to have everything figured out. You do not need to be ready to quit  completely right now. You need to be willing to look at the truth of what is happening without immediately explaining it away. That willingness is where every genuine story of  recovery begins.`,
  },

  {
    title:        "The shame cycle in addiction — why willpower alone does not work",
    category:     "pastoral",
    scripture_ref: "Romans 7:18-19, 2 Corinthians 12:9, Hebrews 4:15-16",
    source:       "Kairos curated",
    tags:         ["addiction", "shame_cycle", "shame", "recovery", "grace"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["PASTORAL", "FORMATION", "LAMENT"],
    weight:       2,
    content: `The shame cycle is one of the most powerful sustaining mechanisms in addiction and compulsive behaviour. It runs roughly like this: struggle and give in, feel profound  shame, resolve to try harder, struggle and give in again, feel deeper shame — and the  shame itself becomes a trigger for the behaviour it was meant to prevent. The weight of  having failed again is precisely what drives a return to the relief the behaviour  provides.
  
This is why simple willpower approaches — resolve harder, be more disciplined, pray more — so  often fail. They address the surface without touching the underlying mechanism. And they add shame without providing an alternative.
  
Paul's description in Romans 7:18-19 is clinical in its accuracy: "I know that nothing good  lives in me, that is, in my sinful nature. For I have the desire to do what is good, but I cannot carry it out. For I do not do the good I want to do, but the evil I do not want to do  — this I keep on doing." This is not weak faith speaking. This is an honest description of the gap between intention and action that persists even in people deeply committed to change.
  
The breakthrough in Romans 7 comes at verse 25 and continues into Romans 8: not more effort, but a different source of life. "Through Christ Jesus the law of the Spirit who gives life  has set you free from the law of sin and death."
  
The therapeutic insight and the theological insight converge here: shame must be interrupted,  not increased. What interrupts shame is grace — specific, honest, received grace that says "you are not your worst patterns, and God has not abandoned you in this."
  
Hebrews 4:16 — "Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need" — is an invitation to bring the  exact place of struggle directly to God, without performing recovery you have not yet  experienced.`,
  },

  {
    title:        "Starting over — when recovery means beginning again after relapse",
    category:     "pastoral",
    scripture_ref: "Proverbs 24:16, Micah 7:8, Lamentations 3:22-23",
    source:       "Kairos curated",
    tags:         ["addiction", "relapse", "recovery", "grace", "repentance"],
    audience:     ["anyone"],
    mode_affinity: ["PASTORAL", "COURAGE", "FORMATION"],
    weight:       2,
    content: `Relapse is not the end of the story. In most genuine recovery journeys it is part of the story — not a sign that change is impossible, but a signal that something in  the approach needs attention and that the work is continuing.
  
Proverbs 24:16 is a verse about the righteous person, not the addict — but its pattern applies: "For though the righteous fall seven times, they rise again." The rising is the  point. Not the falling, which is assumed. The moral character being described is the refusal to stay down.
  
Micah 7:8 has one of the most defiant statements in the prophetic literature: "Do not gloat  over me, my enemy! Though I have fallen, I will rise. Though I sit in darkness, the Lord will  be my light." The fall is acknowledged without apology, and the rising is declared with  confidence — not confidence in one's own ability to sustain it, but confidence in what God does in the darkness.
  
Relapse is most dangerous when it produces the conclusion: "I will never change. This is who I am. I might as well stop trying." That conclusion is a lie, and it is one the shame cycle depends on. The person who returns to treatment after relapse, or returns to honest conversation with a trusted friend, or simply returns to prayer — is not proving failure. They are proving that the desire for freedom is still alive.
  
Lamentations 3:22-23 is the anchor: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning." Every morning. Not every morning you have been sufficiently disciplined. Every morning.`,
  },

  {
    title:        "The spiritual roots of addiction — what it is really searching for",
    category:     "pastoral",
    scripture_ref: "John 4:13-14, Isaiah 55:1-2, Psalm 42:1-2",
    source:       "Kairos curated",
    tags:         ["addiction", "addiction_behavioral", "addiction_substance", "spiritual_dryness", "formation"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["PASTORAL", "CLARITY", "FORMATION"],
    weight:       2,
    content: `Every addiction is, at its root, a search for something legitimate pursued through an illegitimate means. The person who becomes dependent on alcohol is usually not seeking drunkenness — they are seeking relief from anxiety, numbing of pain, or a moment  of ease they cannot find elsewhere. The person caught in pornography is often seeking  intimacy or the relief of loneliness. The person trapped in approval-seeking is searching  for the security of being loved.
  
Jesus' conversation with the woman at the well in John 4 traces this pattern. She has had  five husbands and is with someone who is not her husband. Jesus does not condemn this. He  says: "Everyone who drinks this water will be thirsty again, but whoever drinks the water I  give them will never thirst." He identifies the pattern — drinking from wells that cannot  finally satisfy — and points to the source that can.
  
Isaiah 55:1-2 extends the same image: "Come, all you who are thirsty, come to the waters...  Why spend money on what is not bread, and your labour on what does not satisfy?" The human soul has genuine thirsts. The tragedy of addiction is not that it offers relief — it is that  it offers relief that does not last, from a well that requires returning to with increasing  frequency.
  
Psalm 42:1-2 is the honest description of the thirst: "As the deer pants for streams of  water, so my soul pants for you, my God. My soul thirsts for God, for the living God."
  
This frame does not excuse addiction or minimise its destruction. But it humanises the person  caught in it — and points toward healing that addresses the root rather than only the symptom. `,
  },

  {
    title:        "Recovery and community — why you cannot do this alone",
    category:     "pastoral",
    scripture_ref: "Galatians 6:1-2, Ecclesiastes 4:9-10, James 5:16",
    source:       "Kairos curated",
    tags:         ["addiction", "recovery", "community", "accountability", "shame"],
    audience:     ["anyone"],
    mode_affinity: ["PASTORAL", "FORMATION", "COURAGE"],
    weight:       1,
    content: `One of the most consistently supported findings in addiction research is that  isolation sustains addiction while community supports recovery. This is not a modern discovery — it is deeply embedded in what the New Testament says about how human beings are designed to function.
  
Galatians 6:1-2 describes what the community of faith is supposed to be for someone caught in  a pattern: "you who live by the Spirit should restore that person gently." Not condemn, not  expose, not shame. Restore. Gently. The goal is a person's return to wholeness, not the  satisfaction of having named their failure.
  
But that community requires honesty from the person in struggle. James 5:16 makes the  connection explicit: "Confess your sins to each other and pray for each other so that you may  be healed." The healing is connected to the confession. Hidden struggle feeds on secrecy.  When it is brought into honest relationship — named, prayed over, accompanied — something  breaks that willpower alone cannot break.
  
Ecclesiastes 4:9-10 is the practical reality: "Two are better than one... if either of them  falls down, one can help the other up. But pity anyone who falls and has no one to help them up."
  
The fear that keeps people from community in addiction is usually shame — the terror of being  fully known and then rejected. But the communities where people have found genuine recovery  are consistently communities where someone went first, where the culture says you are known  and you belong here anyway. That culture must be built, not assumed.`,
  },

  {
    title:        "Freedom and maintenance — sustaining recovery over the long term",
    category:     "formation",
    scripture_ref: "Galatians 5:1, 1 Corinthians 10:12-13, Colossians 3:1-3",
    source:       "Kairos curated",
    tags:         ["addiction", "recovery", "formation", "spiritual_discipline", "identity"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "PASTORAL", "COURAGE"],
    weight:       1,
    content: `The transition from active recovery — when the struggle is acute and support is  intensive — to sustained freedom is its own challenge. Many people who have won  significant battles with addiction or compulsive behaviour find themselves unexpectedly  vulnerable months or years later, when the sense of danger has reduced and the structures  of support have loosened.
  
Paul warns in 1 Corinthians 10:12: "So, if you think you are standing firm, be careful that  you don't fall!" The verse is not designed to produce anxiety — it is designed to maintain the vigilance and humility that protected the person in the first place.
  
Galatians 5:1 gives the positive frame: "It is for freedom that Christ has set us free. Stand  firm, then, and do not let yourselves be burdened again by a yoke of slavery." Freedom requires active maintenance. It is not a state arrived at that then sustains itself without attention.
  
The practical architecture of long-term freedom usually includes: continued honest community (not dropping accountability when things feel stable), a clear understanding of personal  triggers and high-risk situations, ongoing practices of formation that address the root  thirsts the behaviour was meeting, and a life that is genuinely ordered toward meaning rather  than just the avoidance of relapse.
  
Colossians 3:1-3 points toward identity as the deepest anchor: "Set your minds on things above... For you died, and your life is now hidden with Christ in God." The sustained freedom is increasingly rooted not in the effort to avoid a behaviour but in a deepening sense of who you are — which makes the old behaviour increasingly incompatible with the life you are actually living.`,
  },

  {
    title:        "Pornography and sexual struggle — a pastoral account",
    category:     "pastoral",
    scripture_ref: "Matthew 5:28, 1 Corinthians 6:18-20, Romans 6:12-13",
    source:       "Kairos curated",
    tags:         ["addiction_behavioral", "shame_cycle", "sin", "recovery", "identity"],
    audience:     ["growing", "mature"],
    mode_affinity: ["PASTORAL", "FORMATION", "COURAGE"],
    weight:       2,
    content: `Sexual struggle — and pornography in particular — is one of the most common and  most shame-laden areas that people carry to God, and one of the least honestly addressed in most faith communities. The silence is its own problem: it allows the false belief to  persist that this struggle is uniquely shameful, uniquely disqualifying, or evidence of  particularly deep spiritual failure.
  
None of those things is true. But the struggle is real, the effects are real, and the  spiritual and relational harm it causes is real. 1 Corinthians 6:18-20 speaks of sexual sin  as having a particular kind of damage — it is against the body, which is a temple of the Holy  Spirit. That is not language designed to increase shame; it is language designed to  communicate the seriousness and the dignity of what is at stake.
  
The shame cycle described elsewhere runs particularly viciously here. The intensity of shame after sexual failure is often what drives the return — the momentary relief of the behaviour  breaking the unbearable weight of the self-condemnation. This is why willpower and shame approaches consistently fail, and why grace-based communities that speak honestly about sexual struggle tend to produce more genuine recovery.
  
The practical path forward involves several things together: honest confession to God and at least one trusted person, professional support when the behaviour is compulsive (this is real and legitimate), building a rule of life that addresses isolation and the conditions that increase vulnerability, and a deepening identity in Christ that makes the behaviour increasingly discordant with who you are becoming.
  
Romans 6:12-13 — "do not let sin reign in your mortal body... offer yourselves to God" — is  an active, ongoing posture, not a single decision. It is renewed daily.`,
  },

  {
    title:        "Emotional addiction — the patterns that are harder to name",
    category:     "pastoral",
    scripture_ref: "Romans 12:2, Philippians 4:11, Proverbs 14:30",
    source:       "Kairos curated",
    tags:         ["addiction_emotional", "anxiety", "formation", "shame_cycle", "discernment"],
    audience:     ["growing", "mature"],
    mode_affinity: ["PASTORAL", "FORMATION", "CLARITY"],
    weight:       1,
    content: `Not all compulsive patterns involve substances or even specific behaviours.  Some of the most powerful addictions are emotional — patterns of relating to the world through a particular emotional register that becomes habitual, even when it causes harm.
  
The person addicted to anxiety rehearses worst-case scenarios compulsively, even when they know it is unhelpful — because the anxiety provides a sense of control over uncertain outcomes. The person addicted to conflict creates relational instability because the drama of repair feels more real than peaceful connection. The person addicted to approval-seeking  structures their entire life around managing how others see them, at the cost of ever knowing  who they actually are.
  
These patterns are real addictions in the sense that they offer short-term relief from deeper  pain while reinforcing the conditions that make the pain worse. And they are harder to identify than substance dependence, because they can masquerade as virtues — the anxiety as conscientiousness, the conflict-seeking as passion, the approval-seeking as care for others.
  
Romans 12:2 describes the work of renewal as happening in the mind — the patterns of thought and emotional response that shape everything downstream. Paul says this renewal produces the  ability to "test and approve what God's will is." The renewed mind can see more clearly.
  
Philippians 4:11 says Paul learned contentment — implying it was not natural, but acquired through practice. Contentment is the opposite of emotional addiction: it is the freedom to be present to what actually is, rather than compulsively managing it toward a preferred state.`,
  },

// ── DOMAIN 4: UNANSWERED PRAYER (7 entries) ──────────────────────────────────
// Pastoral and formation angles. Different from the existing apologetics entry.

  {
    title:        "When you have prayed for years without an answer",
    category:     "pastoral",
    scripture_ref: "Psalm 13, Luke 18:1-8, 2 Corinthians 12:8-9",
    source:       "Kairos curated",
    tags:         ["unanswered_prayer", "prayer", "faith", "suffering", "lament"],
    audience:     ["anyone", "growing", "mature"],
    mode_affinity: ["PASTORAL", "LAMENT", "FORMATION"],
    weight:       2,
    content: `Psalm 13 asks the question that long-unanswered prayer produces: "How long,  Lord? Will you forget me forever? How long will you hide your face from me?" This is not a moment of weak faith. It is David, the man described as after God's own heart, writing  from within years of praying and not receiving what he asked for.
  
The psalm does not resolve the question — it does not explain why God has been silent or promise that an answer is coming soon. It moves from lament to a declaration of trust: "But I trust in your unfailing love; my heart rejoices in your salvation." The movement is not from  doubt to certainty but from doubt to chosen trust.
  
Jesus tells the parable of the persistent widow specifically for "those who should always  pray and not give up." The widow's persistence is not about changing God's mind — it is about  maintaining the relationship and the posture of expectation in the face of apparent  unresponsiveness. The practice of continuing to pray is itself formative, regardless of when the answer comes.
  
Paul prayed three times to have his thorn removed. He received instead something different:  "My grace is sufficient for you, for my power is made perfect in weakness." Not the removal  of the difficulty — the presence of grace within it. This is not always the answer we want.  It is often a better one.
  
The hardest theology in unanswered prayer is this: God is good, God hears, and God sometimes says no or not yet for reasons we cannot fully see. Holding all three of those together without collapsing any of them is one of the most demanding things faith asks of us.`,
  },

  {
    title:        "The difference between unanswered prayer and delayed answer",
    category:     "pastoral",
    scripture_ref: "Daniel 10:12, John 11:6, Isaiah 46:10",
    source:       "Kairos curated",
    tags:         ["unanswered_prayer", "faith", "sovereignty", "patience", "waiting"],
    audience:     ["growing", "mature"],
    mode_affinity: ["PASTORAL", "CLARITY", "FORMATION"],
    weight:       1,
    content: `Daniel 10:12 contains a remarkable disclosure: the messenger angel tells Daniel, "Since the first day that you set your mind to gain understanding and to humble yourself before your God, your words were heard." Day one. The prayer was heard immediately. The answer was delayed three weeks because of spiritual opposition in the  heavenly realm — opposition eventually overcome by Michael.
  
This text does not resolve all questions about unanswered prayer, but it does disrupt a  common assumption: that silence means no one is listening. Sometimes the silence between a prayer and its answer is full of activity invisible to the one praying.
  
John 11:6 contains one of the most striking narrative details in the gospel: "When he heard  that Lazarus was sick, he stayed where he was two more days." Jesus delayed on purpose. He let what could have been prevented happen. The delay was not indifference — it was  preparation for a demonstration of power that would not have been possible without it.
  
Isaiah 46:10 grounds this in God's larger perspective: "I make known the end from the  beginning, from ancient times, what is still to come." The delay is situated within a story  whose outcome God already knows.
  
None of this removes the pain of waiting. But it provides a frame — that between a prayer and  its answer, something may be happening that is simply not visible. The practice is the same  as in Psalm 13: maintain the relationship, keep praying, refuse to conclude from the silence that the silence is the whole truth.`,
  },

  {
    title:        "Praying when you are angry at God",
    category:     "pastoral",
    scripture_ref: "Psalm 44:23-24, Lamentations 3:1-9, Job 13:3",
    source:       "Kairos curated",
    tags:         ["lament", "unanswered_prayer", "anger", "prayer", "grief"],
    audience:     ["anyone"],
    mode_affinity: ["LAMENT", "PASTORAL", "COURAGE"],
    weight:       2,
    content: `There is a long tradition in Scripture of praying in anger — of bringing fury  and accusation directly to God without softening it first. Psalm 44 says: "Awake, Lord!  Why do you sleep? Rouse yourself! Do not reject us forever. Why do you hide your face and  forget our misery and oppression?" This is confrontational. It is accusing God of  inattention. And it is canonical Scripture — preserved as a legitimate form of prayer.
  
Lamentations opens with even more direct confrontation: the writer describes God as enemy, as  one who has walled him in, as one who has driven him away in darkness. This is not hyperbole for effect — it is the honest description of what the experience of God felt like in that moment.
  
Job's boldness is remarkable: "I desire to speak to the Almighty and to argue my case with God." He refuses to pretend his experience is different from what it is. He refuses to  perform piety in the face of what feels like abandonment. And God, at the end, says Job has  spoken what is right — while rebuking the friends who offered tidy theological explanations.
  
The theological conviction underlying this tradition is that God is large enough to receive  anger, honest enough to prefer it over performance, and present enough to be addressed rather  than only spoken about. Anger directed toward God is still relationship — it is oriented toward Him, even in its fury. What breaks relationship is not anger but the turning away that refuses to speak at all.
  
If you are angry at God: say so, directly. He has heard this before. It does not endanger  your faith. It may be the most honest prayer you have ever prayed.`,
  },

  {
    title:        "What to do when prayer feels hollow and pointless",
    category:     "pastoral",
    scripture_ref: "Romans 8:26-27, Matthew 26:39-44, Mark 14:32-36",
    source:       "Kairos curated",
    tags:         ["prayer", "spiritual_dryness", "unanswered_prayer", "formation", "faith"],
    audience:     ["growing", "mature"],
    mode_affinity: ["PASTORAL", "FORMATION", "LAMENT"],
    weight:       1,
    content: `There are seasons when prayer feels like talking into an empty room. The words form and release and disappear. No response, no presence, no sense that anything is happening. The motions continue — the habit remains — but the life seems to have gone out of it.
  
Romans 8:26 provides a theology for exactly this experience: "In the same way, the Spirit  helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans." The verse assumes a condition — not knowing what  to pray, being too weak to pray well — and provides an answer that does not require the  person to generate something they do not have. The Spirit prays in the space where the person  cannot.
  
Jesus in Gethsemane prayed the same prayer three times. "My Father, if it is possible, may this cup be taken from me." He repeated Himself. He asked the same thing without apparent answer. And then: "Yet not as I will, but as you will." The pattern is not efficiency or  eloquence. It is persistence in relationship even when the outcome is not what you asked for.
  
When prayer feels hollow: do not try to generate a feeling you do not have. Show up. Say the honest thing — including "I don't know how to pray right now." Read a Psalm aloud as your own words. Sit in silence and trust that the Spirit is doing something in the space that your words cannot. The discipline of continuing to show up through hollowness is one of the most formative things the spiritual life asks — because it builds faith that is not dependent on feeling.`,
  },

  {
    title:        "Accepting an answer you did not ask for",
    category:     "pastoral",
    scripture_ref: "2 Corinthians 12:8-10, Philippians 4:11-12, Romans 8:28",
    source:       "Kairos curated",
    tags:         ["unanswered_prayer", "sovereignty", "suffering", "acceptance",  "formation"],
    audience:     ["growing", "mature"],
    mode_affinity: ["PASTORAL", "FORMATION", "LAMENT"],
    weight:       1,
    content: `Some of the most important prayers in Scripture received answers that were not what was asked for. Paul asked for the thorn to be removed. He received grace to endure it. Mary and Martha asked for Jesus to come quickly. He arrived after Lazarus died — and  raised him. The disciples asked to remain in positions of honour. They were told that  greatness in the kingdom looked like service.
  
The pattern is consistent enough to be worth naming: God often answers the deeper need underneath the surface request, even when the surface request is not granted. Paul did not  need the thorn removed — he needed to learn that Christ's strength operates precisely in the space where Paul's own strength was absent. That knowledge was more valuable than comfort would have been.
  
This does not mean we should stop asking, or that prayer is really just a spiritual exercise with no actual effect. It means the One to whom we pray is wiser about what we need than we are — which is simultaneously reassuring and difficult.
  
Philippians 4:11-12 describes Paul having "learned" contentment — not received it  automatically, but learned it through the experience of having and not having, of abundance  and need. The learning happened through the lived experience of receiving different answers  than he asked for.
  
The acceptance Paul describes is not passive resignation. It is active trust — a choice, often repeated, to hold that God is good even when the specific thing asked for was not given. Romans 8:28 provides the frame: not that all things are good, but that all things work together for good for those who love God. The working takes time. It is not always visible  from inside the thing.`,
  },

  {
    title:        "Intercessory prayer — praying for others when they cannot pray for  themselves",
    category:     "pastoral",
    scripture_ref: "Job 42:8, Exodus 17:11-13, Romans 8:34",
    source:       "Kairos curated",
    tags:         ["prayer", "unanswered_prayer", "community", "suffering", "faith"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["PASTORAL", "FORMATION", "COURAGE"],
    weight:       1,
    content: `Intercession — praying on behalf of someone else — is one of the most  sacrificial and most mysterious forms of prayer. It is the act of using one's own access to God on behalf of someone who may not have access, may not yet want it, or may be too broken to pray for themselves.
  
The image of Aaron and Hur holding Moses's arms up during the battle in Exodus 17 is one of  Scripture's most vivid pictures of intercession: someone else's arms grow weary, and the community comes alongside to hold them up so the battle continues. There are people in every  community who are too exhausted to hold their own arms up. Intercession is the practice of doing it for them.
  
Job 42:8 is remarkable: God instructs Eliphaz and his friends to ask Job to pray for them —  Job who has suffered, who has complained, who has demanded an audience with God. God calls him to intercede for the friends who wrongly counselled him. And it is in the act of praying  for them that Job's own restoration begins.
  
Romans 8:34 gives the deepest foundation for intercession: Christ himself is "at the right hand of God and is also interceding for us." The intercession of believers participates in  the ongoing intercession of Christ. It is not independent activity — it is joining something already happening.
  
What intercession requires practically: specificity (naming the person, naming what you are  asking for), persistence (Luke 18:1 — pray and not give up), and release (leaving the outcome  to God while continuing to ask). The peace that comes from genuine intercession is often less  about the circumstances changing than about the posture of bringing them to the One who holds  them.`,
  },

  {
    title:        "Learning to pray without performing — simplicity in prayer",
    category:     "formation",
    scripture_ref: "Matthew 6:7-8, Luke 11:1, 1 Kings 19:12",
    source:       "Kairos curated",
    tags:         ["prayer", "prayer_beginner", "formation", "simplicity", "spiritual_discipline"],
    audience:     ["anyone", "new_believer", "growing"],
    mode_affinity: ["FORMATION", "PASTORAL"],
    weight:       1,
    content: `One of the most consistent barriers to honest prayer is the belief that prayer requires a certain kind of language, length, or emotional state to be valid. Many people  have spent years performing prayer rather than praying — constructing words that sound appropriately reverent, sustained by a discipline of form rather than a relationship of honesty.
  
Jesus' instruction in Matthew 6:7-8 is disarming: "When you pray, do not keep on babbling  like pagans, for they think they will be heard because of their many words. Do not be like them, for your Father knows what you need before you ask him." The Father knows before you  speak. The prayer is not informing God of something He does not know — it is a relational  act, not a communication of information.
  
When the disciples asked Jesus to teach them to pray, He gave them something short — what we call the Lord's Prayer — that moves through several postures quickly. It is not a template  for every prayer; it is a shape. It says: something like this, not specifically this.
  
1 Kings 19 records God speaking to Elijah not in the wind, not in the earthquake, not in the fire — but in a "gentle whisper" or "still small voice." The encounter with God is often less dramatic than we expect, and requires a quietness and simplicity to receive.
  
Practical simplicity in prayer: speak in your own words. Say the actual thing, not the spiritual version of the thing. Short is often more honest than long. The person who says "God, I'm scared, I don't know what to do, help" has prayed. The performance is not the prayer.`,
  },

// ── DOMAIN 5: SOCIAL FAITH (10 entries) ──────────────────────────────────────
// Justice, community, conflict, service, forgiveness in relationships,
// leadership, family, cultural pressures on faith.

  {
    title:        "Justice and mercy — the call to care what God cares about",
    category:     "pastoral",
    scripture_ref: "Micah 6:8, Amos 5:21-24, Matthew 23:23",
    source:       "Kairos curated",
    tags:         ["justice", "mercy", "service", "formation", "calling"],
    audience:     ["anyone", "growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY", "COURAGE"],
    weight:       2,
    content: `Micah 6:8 is one of the most quoted verses in the prophetic tradition for a  reason: it distils thousands of pages of prophetic concern into three requirements. "Act justly, love mercy, and walk humbly with your God." Justice, mercy, and humility — held together.
  
The prophets were unsparing about religious communities that maintained the forms of worship while ignoring the poor and the oppressed. Amos 5:21-24 has God saying: "I hate, I despise  your religious festivals... Away with the noise of your songs!... But let justice roll on  like a river, righteousness like a never-failing stream." The worship was genuine — and  unacceptable, because it coexisted with injustice.
  
Jesus echoes this in Matthew 23:23 — "You have neglected the more important matters of the law — justice, mercy and faithfulness." He does not say the other things do not matter. He  says these are more important.
  
The social dimension of Christian faith is not an addition to the gospel — it is intrinsic to  it. The God who has reconciled broken relationships also cares about broken social conditions. The Person who notices every sparrow also notices the poor person at the gate named Lazarus.
  
This is not a political programme — it is a spiritual posture. The question is not primarily "what legislation should I support" but "whose situation am I paying attention to? Who am I actually helping? What does love require of me in the specific neighbourhood, workplace, and  community where God has placed me?"`,
  },

  {
    title:        "Navigating conflict with a fellow believer",
    category:     "pastoral",
    scripture_ref: "Matthew 18:15-17, Ephesians 4:15, Proverbs 15:1",
    source:       "Kairos curated",
    tags:         ["conflict", "relationships", "community", "forgiveness", "courage"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["COURAGE", "PASTORAL", "CLARITY"],
    weight:       1,
    content: `Jesus gave remarkably specific instructions about what to do when another  person in the community has wronged you — instructions almost universally ignored. Matthew 18:15: "If your brother or sister sins against you, go and point out their fault, just between the two of you." Go. Directly. Privately. First.
  
The instruction is not: tell three other people, then go. Not: pray about it for months until  the resentment has calcified. Not: avoid the person and let the fracture spread silently through the community. Go directly. This is uncomfortable. It is also the most loving and effective approach.
  
Ephesians 4:15 frames the whole enterprise: "speaking the truth in love, we will grow to become in every way the mature body of him who is the head, that is, Christ." Truth in love.  Not truth weaponised, not love that avoids truth. Both, held together, in the specific act of  going to the person.
  
The failure mode in many Christian communities is the indirect handling of conflict — the  prayer request that is actually gossip, the concern raised to a mutual friend, the slow  distancing. These feel safer because they avoid the discomfort of direct confrontation. But  they cost enormously — in relationships, in community integrity, and in the person's own spiritual formation.
  
Proverbs 15:1 is practical: "A gentle answer turns away wrath, but a harsh word stirs up anger." The manner of the conversation matters as much as the content. The goal is not to win but to restore.`,
  },

  {
    title:        "Serving others — why service is not about you",
    category:     "formation",
    scripture_ref: "Mark 10:42-45, John 13:12-17, Matthew 25:40",
    source:       "Kairos curated",
    tags:         ["service", "calling", "formation", "justice", "community"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["FORMATION", "CLARITY"],
    weight:       1,
    content: `Jesus' description of greatness in the kingdom is one of His most repeated and most consistently ignored teachings. Mark 10:43-45: "Whoever wants to become great among  you must be your servant... even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many."
  
He then enacted it. John 13 — the night before His death — has Jesus washing the disciples'  feet. A task for the lowest servant, performed by the One with all authority. "Do you  understand what I have done for you?... I have set you an example that you should do as I  have done for you."
  
Matthew 25:40 extends this outward: "Whatever you did for one of the least of these brothers and sisters of mine, you did for me." The person served is identified with Christ. The  service rendered to a hungry person, a thirsty person, a stranger, a prisoner — is rendered  to Christ.
  
Service in the Christian tradition is not self-improvement through good works. It is not primarily about the experience the server gains. It is about the person served — their  dignity, their need, their identity as someone Christ inhabits. When the focus shifts from "what this does for my growth" to "what this person actually needs," service becomes what Jesus described.
  
The formation dimension is real but secondary: people who serve over long periods  consistently report that it reshapes their priorities, softens their entitlement, and expands  their capacity for love. But those benefits come as a byproduct of genuine other-focus, not  as a goal pursued directly.`,
  },

  {
    title:        "When your family does not share your faith",
    category:     "pastoral",
    scripture_ref: "Luke 12:51-53, 1 Peter 3:1-2, Matthew 5:16",
    source:       "Kairos curated",
    tags:         ["relationships", "family", "community", "suffering", "identity"],
    audience:     ["anyone", "new_believer", "growing"],
    mode_affinity: ["PASTORAL", "COURAGE", "CLARITY"],
    weight:       2,
    content: `Jesus was remarkably honest about the social cost of following Him. Luke 12:51-53 contains some of His least comfortable words: "Do you think I came to bring  peace on earth? No, I tell you, but division. From now on there will be five in one  family divided against each other, three against two and two against three." He is not celebrating this division — He is warning that it will come.
  
For people who came to faith in families or communities where that faith is not shared — or  is actively opposed — this passage is both a warning and a comfort. A warning that the tension is real and Jesus knew it would be. A comfort that the tension is not evidence of failure on your part or that you have done something wrong.
  
1 Peter 3:1-2 gives a framework for the long game: winning people "without words by the  behavior of their wives, when they see the purity and reverence of your lives." The primary  witness is not argument but life — the visible difference that sustained, genuinely-lived  faith makes in a person over time.
  
Matthew 5:16 is the summary: "Let your light shine before others, that they may see your good  deeds and glorify your Father in heaven." Not that they will immediately see and believe — but that what they see will eventually lead somewhere.
  
The practice in this situation is patience — the long patience of continuing to love family  members well, without using faith as a point of superiority, without hiding your faith in  false peace, and without treating every conversation as an evangelistic opportunity. To be genuinely known and genuinely loving over years is the most persuasive witness there is.`,
  },

  {
    title:        "Navigating faith under cultural and family pressure",
    category:     "pastoral",
    scripture_ref: "Acts 5:29, Daniel 3:17-18, Romans 12:2",
    source:       "Kairos curated",
    tags:         ["identity", "community", "family", "obedience", "suffering"],
    audience:     ["anyone", "seeker", "new_believer"],
    mode_affinity: ["PASTORAL", "COURAGE", "CLARITY"],
    weight:       2,
    content: `In many parts of the world and many family and cultural contexts, following  Christ carries a social cost that is largely invisible in Western Christian experience.  Conversion can mean rejection by family, loss of community, economic consequences, and in  some cases real danger. Even where the stakes are lower, the pressure to conform to  family or cultural religious expectations can be intense.
  
Shadrach, Meshach and Abednego's answer to Nebuchadnezzar is one of the most honest  statements in the Old Testament about faith under pressure: "If we are thrown into the blazing furnace, the God we serve is able to deliver us from it... But even if he does not, we want you to know, Your Majesty, that we will not serve your gods." Even if He does not.  The faith is not contingent on rescue. The loyalty is not based on a guaranteed outcome.
  
Acts 5:29 is the short theological statement: "We must obey God rather than human beings." Simple in principle, costly in practice. The disciples who said this had just been arrested,  were being threatened, and knew the power of the people threatening them.
  
The pastoral word for those navigating this tension is not a formula. It is: you are not alone, this cost is real, God sees it and honours it, and the people throughout history who have held their faith under social pressure are part of the same story you are living. Romans 12:2 — "Do not conform to the pattern of this world, but be transformed by the renewing of  your mind" — is addressed to exactly this situation. The pressure to conform is real and persistent. The renewal of the mind is what makes a different response possible.`,
  },

  {
    title:        "Spiritual leadership — authority and the servant model",
    category:     "formation",
    scripture_ref: "1 Peter 5:1-4, Ezekiel 34:1-4, Matthew 20:25-28",
    source:       "Kairos curated",
    tags:         ["leadership", "community", "power", "service", "accountability"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "CLARITY", "COURAGE"],
    weight:       1,
    content: `Christian leadership has been distorted at both ends — on one side by  authoritarianism, where spiritual authority is used to control, demand loyalty, and  suppress questions; on the other by a reaction that rejects any form of authority and  reduces leadership to facilitation.
  
The New Testament model is neither. 1 Peter 5:2-3 describes elders who shepherd "not because you must, but because you are willing; not pursuing dishonest gain, but eagerly; not lording  it over those entrusted to you, but being examples to the flock." The negatives are specific:  not must, not money, not lording it over.
  
Ezekiel 34 is God's devastating indictment of leaders who exploited rather than served — who used their positions for personal benefit while the sheep were scattered and wounded. The language is severe: "Woe to you shepherds of Israel who only take care of yourselves!" The  severity reflects how seriously God takes the misuse of spiritual authority.
  
Matthew 20:25-28 is Jesus' clearest teaching: "Whoever wants to be great among you must be your servant, and whoever wants to be first must be your slave — just as the Son of Man did not come to be served, but to serve." Greatness in the kingdom is measured by the depth of  service, not the height of position.
  
The practical implications for anyone in a position of spiritual influence: power is to be used for those under your care, not over them. Accountability is not a threat to authority —  it is what makes authority trustworthy. The people who lead best tend to be the ones most  aware of their own capacity for self-deception.`,
  },

  {
    title:        "Forgiveness in relationships — the long work of not keeping score",
    category:     "pastoral",
    scripture_ref: "1 Corinthians 13:5, Colossians 3:12-14, Luke 17:3-4",
    source:       "Kairos curated",
    tags:         ["forgiveness", "reconciliation", "relationships", "formation", "conflict"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["PASTORAL", "FORMATION", "RELEASE"],
    weight:       1,
    content: `1 Corinthians 13:5 includes in its description of love something easy to miss: love "keeps no record of wrongs." The word for "record" is the accounting term — a  ledger. Love does not maintain a running total of offences to be produced at the right moment.
  
In close relationships — marriage, friendship, family — the ledger is one of the most  destructive forces available. It converts ordinary misunderstandings into evidence for a verdict that has already been reached. Every new disappointment becomes proof of an existing  charge.
  
Colossians 3:12-14 gives the alternative: "clothe yourselves with compassion, kindness,  humility, gentleness and patience. Bear with each other and forgive one another... And over  all these virtues put on love, which binds them all together in perfect unity."
  
Bear with each other. The language is physical — carrying a weight. Close relationships  require the capacity to bear the weight of another person's imperfection over time, without  that imperfection becoming the defining feature of who they are.
  
Luke 17:3-4 makes forgiveness uncomfortably specific: "If your brother or sister sins against  you, rebuke them; and if they repent, forgive them. Even if they sin against you seven times in a day and seven times come back to you saying 'I repent,' you must forgive them." Seven  times in a day. The disciples' response — "Increase our faith!" — is the right response. This  is not humanly natural. It requires something supplied from outside.`,
  },

  {
    title:        "The practice of blessing your enemies",
    category:     "formation",
    scripture_ref: "Matthew 5:44, Romans 12:14-21, Luke 23:34",
    source:       "Kairos curated",
    tags:         ["forgiveness", "conflict", "justice", "formation", "courage"],
    audience:     ["growing", "mature"],
    mode_affinity: ["FORMATION", "COURAGE", "CLARITY"],
    weight:       1,
    content: `"But I tell you, love your enemies and pray for those who persecute you." This instruction of Jesus has never become easy or natural, which is part of why it remains so striking 2,000 years later. It runs against every human instinct toward self-protection and fair retaliation.
  
The practice Jesus commands is not a feeling — it is an action. Love here is agape — the active pursuit of another's good, independent of feeling. Praying for someone who has harmed  you does not require liking them. It requires directing the instrument of prayer — which is  access to God's care and power — toward their flourishing.
  
Romans 12:14-21 develops this practically: "Bless those who persecute you; bless and do not  curse." And then: "Do not repay anyone evil for evil." And then the most difficult: "If your enemy is hungry, feed him." The care is concrete and material, not just internal.
  
From the cross, Jesus enacts this: "Father, forgive them, for they do not know what they are doing." At the moment of maximum harm, directed toward those perpetrating it.
  
The spiritual formation dimension of this practice is significant. People who consistently pray for those who have harmed them report — not immediately, but over time — that the prayer changes them. The person they pray for becomes harder to maintain pure hatred toward. The prayer does not necessarily change the other person first; it changes the one praying. Which  may be the point.`,
  },

  {
    title:        "Building and sustaining genuine Christian community",
    category:     "pastoral",
    scripture_ref: "Acts 2:42-47, Hebrews 10:24-25, John 13:35",
    source:       "Kairos curated",
    tags:         ["community", "relationships", "service", "accountability",  "spiritual_discipline"],
    audience:     ["anyone", "growing"],
    mode_affinity: ["PASTORAL", "FORMATION", "CLARITY"],
    weight:       1,
    content: `The community described in Acts 2:42-47 is one of the most compelling pictures of human life together in the entire New Testament: "They devoted themselves to the apostles' teaching and to fellowship, to the breaking of bread and to prayer... All the believers were together and had everything in common... They broke bread in their homes and ate together with glad and sincere hearts, praising God and enjoying the favor of all the people."
  
Glad and sincere hearts. These are not people performing community — they are people who genuinely want to be together, who share their lives and their resources, who eat and pray  and learn in each other's company.
  
This kind of community does not emerge automatically by putting Christians in proximity to one another. It requires the conditions that produce it: a genuine common centre (not just  shared activities), enough vulnerability to be actually known, enough commitment to show up  when it is inconvenient, and enough time for trust to develop.
  
Hebrews 10:24-25 is honest about the temptation: "not giving up meeting together, as some are  in the habit of doing." The pull toward isolation is not new. The instruction to keep  meeting, keep spurring one another on, is addressed to people who already need to hear it.
  
Jesus says in John 13:35 that the mark of His disciples — the thing that will identify them  to the world — is not doctrine, not religious behaviour, not moral performance. It is this:  "Love one another. As I have loved you, so you must love one another." Community that looks  like that is the witness. When it exists, it is extraordinary.`,
  },

  {
    title:        "When church community fails you — faith beyond the institution",
    category:     "pastoral",
    scripture_ref: "Hebrews 10:25, Revelation 2-3, 1 Peter 2:9-10",
    source:       "Kairos curated",
    tags:         ["church_hurt", "community", "doubt", "spiritual_abuse", "relationships"],
    audience:     ["anyone", "seeker"],
    mode_affinity: ["PASTORAL", "LAMENT", "CLARITY"],
    weight:       2,
    content: `The letters to the seven churches in Revelation 2-3 are a sober reminder that  broken, failing, and even corrupt churches are not a modern development. Jesus writes to communities that have lost their first love, tolerated false teaching, become lukewarm, and maintained the appearance of life while being spiritually dead. He does not abandon them. He writes to them. He calls them.
  
When a church community fails — through leadership abuse, spiritual manipulation, exclusion, legalism, or simply the slow death of genuine life into institutional maintenance — the harm  is real and the grief is legitimate. The people who have been most deeply formed by a  community are often the ones most wounded when it betrays its own stated values.
  
The distinction that matters here: the failure of a particular expression of the church is not the failure of Christ. The two are related but not identical. Many people who have been wounded by a church community have directed that wound toward Christ — and the wound does not belong there. He is the one who wrote those letters to the failing churches, not the one who  failed.
  
Hebrews 10:25 continues to call toward community — "not giving up meeting together" — even knowing that communities are made of broken people and will sometimes behave accordingly. The call is not naive. It is patient.
  
1 Peter 2:9-10 grounds identity not in belonging to a specific community but in belonging to God: "You are a chosen people, a royal priesthood, a holy nation, God's special possession."  That belonging does not depend on a particular church remaining faithful. It is more durable than that.`,
  },


]

export async function POST(request) {
  try {
    // ── Auth check — protect this route ──────────────────────
    const authHeader = request.headers.get("authorization")
    const seedSecret = process.env.SEED_SECRET || "kairos-seed-dev"

    if (authHeader !== `Bearer ${seedSecret}`) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const results  = []
    const failures = []

    console.log(`[Kairos Seed] Starting — ${KNOWLEDGE_ENTRIES.length} entries to process`)

    for (let i = 0; i < KNOWLEDGE_ENTRIES.length; i++) {
      const entry = KNOWLEDGE_ENTRIES[i]

      try {
        // Generate embedding from title + content combined
        const textToEmbed = `${entry.title}\n\n${entry.content}`
        const embedding   = await generateEmbedding(textToEmbed)

        // Upsert into Supabase — update if title already exists
        // Includes metadata fields from migration 007.
        // Older entries without these fields fall back to migration backfill defaults.
        const { data, error } = await supabase
          .from("knowledge_base")
          .upsert(
            {
              title:         entry.title,
              content:       entry.content,
              category:      entry.category,
              scripture_ref: entry.scripture_ref || null,
              source:        entry.source,
              embedding:     embedding,
              tags:          entry.tags          || [],
              audience:      entry.audience      || ["anyone"],
              mode_affinity: entry.mode_affinity || [],
              weight:        entry.weight        || 1,
            },
            { onConflict: "title" }
          )
          .select("id, title")

        if (error) throw error

        results.push({ title: entry.title, status: "seeded" })
        console.log(`[Kairos Seed] ✓ ${i + 1}/${KNOWLEDGE_ENTRIES.length} — ${entry.title}`)

        // Small delay to avoid hitting embedding API rate limits
        await new Promise(r => setTimeout(r, 200))

      } catch (error) {
        failures.push({ title: entry.title, error: error.message })
        console.error(`[Kairos Seed] ✗ ${entry.title} — ${error.message}`)
      }
    }

    return NextResponse.json({
      success:  true,
      seeded:   results.length,
      failed:   failures.length,
      total:    KNOWLEDGE_ENTRIES.length,
      results,
      failures,
    })

  } catch (error) {
    console.error("[Kairos Seed] Fatal error:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}