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

import { NextResponse }      from "next/server"
import { createClient }      from "@supabase/supabase-js"
import { generateEmbedding } from "@/lib/rag/embeddings"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── KNOWLEDGE BASE ENTRIES ────────────────────────────────────
// 63 curated entries: 20 apologetics, 24 pastoral, 10 scripture context, 9 FAQ
const KNOWLEDGE_ENTRIES = [

  // ── APOLOGETICS ─────────────────────────────────────────────

  {
    title:        "Why does God allow suffering and evil?",
    category:     "apologetics",
    scripture_ref: "Romans 8:18, Job 38-42",
    source:       "Kairos curated",
    content: `The problem of suffering is the most honest question anyone can bring to faith. There is no answer that makes suffering painless to look at — and any response that pretends otherwise is hollow. The Christian answer is not that God is absent from suffering, but that He entered it. The cross is not God watching from a distance; it is God absorbing the worst of what this world does to people. Suffering exists in a world where genuine freedom was given to created beings — both human and spiritual. A love that cannot be refused is not love. The Christian tradition does not promise that suffering will be explained, but that it will be redeemed. Romans 8:18 speaks of present suffering as not worth comparing to what is coming — not as dismissal, but as horizon. Job never received an explanation for his suffering; he received a presence. That is often what people need most — not an answer, but a God who shows up.`,
  },

  {
    title:        "Is the Bible reliable and historically accurate?",
    category:     "apologetics",
    scripture_ref: "2 Timothy 3:16, Luke 1:1-4",
    source:       "Kairos curated",
    content: `The Bible is the most scrutinised document in human history — and it has survived that scrutiny remarkably well. The New Testament is supported by over 5,800 Greek manuscripts, far more than any other ancient text. Historians like Luke wrote with explicit care for accuracy, interviewing eyewitnesses. Archaeological discoveries have consistently confirmed details once doubted — the Pool of Siloam, the existence of Pontius Pilate, the city of Jericho. The Dead Sea Scrolls confirmed that the Old Testament text we have today is essentially identical to manuscripts from over 2,000 years ago. The Bible does not claim to be a science textbook or a history in the modern academic sense — it claims to be the revelation of God's character and purposes through real human history. Its unity across 66 books, 40 authors, and 1,500 years is itself a remarkable thing.`,
  },

  {
    title:        "Why are there so many religions if God is real?",
    category:     "apologetics",
    scripture_ref: "Acts 17:22-28, Romans 1:19-20",
    source:       "Kairos curated",
    content: `The diversity of religions is often raised as evidence against God — but it can be read differently. Every human culture, across every century, with no contact with one another, reached independently toward something beyond themselves. This near-universal impulse toward transcendence is harder to explain if the idea of God is purely invented. The disagreements between religions are largely about who God is and how to reach Him — not really about whether something is there at all. Paul in Athens did not dismiss the Athenians' religiosity; he said God had placed an awareness of Himself in all people. Christianity does not claim that all religions are wrong about everything — it claims that Jesus is the clearest, fullest revelation of who God actually is. The question is not whether to seek — every culture has sought — but whether Jesus is the answer to what all that seeking has been reaching toward.`,
  },

  {
    title:        "Did Jesus actually exist historically?",
    category:     "apologetics",
    scripture_ref: "1 Corinthians 15:3-8",
    source:       "Kairos curated",
    content: `The historical existence of Jesus is one of the most well-attested facts of ancient history. Even scholars who do not accept His divinity affirm His existence. Roman historian Tacitus, writing around 116 AD, referenced Christ's execution under Pontius Pilate. Jewish historian Josephus mentioned Jesus twice. The letters of Paul — written within 20 years of the crucifixion — contain early creedal material that historians date to within 3-5 years of the resurrection. The question historians debate is not whether Jesus lived and died, but what to make of the resurrection. The disciples' willingness to die for their testimony — not for a belief but for a specific claimed event they said they witnessed — is one of the most difficult facts for purely naturalistic explanations to account for.`,
  },

  {
    title:        "Why does God send people to hell?",
    category:     "apologetics",
    scripture_ref: "John 3:17, 2 Peter 3:9, Revelation 20:15",
    source:       "Kairos curated",
    content: `Hell is one of the hardest doctrines in Christianity — and anyone who presents it without discomfort probably has not thought about it seriously. A few things are worth holding: First, the biblical picture of hell is primarily separation from God — not a torture chamber God gleefully operates. Second, the same God who allows hell sent His Son to prevent people from going there. John 3:17 says God did not send the Son to condemn, but to save. The offer is genuine and universal. Third, if human freedom is real — if love cannot be forced — then God ultimately honours the choice of those who reject Him, even to the end. C.S. Lewis put it plainly: the gates of hell are locked from the inside. The Christian answer is not that God eagerly condemns, but that He has done everything possible to make another way — and that way is the cross.`,
  },

  {
    title:        "How can Christianity be true if Christians are hypocrites?",
    category:     "apologetics",
    scripture_ref: "Matthew 23:1-3, Romans 3:23",
    source:       "Kairos curated",
    content: `Hypocrisy in the church is real, it causes real harm, and it should be named clearly rather than defended. Jesus Himself was the sharpest critic of religious hypocrisy — Matthew 23 contains His most devastating words, and they were aimed at the religious leaders of His day. The existence of hypocrites in the church says something true about human nature — that religious structures attract people who want power and respectability — but it does not settle the question of whether Jesus is who He claimed to be. The standard Christianity points to is Christ, not Christians. Every generation of believers has failed to live up to that standard. That failure is not evidence that Christianity is false — it is evidence for what Christianity has always said: that all people, including the religious, are broken and in need of grace.`,
  },

  {
    title:        "Does evolution contradict the Bible and Christian faith?",
    category:     "apologetics",
    scripture_ref: "Genesis 1:1, Psalm 19:1-4, John 1:3",
    source:       "Kairos curated",
    content: `The relationship between evolution and Christian faith is genuinely complex, and Christians hold a range of thoughtful positions. The tension often lives not in the facts themselves, but in the lenses through which we read Genesis. When Genesis is read as a scientific account competing with biology, the conflict appears sharp. When it is read as theological poetry — answering why creation exists and who it belongs to, rather than how it unfolded mechanically — the conflict softens considerably. Many serious Christians, including scientists, hold that evolutionary processes can be the mechanism through which God created. Others hold to a more literal reading. What Christianity requires is not a particular view of the mechanism of creation, but a belief in the Creator. Science asks how; Genesis asks why and who. These are not the same question.`,
  },

  {
    title:        "Why does God seem silent when I pray?",
    category:     "apologetics",
    scripture_ref: "Psalm 22:1-2, Isaiah 55:8-9, Hebrews 11:1",
    source:       "Kairos curated",
    content: `The silence of God is one of the most honest complaints in scripture — Psalm 22 opens with "My God, my God, why have you forsaken me?" and Jesus quoted it from the cross. The experience of God's silence is not a sign of weak faith; it is part of the biblical record of what it means to seek God seriously. A few things are worth sitting with: God's silence is not the same as God's absence. His ways are described in Isaiah as higher than human ways — not as a dismissal but as a genuine acknowledgment that His perspective and timing exceed ours. Faith, by its very nature, operates in the space where certainty is not yet given. The saints who trusted most deeply often describe seasons of profound silence. The invitation is not to manufacture certainty, but to remain in the relationship through the silence — which is itself a profound act of trust.`,
  },

  {
    title:        "Is Jesus the only way to God?",
    category:     "apologetics",
    scripture_ref: "John 14:6, Acts 4:12, 1 Timothy 2:5",
    source:       "Kairos curated",
    content: `This is one of Christianity's most exclusive claims and one of its hardest to hold in a pluralistic world. Jesus said plainly in John 14:6 that He is the way, the truth, and the life, and that no one comes to the Father except through Him. This is not a claim the church invented — it comes directly from Jesus. The honest response to this claim is not to soften it into meaninglessness, but to examine the person making it. If Jesus is who He claimed to be — God in human form, risen from the dead — then the claim carries the weight of the universe behind it. If He is not, then nothing else He said matters either. Christianity does not ask people to accept exclusivity as a doctrine first; it asks them to look at Jesus first. The exclusivity follows from who He is, not from institutional arrogance.`,
  },

  {
    title:        "What is the resurrection and why does it matter?",
    category:     "apologetics",
    scripture_ref: "1 Corinthians 15:14-19, Luke 24:1-12",
    source:       "Kairos curated",
    content: `Paul said it plainly: if Christ has not been raised, faith is futile and Christians are to be pitied above all people. The resurrection is not a peripheral doctrine — it is the hinge on which everything turns. The early disciples did not preach a set of ethical teachings; they preached a specific event. The empty tomb was not explained away by the authorities — they claimed the body was stolen, which concedes it was gone. The post-resurrection appearances were to hundreds of people, including to Paul himself who had been an active persecutor of the church. The transformation of the disciples from hiding in fear to preaching publicly at risk of death is one of history's most dramatic reversals. The resurrection means death is not the final word — for Jesus or for anyone who is in Him. It is the foundation of Christian hope, not its wishful conclusion.`,
  },

  // ── APOLOGETICS — FAQ (from reference images) ───────────────

  {
    title:        "If God exists, why isn't His exact identity more obvious?",
    category:     "apologetics",
    scripture_ref: "Luke 16:31, Romans 1:19-20",
    source:       "Kairos curated — FAQ reference",
    content: `That God exists is a fact most people have agreed on throughout history. It is the exact identity of God that causes disagreement. Perhaps God's identity is more obvious than we think. Jesus told a parable about a man who died and went to Hades. The condemned man insinuated to Father Abraham that God's identity was not as obvious as it should have been — otherwise he wouldn't have ended up there. He begged Abraham to send someone from the dead to warn his brothers. Abraham responded that if they don't listen to Moses and the prophets, they will not be persuaded even if someone rises from the dead. God has made His identity clear. Our problem is that we are like children who cover their ears and shout. In our sinfulness we are not eager to learn truth about God because it costs us some of the things we love best — our independence, our opinions, our sinful ways. Sinful humanity cannot bear very much reality about God. The clarity is there. The willingness to look is the question.`,
  },

  {
    title:        "Has science proven there is no God?",
    category:     "apologetics",
    scripture_ref: "Genesis 1:1, Psalm 19:1-4, John 1:3",
    source:       "Kairos curated — FAQ reference",
    content: `The existence of an immaterial and eternal God is beyond the purview of science, which studies material reality and the laws and forces that help explain the structure and function of the universe. Science cannot prove or disprove God — that is not a failure of science, it is simply outside its domain. But science has its roots in biblical teachings. The Bible says God created humanity in His image — one implication is that our minds are ready-made for understanding the world if we will bother to investigate it. God commanded humanity to be fruitful and subdue the earth — a call to stewardship that requires observing the law-like regularities and exquisite complexities in nature. It is no accident that many of the pioneers of science held a biblical worldview that expects the orderly, law-like phenomena that enable life to flourish. Science and faith are not at war. They are answering different questions with different tools.`,
  },

  {
    title:        "Has science proven miracles are impossible?",
    category:     "apologetics",
    scripture_ref: "Exodus 14:21, Matthew 14:25-27",
    source:       "Kairos curated — FAQ reference",
    content: `The idea that science has proven the impossibility of miracles stems from a faulty understanding of the relationship between God and science. This mistaken view — held by Christians and agnostics alike — gives the laws of nature a status they don't have in reality. The biblical understanding is that phenomena that function in a law-like manner all owe their being to God moment by moment. A meteorologist might well have given a thorough scientific explanation of the parting of the Red Sea. The Bible itself hints at that possibility — the Lord drove the sea back with a powerful east wind all that night and turned the sea into dry land. In that case the miracle was not that a scientific explanation was lacking. It was the timing — the Israelites being at the edge of the sea precisely when the east wind dried it up. God is not beholden to scientific law. Scientific law is our attempt to make sense of what God is doing all the time. Miracles are not violations of nature — they are God acting with intentionality in time.`,
  },

  {
    title:        "If God is good, why does He allow evil to exist?",
    category:     "apologetics",
    scripture_ref: "Matthew 19:26, Habakkuk 1:13, Genesis 50:15-21, Romans 5:6-11",
    source:       "Kairos curated — FAQ reference",
    content: `Scripture affirms God's unlimited power, His perfect goodness, and the reality of evil — and does not resolve the tension cheaply. God doesn't give a comprehensive account of why He allows evil. But for those who follow the evidence carefully, God sets forth a pattern: where He allows evil, He turns it toward a greater good. The greatest example of this pattern is the death of Jesus — through whom God's enemies are made His children. The cross is not God failing to prevent evil; it is God absorbing evil in order to redeem it. This does not make evil acceptable or minimise its horror. It means that evil does not have the final word. The biblical response to evil is not explanation — it is redemption. God enters the worst of what this world produces and transforms it. That is not a comfortable answer, but it is a true one, and it is the only answer that takes evil seriously enough without surrendering to despair.`,
  },

  {
    title:        "How important is it to believe the right things about God?",
    category:     "apologetics",
    scripture_ref: "Mark 8:36-37, John 17:3",
    source:       "Kairos curated — FAQ reference",
    content: `When you board a jet, you do so because you believe it is airworthy and will get you to your destination safely. If you did not believe that, you would not board. If your belief in the jet's safety were mistaken, you would want someone to tell you so. Our beliefs about the jet and the reality about the jet are not necessarily in agreement — and clearly it matters that they line up. How much more is at stake when it comes to beliefs about God. God is our maker and judge. If what you believe about God turns out to be false, you have staked everything on a faulty foundation. This is not an argument for rigid dogmatism — it is an argument for honest inquiry. The stakes of getting God wrong are higher than almost any other question we face. That is not a reason for fear; it is a reason to take the question seriously and to pursue it with everything you have.`,
  },

  {
    title:        "Am I at odds with God? What exactly is sin?",
    category:     "apologetics",
    scripture_ref: "Romans 3:10-18, 1 John 1:8-10",
    source:       "Kairos curated — FAQ reference",
    content: `Human beings are naturally at odds with God, and this aversion may be hidden by a veneer of respectability — but given the right circumstances it becomes evident in each of us. Sin is not primarily a list of prohibited behaviours. Sin is a refusal to live humbly under God's reign and acknowledge our obligations to Him. It is the fundamental posture of independence — living as though we are the centre of our own universe rather than as creatures in relationship with our Creator. The philosopher Sartre, as a schoolboy, burned a small rug and felt — in his own words — the gaze of God. He fell into a rage against God. By Sartre's account, "He never looked at me again." In reality, it was Sartre who never looked at God again. That story captures something true about all of us. We are all guilty of this turning away — and we all need the forgiveness that comes from returning.`,
  },

  {
    title:        "What is the reason anyone is sent to hell?",
    category:     "apologetics",
    scripture_ref: "Psalm 97:2, Colossians 2:14, Romans 5:6-11",
    source:       "Kairos curated — FAQ reference",
    content: `Sin violates God's law, which expresses His righteous character. Sin involves rebellion against the Creator-King whose throne is founded on righteousness and justice. Sin incurs a debt of guilt and punishment. The crucifixion of the innocent and eternal God-Man, Jesus Christ, is the only possible satisfaction of divine justice — but it is only for those who attach themselves to Christ by faith. Others must endure their own punishment for their offenses against the infinite and holy God. This is not a doctrine to be held lightly or with any satisfaction. It is one of the hardest realities in scripture. It is also what makes the gospel genuinely good news — not good advice, not helpful suggestions, but rescue from a real danger. The cross only makes sense in light of what it rescues us from. And 2 Peter 3:9 makes clear that God is not willing that any should perish — He is patient, holding the door open.`,
  },

  {
    title:        "How can God send sincere people of other faiths to hell?",
    category:     "apologetics",
    scripture_ref: "Deuteronomy 6:4, Acts 4:12, John 14:6",
    source:       "Kairos curated — FAQ reference",
    content: `Only one God is the Creator and Ruler of all. Sin violates His laws, summarised as love the Lord your God with all your heart, soul, and strength. Such love has no room for other gods. Worship of false gods — no matter how devout the worship — involves rebellion against the true God who provided salvation only through His Son. Imagine the pain and offense your parents would feel if you identified someone else as your father and mother. In a similar way, it is painful and offensive to God when we misidentify Him, saying things of Him that are not true and which conflict with His eternal nature. This is one of Christianity's most difficult claims, and it should be held with genuine humility and grief — not triumphalism. The response to it is not to soften the claim, but to recognise that it makes the urgent sharing of the genuine gospel not a burden but an act of love toward people we care about.`,
  },

  {
    title:        "Why can't God simply annihilate those who die in unbelief?",
    category:     "apologetics",
    scripture_ref: "Matthew 25:46, Luke 12:4-5, John 5:28-29, Revelation 9:5-6",
    source:       "Kairos curated — FAQ reference",
    content: `Scripture says God is both perfectly just and loving, and that the penalty for living in rebellion against God is eternal punishment. Annihilation would not satisfy God's perfect justice because the offense of our sins is infinite — committed against an infinite and holy God. Just as the reward for faith-righteousness through Christ is eternal fellowship with God, the penalty for rebellion against Him is eternal ruin and separation from God. This doctrine is not one that any honest person holds with comfort. It should produce urgency — urgency in receiving the grace that is offered, and urgency in extending it to others. The weight of eternity is precisely why the gospel matters so profoundly. God does not delight in the death of the wicked — Ezekiel 33:11 records Him saying so plainly. He takes no pleasure in judgment. That He permits it is the measure of how seriously He takes human freedom and the reality of moral choice.`,
  },

  {
    title:        "If there is one God, why are there so many religions?",
    category:     "apologetics",
    scripture_ref: "Romans 1:18-23, Acts 17:22-28",
    source:       "Kairos curated — FAQ reference",
    content: `God has made Himself known to everyone through creation and the conscience. This knowledge has not been well received by human beings. Rather than acknowledging who God is and being grateful, we have suppressed this original knowledge. The result is a darkening of the mind. People create gods they prefer rather than worshipping God as He is. Given the diversity of people and cultures, it is no surprise that a variety of religions has emerged — each one a variation on the human attempt to reach toward something transcendent, shaped by local culture, history, and the particular ways in which people have suppressed or distorted the original revelation. This is not a counsel of despair about other religions — many contain genuine fragments of truth. But it is an honest account of why the picture is fragmented. The Christian claim is that in Jesus, the fragmented picture finds its complete form. Not because Christians are wiser, but because God chose to make Himself fully known in a person.`,
  },

  // ── PASTORAL ─────────────────────────────────────────────────

  {
    title:        "Grief — responding to loss and bereavement",
    category:     "pastoral",
    scripture_ref: "John 11:35, Psalm 34:18, Romans 8:38-39",
    source:       "Kairos curated",
    content: `Grief is not something to be fixed or resolved quickly — it is the price of love, and it deserves to be honoured. The shortest verse in the Bible is "Jesus wept" — at the tomb of Lazarus, even knowing He was about to raise him. This matters: God does not stand above grief and dispense comfort from a distance. He enters it. The right response to someone who is grieving is almost never information or scripture in the first moment — it is presence. Sitting with someone in their pain without rushing to explain or comfort is one of the most profound things a person can do. Grief has no timeline. The expectation that people should "be over it" after a certain period causes enormous secondary harm. Psalm 34:18 says God is close to the brokenhearted — close, not watching from a distance. The invitation in grief is not to stop feeling it but to bring it to God exactly as it is.`,
  },

  {
    title:        "Addiction and recovery — a pastoral response",
    category:     "pastoral",
    scripture_ref: "Romans 7:15-25, 2 Corinthians 12:9, Galatians 5:1",
    source:       "Kairos curated",
    content: `Addiction is one of the places where the gap between what a person wants to do and what they actually do is most painfully visible. Paul described this very experience in Romans 7 — doing the thing he hated, unable to do the thing he wanted. That description resonates across centuries because it is profoundly human. Shame is one of addiction's most powerful fuel sources — and shame-based responses to addiction have caused enormous harm in religious communities. The response that actually helps is rarely condemnation — it is honest presence, consistent relationship, and practical support for recovery. Addiction involves real changes in brain chemistry and real spiritual bondage, often both simultaneously. Recovery is rarely linear. Relapse is part of the process for many people, not evidence of failure or lack of faith. Community — real, non-judgmental community — is one of the strongest protective factors in recovery.`,
  },

  {
    title:        "Church hurt and spiritual abuse — a pastoral response",
    category:     "pastoral",
    scripture_ref: "Ezekiel 34:1-10, Matthew 18:6, Luke 4:18",
    source:       "Kairos curated",
    content: `Church hurt is real, it causes deep harm, and it should never be minimised or explained away. People who have been wounded by religious communities — by leaders who abused power, by communities that rejected them, by theology weaponised against them — carry genuine trauma. The first and most important response is to believe them and acknowledge that what happened to them was wrong. God Himself speaks with remarkable severity about leaders who harm the sheep entrusted to them — Ezekiel 34 is one of scripture's most searing passages, directed at shepherds who exploit rather than protect. The distinction between Christ and the people who claim to represent Him is not a deflection — it is a genuine and important one. But it should only be offered after someone feels fully heard and believed. Many people's faith can be separated from their experience of a particular community. Many others need significant time and distance before that separation is possible.`,
  },

  {
    title:        "Anxiety and fear — a pastoral and spiritual response",
    category:     "pastoral",
    scripture_ref: "Philippians 4:6-7, Matthew 6:25-34, Psalm 46:1-2",
    source:       "Kairos curated",
    content: `Anxiety is one of the most common experiences people bring to conversations about faith, and it is important to respond to it with both pastoral care and honesty about its complexity. Anxiety is not a moral failing or a sign of weak faith — it is a human experience with both psychological and spiritual dimensions. The biblical instruction to "be anxious for nothing" in Philippians 4 is not a command to simply stop feeling anxious; it is followed immediately by a practice — bring everything to God in prayer, with thanksgiving, and the peace of God will guard your heart. This is a relational practice, not a willpower exercise. At the same time, anxiety that is severe, persistent, or debilitating may also need professional support. Faith and therapy are not opposites. Encouraging someone to seek professional help is not a failure of faith — it is wisdom.`,
  },

  {
    title:        "Depression and darkness of soul — a pastoral response",
    category:     "pastoral",
    scripture_ref: "Psalm 88, 1 Kings 19:3-8, Lamentations 3:1-23",
    source:       "Kairos curated",
    content: `Depression is not the same as sadness, and it is not a sign of spiritual failure. Some of the most faithful people in scripture experienced profound darkness — Elijah asked God to take his life under a broom tree; Jeremiah cursed the day he was born; Psalm 88 ends without resolution, in darkness. These are not exceptions in the Bible — they are part of its honest witness to human experience. The first response to someone describing depression is to take it seriously, not to offer quick spiritual remedies. Clinical depression involves real neurological processes that spiritual disciplines alone may not address. Encouraging someone to seek professional support alongside spiritual care is not faithlessness — it is wisdom and love. What faith offers in depression is not an immediate fix but a companion in the darkness and a horizon beyond it — Lamentations 3 moves from utter despair to "great is your faithfulness" within a few verses, not because the pain disappeared but because something steadier was found beneath it.`,
  },

  {
    title:        "Doubt — when faith feels impossible",
    category:     "pastoral",
    scripture_ref: "Mark 9:24, John 20:24-29, Jude 1:22",
    source:       "Kairos curated",
    content: `Doubt is not the opposite of faith — it is often the beginning of a deeper faith. The man in Mark 9 cried out "I believe — help my unbelief" and Jesus responded with a miracle, not a lecture. Thomas required evidence and received it; Jesus did not condemn him for that. Jude tells the church to be merciful to those who doubt. The history of Christian faith is full of people who wrestled with profound uncertainty — including many of its greatest thinkers and most faithful servants. The most dangerous thing to tell someone who is doubting is that they should not be. Doubt that is suppressed does not disappear — it goes underground and does more damage there. Doubt that is brought into honest conversation can become the ground for a faith that is genuinely owned rather than merely inherited. The invitation is not to have no questions, but to bring the questions to God rather than away from Him.`,
  },

  {
    title:        "Shame — the difference between shame and guilt",
    category:     "pastoral",
    scripture_ref: "Romans 8:1, Psalm 34:5, Isaiah 61:7",
    source:       "Kairos curated",
    content: `Shame and guilt are not the same thing, and the distinction matters enormously for how people experience faith and recovery. Guilt says "I did something wrong." Shame says "I am something wrong." Guilt can lead to repentance and restoration. Shame tends to drive people into hiding and isolation — the very conditions that prevent healing. Many people who have been harmed by religious communities carry not guilt but shame — a deep sense that they are fundamentally unacceptable, damaged, or beyond redemption. The gospel is specifically addressed to this condition. Romans 8:1 declares no condemnation for those in Christ — not "no condemnation if you perform well enough," but a declaration about identity. The movement of the gospel is always from shame to dignity, from hiding to belonging, from "I am unworthy" to "I am beloved." This is not a self-help message — it is a specific claim about what God has done in Christ.`,
  },

  {
    title:        "Loneliness and the search for belonging",
    category:     "pastoral",
    scripture_ref: "Genesis 2:18, Psalm 68:6, John 15:15",
    source:       "Kairos curated",
    content: `Loneliness is one of the most pervasive experiences of modern life, and it is one that the Bible takes seriously from its earliest pages. The first thing declared "not good" in creation was that the human being was alone — before any moral failure, in a perfect garden, in the presence of God. This is a striking acknowledgment: divine presence does not automatically resolve the human need for human connection. God's response was not to tell Adam to pray more — it was to give him another person. The longing for belonging is not weakness; it is how human beings were made. Jesus described His disciples not as servants but as friends — a word that carries intimacy and mutual knowing. The church, at its best, is meant to be the community that meets this longing. When it fails to be that — when it is cold, performance-based, or unwelcoming — it causes harm that goes very deep. Real belonging requires being known and accepted as one actually is.`,
  },

  {
    title:        "Forgiveness — when it feels impossible",
    category:     "pastoral",
    scripture_ref: "Matthew 18:21-22, Ephesians 4:32, Luke 23:34",
    source:       "Kairos curated",
    content: `Forgiveness is one of the most misunderstood concepts in Christian life, and the misunderstanding causes real harm. Forgiveness is not the same as reconciliation. Forgiveness does not mean pretending the harm did not happen, or that it was not serious, or that the relationship must be restored. Forgiveness is the internal release of the debt someone owes you — a decision to stop requiring payment for what was done. It is primarily for the person who was harmed, not for the person who caused the harm. Reconciliation, where it is safe and possible, is a separate step that requires genuine repentance from the one who caused harm. Telling a victim of serious abuse that they must reconcile with their abuser in the name of forgiveness is a profound misapplication of scripture. Forgiveness can begin before the other person has changed. It is a process, not a single moment, and it often needs to happen multiple times for the same wound.`,
  },

  {
    title:        "Divorce and relationship breakdown — a pastoral response",
    category:     "pastoral",
    scripture_ref: "Malachi 2:16, Matthew 19:8, 1 Corinthians 7:15",
    source:       "Kairos curated",
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