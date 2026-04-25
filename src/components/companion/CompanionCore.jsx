"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSettings }    from "@/context/SettingsContext"
import { useAuthState }   from "@/hooks/useAuthState"
import { getTodaysVerse } from "@/lib/bible/daily-verses"
import BibleVerse         from "./BibleVerse"
import SaveMomentModal    from "./SaveMomentModal"

/* ─────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────── */
function detectVerseRequest(text) {
  const p = /\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|1\s?samuel|2\s?samuel|1\s?kings|2\s?kings|1\s?chronicles|2\s?chronicles|ezra|nehemiah|esther|job|psalms?|proverbs|ecclesiastes|song\s?of\s?solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|1\s?corinthians|2\s?corinthians|galatians|ephesians|philippians|colossians|1\s?thessalonians|2\s?thessalonians|1\s?timothy|2\s?timothy|titus|philemon|hebrews|james|1\s?peter|2\s?peter|1\s?john|2\s?john|3\s?john|jude|revelation)\s+\d+:\d+(-\d+)?/i
  const m = text.match(p); return m ? m[0] : null
}
function detectBibleSearch(text) {
  const t = text.toLowerCase()
  return ["where does the bible say","find verses about","search the bible for","what does the bible say about","verses about","bible verses on"].some(k => t.includes(k))
}
function getGreeting(name) {
  const h = new Date().getHours()
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night"
  return name ? `${time}, ${name.split(" ")[0]}` : time
}
function getGreetingSubtitle(h = new Date().getHours()) {
  if (h < 5)  return "Still here in the quiet hours."
  if (h < 12) return "A new day. Bring whatever is on your heart."
  if (h < 17) return "The afternoon is yours. What are you carrying?"
  if (h < 21) return "The day is winding down. What needs to be said?"
  return "The night is a good time to be honest."
}
function formatRelativeTime(dateStr) {
  const d = new Date(dateStr); const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60)    return "just now"
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  const days = Math.floor(diff / 86400)
  if (days === 1) return "yesterday"
  if (days < 7)   return `${days}d ago`
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
function truncateText(text, max = 60) {
  if (!text) return ""
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
const Icon = {
  Companion:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Saved:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  Bible:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Plans:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Account:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Sparkle:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Plus:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Chevron:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  History:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.96"/></svg>,
  Pin:        (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill={p?.on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>,
  Edit:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  More:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>,
  Save:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  X:          () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Send:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
  Menu:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Grid:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
}

/* ─────────────────────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",       Icon: Icon.Companion },
  { label: "Saved",     href: "/journey/saved", Icon: Icon.Saved     },
  { label: "Bible",     href: "/bible",         Icon: Icon.Bible     },
  { label: "Plans",     href: "/plans",         Icon: Icon.Plans     },
  { label: "Account",   href: "/account",       Icon: Icon.Account   },
  { label: "Settings",  href: "/settings",      Icon: Icon.Settings  },
]

/* ─────────────────────────────────────────────────────────────
   CAPABILITY CARDS
───────────────────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    group: "When something is wrong",
    color: "rgba(240,120,120,0.7)",
    items: [
      { label: "What You're Feeling Right Now",       mode: "PASTORAL",    frame: "You don't need to explain it perfectly. Start with whatever is closest to the surface." },
      { label: "I'm Angry at God",                    mode: "LAMENT",      frame: "That anger is not something you need to clean up before bringing it here. Say what you actually feel." },
      { label: "I Don't Know If I Believe Anymore",   mode: "APOLOGETICS", frame: "You don't have to pretend certainty you don't have. Tell me where the doubt started." },
    ],
  },
  {
    group: "When you need truth",
    color: "rgba(240,192,96,0.7)",
    items: [
      { label: "Honest Life Audit",                   mode: "CLARITY",     frame: "Let's look at your life without softening it. Answer honestly — we'll find where things are out of alignment." },
      { label: "A Question I'm Afraid to Ask",        mode: "CLARITY",     frame: "There is no question too dangerous to ask here. Say what you've been holding back." },
      { label: "Help Me Understand a Bible Passage",  mode: "CLARITY",     frame: "Tell me the passage — or describe what you're trying to understand. We'll work through it together." },
    ],
  },
  {
    group: "When you're searching at depth",
    color: "rgba(130,160,240,0.7)",
    items: [
      { label: "A Deep Question About God or Reality",      mode: "APOLOGETICS", frame: "Bring the full weight of the question. I won't soften the edges of it." },
      { label: "Suffering and Divine Justice",              mode: "APOLOGETICS", frame: "This is one of the oldest and most honest questions a person can bring. Let's go into it seriously." },
      { label: "Prayer, Silence, or Mystical Experience",   mode: "CLARITY",     frame: "Tell me where you are in your prayer life — what you're experiencing, what's missing, what confuses you." },
      { label: "I'm Questioning Everything I Believe",      mode: "APOLOGETICS", frame: "Deconstruction is not the end. Tell me what's unravelling and where it started." },
    ],
  },
  {
    group: "When you need to change",
    color: "rgba(100,200,160,0.7)",
    items: [
      { label: "Hidden Patterns",                    mode: "FORMATION",   frame: "Self-sabotage usually runs on a loop you haven't named yet. Tell me what keeps happening — we'll slow it down and look at it." },
      { label: "Personal Rule of Life",              mode: "FORMATION",   frame: "A rule of life isn't a schedule. It's a framework for who you want to become. Let's build yours." },
      { label: "Build an Accountability System",     mode: "FORMATION",   frame: "Real accountability isn't about streaks. Tell me what you're trying to change — we'll build something honest around it." },
    ],
  },
  {
    group: "When you need courage",
    color: "rgba(200,140,240,0.7)",
    items: [
      { label: "Practice a Hard Conversation",       mode: "COURAGE",     frame: "Tell me the conversation you've been avoiding — who it's with, what needs to be said. We'll work through it together." },
      { label: "I Need to Forgive Someone",          mode: "COURAGE",     frame: "Forgiveness is not the same as saying it was acceptable. Tell me what happened." },
      { label: "I Need to Ask for Forgiveness",      mode: "COURAGE",     frame: "The hardest direction. Tell me what you did and who you hurt." },
    ],
  },
  {
    group: "When you need to let go",
    color: "rgba(160,200,220,0.7)",
    items: [
      { label: "Write the Letter You Never Sent",    mode: "RELEASE",     frame: "Some things need to be said even if they're never delivered. Who is this letter to?" },
      { label: "I'm Grieving Something",             mode: "LAMENT",      frame: "Grief doesn't need to be explained or justified. Tell me what you lost." },
      { label: "Help Me Find Closure",               mode: "RELEASE",     frame: "Closure rarely arrives on its own. Tell me what's still open." },
    ],
  },
]

/* ─────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes cc-fade    { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes cc-fadein  { from{opacity:0}                            to{opacity:1} }
  @keyframes cc-pulse   { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
  @keyframes cc-spin    { to{transform:rotate(360deg)} }
  @keyframes cc-slide-r { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cc-slide-u { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes cc-drawer  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cc-overlay { from{opacity:0} to{opacity:1} }
  @keyframes cc-scale-in{ from{opacity:0;transform:scale(0.96)}     to{opacity:1;transform:scale(1)} }

  .cc-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  .cc-rail {
    width: 64px;
    height: calc(100vh - 24px);
    margin: 12px 0 12px 12px;
    border-radius: 16px;
    background: rgba(12,14,24,0.92);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 0;
    z-index: 30;
    flex-shrink: 0;
    position: relative;
  }

  .cc-rail-btn {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    transition: all 0.15s ease;
    text-decoration: none;
    position: relative;
  }
  .cc-rail-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }
  .cc-rail-btn.active { background: rgba(240,192,96,0.12); color: rgba(240,192,96,0.9); }
  .cc-rail-btn .cc-tooltip {
    position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: rgba(12,14,24,0.96); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; padding: 5px 10px; white-space: nowrap;
    font-family: var(--font-body); font-size: 0.72rem; color: rgba(255,255,255,0.7);
    opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4); z-index: 100;
  }
  .cc-rail-btn:hover .cc-tooltip { opacity: 1; }

  .cc-drawer {
    position: fixed;
    left: 88px;
    top: 12px;
    height: calc(100vh - 24px);
    width: 280px;
    border-radius: 16px;
    background: rgba(10,12,22,0.97);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
    z-index: 40;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: cc-drawer 0.2s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
  }
  .cc-drawer-overlay {
    position: fixed; inset: 0; z-index: 35;
    background: rgba(4,6,14,0.4);
    backdrop-filter: blur(2px);
    animation: cc-overlay 0.15s ease forwards;
  }
  .cc-drawer-scroll {
    flex: 1; overflow-y: auto; padding: 16px 12px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent;
  }
  .cc-drawer-scroll::-webkit-scrollbar { width: 3px; }
  .cc-drawer-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  .cc-drawer-label {
    font-family: var(--font-display);
    font-size: 0.44rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.2); padding: 8px 8px 4px; margin: 0;
  }

  .cc-drawer-link {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    text-decoration: none; cursor: pointer;
    border: none; background: transparent; width: 100%;
    font-family: var(--font-body); font-size: 0.82rem;
    color: rgba(255,255,255,0.4); transition: all 0.15s ease;
    min-height: 38px;
  }
  .cc-drawer-link:hover  { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
  .cc-drawer-link.active { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }

  /* ── Conversation item — now a div, not a button, to avoid nested button violation ── */
  .cc-conv-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 9px;
    cursor: pointer; background: transparent;
    width: 100%; transition: background 0.15s ease;
    position: relative;
    border: 1px solid transparent;
  }
  .cc-conv-item:hover  { background: rgba(255,255,255,0.05); }
  .cc-conv-item.active { background: rgba(240,192,96,0.08); border-color: rgba(240,192,96,0.15); }

  .cc-conv-menu {
    position: absolute; right: 0; top: calc(100% + 2px); z-index: 200;
    min-width: 160px; background: #13151f;
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
    padding: 4px; box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    animation: cc-slide-u 0.12s ease forwards;
  }
  .cc-conv-menu-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 8px 10px; border: none;
    border-radius: 7px; background: transparent;
    font-family: var(--font-body); font-size: 0.8rem;
    cursor: pointer; text-align: left; transition: background 0.1s ease; min-height: 34px;
  }
  .cc-conv-menu-item:hover { background: rgba(255,255,255,0.06); }

  .cc-plan-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
    transition: all 0.15s ease; margin-bottom: 4px;
  }
  .cc-plan-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.09); }

  .cc-main {
    flex: 1;
    display: flex; flex-direction: column;
    height: 100vh; overflow: hidden; min-width: 0;
  }

  .cc-messages {
    flex: 1; overflow-y: auto;
    padding: 24px 32px 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.06) transparent;
  }
  .cc-messages::-webkit-scrollbar { width: 4px; }
  .cc-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  .cc-input-wrap {
    padding: 12px 32px 20px;
    flex-shrink: 0;
  }
  .cc-input-bar {
    max-width: 720px; margin: 0 auto;
    background: rgba(14,16,28,0.95);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 10px 10px 10px 20px;
    display: flex; align-items: flex-end; gap: 10px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .cc-input-bar:focus-within {
    border-color: rgba(240,192,96,0.25);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(240,192,96,0.1), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .cc-textarea {
    flex: 1; background: transparent; border: none; outline: none;
    color: rgba(255,255,255,0.88);
    font-family: var(--font-body); font-size: 0.92rem;
    line-height: 1.6; resize: none;
    min-height: 24px; max-height: 120px;
    overflow-y: auto; padding: 4px 0;
    scrollbar-width: none;
  }
  .cc-textarea::-webkit-scrollbar { display: none; }
  .cc-textarea::placeholder { color: rgba(255,255,255,0.22); }
  .cc-send-btn {
    width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
    border: none; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s ease;
  }

  .cc-caps-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(4,6,14,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 24px 20px 80px;
    overflow-y: auto;
    animation: cc-overlay 0.2s ease forwards;
  }
  .cc-caps-panel {
    width: 100%; max-width: 860px;
    animation: cc-scale-in 0.22s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
  }

  .cc-mobile-nav {
    display: none;
    position: fixed; bottom: 12px; left: 12px; right: 12px;
    height: 58px; z-index: 100;
    background: rgba(10,12,22,0.95);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
    align-items: center; justify-content: space-around;
  }

  .cc-menu-btn {
    display: none; position: fixed; left: 20px; top: 20px; z-index: 50;
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(12,14,24,0.92);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(16px);
    align-items: center; justify-content: center;
    color: rgba(255,255,255,0.5); cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  @media (max-width: 768px) {
    .cc-rail    { display: none; }
    .cc-main    { height: 100vh; }
    .cc-messages { padding: 16px 16px 8px; }
    .cc-input-wrap { padding: 8px 12px 82px; }
    .cc-mobile-nav { display: flex; }
    .cc-menu-btn   { display: flex; }
    .cc-input-bar  { border-radius: 16px; }
    .cc-top-bar    { padding: 0 14px 0 68px !important; }
  }
  @media (max-width: 420px) {
    .cc-msg-content { font-size: 0.88rem !important; }
    .cc-messages { padding: 12px 12px 8px; }
  }
`

/* ─────────────────────────────────────────────────────────────
   INLINE SIGN-IN MODAL
───────────────────────────────────────────────────────────── */
function InlineSignInModal({ onSuccess, onCancel }) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleSignIn = async () => {
    if (!email || !password) return
    setLoading(true); setError(null)
    try {
      const { signIn } = await import("@/lib/supabase/auth")
      const { error }  = await signIn({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      await new Promise(r => setTimeout(r, 300))
      onSuccess()
    } catch { setError("Something went wrong."); setLoading(false) }
  }

  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(4,6,14,0.92)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "32px 28px", maxWidth: 380, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", animation: "cc-fade 0.2s ease" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,192,96,0.7)", marginBottom: 10 }}>Save to Journey</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>Sign in to save this moment</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginBottom: 24 }}>Your conversation will stay exactly as it is.</p>
        {error && <div style={{ background: "rgba(240,60,60,0.1)", border: "1px solid rgba(240,60,60,0.25)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}><p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#f08080", margin: 0 }}>{error}</p></div>}
        {["email","password"].map(field => (
          <div key={field} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{field.toUpperCase()}</label>
            <input autoFocus={field === "email"} type={field} value={field === "email" ? email : password} onChange={e => field === "email" ? setEmail(e.target.value) : setPassword(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSignIn(); if (e.key === "Escape") onCancel() }} placeholder={field === "email" ? "your@email.com" : "••••••••"} autoComplete={field === "email" ? "email" : "current-password"} style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 14px", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontSize: "0.9rem", outline: "none" }} onFocus={e => e.target.style.borderColor = "rgba(240,192,96,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSignIn} disabled={!email || !password || loading} style={{ flex: 2, padding: "11px 0", background: email && password && !loading ? "var(--gradient-gold)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, color: email && password && !loading ? "#060912" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.14em", cursor: email && password && !loading ? "pointer" : "not-allowed", boxShadow: email && password && !loading ? "var(--shadow-gold-sm)" : "none" }}>
            {loading ? "Signing in…" : "SIGN IN & SAVE"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: 16 }}>No account? <a href="/register" style={{ color: "rgba(240,192,96,0.7)", textDecoration: "none" }}>Create one →</a></p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CONSENT MODAL
───────────────────────────────────────────────────────────── */
function ConsentModal({ onAccept }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(4,6,14,0.96)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f1117", border: "1px solid rgba(240,192,96,0.2)", borderRadius: 20, padding: "36px 32px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(240,192,96,0.1)", border: "1px solid rgba(240,192,96,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "rgba(240,192,96,0.8)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,192,96,0.7)", marginBottom: 14 }}>Before we begin</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.4, marginBottom: 12 }}>A safe space for honest conversations</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.75, marginBottom: 28 }}>
          Kairos stores your conversations to provide continuity. What you share is treated with care and is never sold or used for advertising. By continuing you agree to our <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(240,192,96,0.7)", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
        <button onClick={onAccept} style={{ width: "100%", padding: "13px 0", background: "var(--gradient-gold)", border: "none", borderRadius: 12, color: "#060912", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.15em", cursor: "pointer", boxShadow: "var(--shadow-gold-sm)" }}>
          I UNDERSTAND — BEGIN
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCRIPTURE BLOCK
───────────────────────────────────────────────────────────── */
function ScriptureBlock({ text, reference }) {
  return (
    <div style={{ borderLeft: "2px solid rgba(240,192,96,0.4)", paddingLeft: 14, margin: "10px 0" }}>
      <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: "0.92rem", color: "rgba(240,192,96,0.9)", lineHeight: 1.7, margin: 0 }}>&ldquo;{text}&rdquo;</p>
      {reference && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginTop: 6, textTransform: "uppercase" }}>— {reference}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────── */
function Message({ role, content, isNew, verseData, onSave, onSignInToSave, saved, isAuthenticated, wasTruncated, hideIndividualSave }) {
  const isKairos = role === "assistant"

  const renderContent = (text) => {
    const parts = text.split(/\[scripture\](.*?)\[\/scripture\]/gs)
    return parts.map((part, i) => {
      if (i % 2 === 1) { const [t, ref] = part.split("|"); return <ScriptureBlock key={i} text={t} reference={ref} /> }
      return part ? <p key={i} className="cc-msg-content" style={{ fontFamily: isKairos ? "var(--font-heading)" : "var(--font-body)", fontSize: isKairos ? "0.95rem" : "0.9rem", fontWeight: isKairos ? 300 : 400, lineHeight: isKairos ? 1.8 : 1.7, color: isKairos ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.75)", margin: "0 0 6px", whiteSpace: "pre-wrap" }}>{part}</p> : null
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: isKairos ? "row" : "row-reverse", alignItems: "flex-start", gap: 12, marginBottom: 20, animation: isNew ? "cc-fade 0.4s ease" : "none" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: isKairos ? "linear-gradient(135deg, rgba(240,192,96,0.2) 0%, rgba(200,140,40,0.2) 100%)" : "rgba(255,255,255,0.07)", border: isKairos ? "1px solid rgba(240,192,96,0.3)" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        {isKairos ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      </div>
      <div style={{ maxWidth: "82%", padding: "14px 16px", background: isKairos ? "rgba(255,255,255,0.03)" : "rgba(240,192,96,0.06)", border: isKairos ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(240,192,96,0.15)", borderRadius: isKairos ? "4px 14px 14px 14px" : "14px 4px 14px 14px", minWidth: 0 }}>
        {isKairos && <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 8 }}>Kairos</p>}
        {renderContent(content)}
        {wasTruncated && isKairos && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontStyle: "italic", marginTop: 6 }}>Response may be incomplete — ask Kairos to continue.</p>}
        {verseData && <BibleVerse reference={verseData.reference} text={verseData.text} translation={verseData.translation} />}
        {isKairos && !hideIndividualSave && (
          saved ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(240,192,96,0.8)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(240,192,96,0.7)" }}>Saved to journey</span>
            </div>
          ) : (
            <button onClick={isAuthenticated ? onSave : onSignInToSave} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", background: "none", border: "none", padding: "10px 0 0", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-body)", fontSize: "0.7rem", transition: "color 0.15s ease" }} onMouseEnter={e => e.currentTarget.style.color = "rgba(240,192,96,0.8)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              {isAuthenticated ? "Save this moment" : "Sign in to save"}
            </button>
          )
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(240,192,96,0.2), rgba(200,140,40,0.2))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px 14px 14px 14px", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(240,192,96,0.5)", marginRight: 4 }}>Kairos is listening</span>
        {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(240,192,96,0.6)", animation: `cc-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   VERSE OF THE DAY CARD
───────────────────────────────────────────────────────────── */
function VotDCard({ verse, onReflect }) {
  if (!verse) return null
  const prompt = `I'd like to reflect on today's verse — ${verse.ref}${verse.text ? `: "${verse.text}"` : ""}. What does this mean for my life today?`
  return (
    <div style={{ background: "rgba(240,192,96,0.03)", border: "1px solid rgba(240,192,96,0.12)", borderRadius: 18, padding: "22px 24px 18px", marginBottom: 16, animation: "cc-fade 0.6s ease", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,192,96,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "relative" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,192,96,0.5)", marginBottom: 12 }}>Verse of the Day</p>
          {verse.text
            ? <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.9rem, 2vw, 1.05rem)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, marginBottom: 8 }}>&ldquo;{verse.text}&rdquo;</p>
            : <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", fontStyle: "italic", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Loading verse…</p>
          }
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.06em", color: "rgba(240,192,96,0.5)", marginBottom: verse.thought ? 12 : 18 }}>— {verse.ref}</p>
          {verse.thought && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.7, marginBottom: 18 }}>{verse.thought}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onReflect(prompt)} style={{ padding: "7px 18px", borderRadius: 100, background: "var(--gradient-gold)", border: "none", color: "#060912", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.12em", cursor: "pointer", boxShadow: "var(--shadow-gold-sm)", minHeight: 34 }}>
              REFLECT WITH KAIROS
            </button>
            <a href={`/bible?ref=${encodeURIComponent(verse.ref)}`} style={{ display: "inline-flex", alignItems: "center", padding: "7px 18px", borderRadius: 100, background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.12em", textDecoration: "none", minHeight: 34, transition: "all 0.15s ease" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}>
              OPEN IN BIBLE
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTIVE PLAN CARD
───────────────────────────────────────────────────────────── */
function ActivePlanCard({ plan }) {
  if (!plan?.enrollment || plan.enrollment.status === "completed") return null
  const { current_day } = plan.enrollment
  const total = plan.total_days || plan.day_count || 1
  const pct   = Math.min(((current_day - 1) / total) * 100, 100)
  return (
    <a href={`/plans/${plan.id}/day/${current_day}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.02)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", textDecoration: "none", marginBottom: 16, transition: "all 0.15s ease", animation: "cc-fade 0.7s ease" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Today's Plan</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 7 }}>{plan.name || plan.title}</p>
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-gold)", borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)" }}>Day {current_day}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.64rem", color: "rgba(255,255,255,0.15)" }}>of {total}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </a>
  )
}

/* ─────────────────────────────────────────────────────────────
   CAPABILITY CARDS OVERLAY
───────────────────────────────────────────────────────────── */
function CapabilityCardsOverlay({ onSelect, onClose }) {
  return (
    <div className="cc-caps-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="cc-caps-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, padding: "0 4px" }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 8 }}>Guided Conversations</p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 300, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>Where would you like to begin?</h2>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon.X /></button>
        </div>
        {CAPABILITIES.map(group => (
          <div key={group.group} style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 2, color: group.color }}>{group.group}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {group.items.map(item => (
                <button key={item.label} onClick={() => { onSelect(item); onClose() }} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", lineHeight: 1.5, transition: "all 0.18s ease", minHeight: 52 }} onMouseEnter={e => { e.currentTarget.style.borderColor = group.color.replace("0.7", "0.35"); e.currentTarget.style.background = group.color.replace("0.7", "0.05"); e.currentTarget.style.color = "rgba(255,255,255,0.85)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)" }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CONVERSATION ACTION MENU
───────────────────────────────────────────────────────────── */
function ConvMenu({ conv, isOpen, onToggle, onRename, onPin, onDelete }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!isOpen) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onToggle() }
    document.addEventListener("mousedown", h, true)
    return () => document.removeEventListener("mousedown", h, true)
  }, [isOpen, onToggle])

  if (!isOpen) return null
  const items = [
    { label: conv.is_pinned ? "Unpin" : "Pin", icon: <Icon.Pin on={conv.is_pinned} />, color: "rgba(240,192,96,0.8)", action: () => { onPin(); onToggle() } },
    { label: "Rename", icon: <Icon.Edit />,  color: "rgba(255,255,255,0.6)", action: () => { onRename(); onToggle() } },
    { label: "Delete",  icon: <Icon.Trash />, color: "#f08080",               action: () => { onDelete(); onToggle() } },
  ]
  return (
    <div ref={ref} className="cc-conv-menu" onClick={e => e.stopPropagation()}>
      {items.map(it => (
        <button key={it.label} className="cc-conv-menu-item" style={{ color: it.color }} onClick={it.action}>
          <span style={{ opacity: 0.85 }}>{it.icon}</span>{it.label}
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   RAIL SIDEBAR
───────────────────────────────────────────────────────────── */
function Rail({ onDrawerToggle, drawerOpen, currentPath }) {
  return (
    <div className="cc-rail">
      <a href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(240,192,96,0.15) 0%, rgba(200,140,40,0.15) 100%)", border: "1px solid rgba(240,192,96,0.25)", marginBottom: 16, textDecoration: "none" }}>
        <Icon.Sparkle />
      </a>
      <button className={`cc-rail-btn${drawerOpen ? " active" : ""}`} onClick={onDrawerToggle} aria-label="Toggle menu" style={{ marginBottom: 8 }}>
        <Icon.Menu />
        <span className="cc-tooltip">Menu</span>
      </button>
      <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0 8px" }} />
      {NAV.map(item => {
        const active = currentPath === item.href || (item.href !== "/journey" && currentPath.startsWith(item.href)) || (item.href === "/journey" && currentPath === "/journey")
        return (
          <a key={item.href} href={item.href} className={`cc-rail-btn${active ? " active" : ""}`} style={{ marginBottom: 2 }}>
            <item.Icon />
            <span className="cc-tooltip">{item.label}</span>
          </a>
        )
      })}
      <div style={{ marginTop: "auto" }}>
        <button className="cc-rail-btn" onClick={() => window.__kairosNewConversation?.()} aria-label="New conversation" style={{ marginBottom: 6 }}>
          <Icon.Plus />
          <span className="cc-tooltip">New conversation</span>
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DRAWER
───────────────────────────────────────────────────────────── */
function Drawer({ onClose, conversations, currentConvId, onSelectConv, onNewConv, enrolledPlans, userName, initials, isAuth, onCapabilityCards, onRenameConv, onPinConv, onDeleteConv }) {
  const [convMenuId, setConvMenuId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal,  setRenameVal]  = useState("")
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/journey"

  const handleRenameSubmit = (id) => {
    if (renameVal.trim()) onRenameConv(id, renameVal.trim())
    setRenamingId(null); setRenameVal("")
  }

  return (
    <>
      <div className="cc-drawer-overlay" onClick={onClose} />
      <div className="cc-drawer">
        {/* Header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, rgba(240,192,96,0.25), rgba(200,140,40,0.25))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.22em", background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>KAIROS</span>
            </a>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.X /></button>
          </div>
        </div>

        <div className="cc-drawer-scroll">
          {/* Navigation */}
          <p className="cc-drawer-label">Navigation</p>
          {NAV.map(item => {
            const active = currentPath === item.href || (item.href !== "/journey" && currentPath.startsWith(item.href))
            return (
              <a key={item.href} href={item.href} className={`cc-drawer-link${active ? " active" : ""}`} onClick={onClose}>
                <span style={{ color: active ? "rgba(240,192,96,0.8)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}><item.Icon /></span>
                {item.label}
                {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "rgba(240,192,96,0.7)", flexShrink: 0 }} />}
              </a>
            )
          })}

          {/* Capability cards */}
          <button className="cc-drawer-link" style={{ color: "rgba(255,255,255,0.4)" }} onClick={() => { onCapabilityCards(); onClose() }}>
            <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}><Icon.Grid /></span>
            Guided Conversations
          </button>

          {/* Enrolled plans */}
          {isAuth && enrolledPlans.length > 0 && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "10px 0 6px" }} />
              <p className="cc-drawer-label">Active Plans</p>
              {enrolledPlans.map(plan => {
                const pct = Math.min(((plan.enrollment.current_day - 1) / (plan.total_days || 1)) * 100, 100)
                return (
                  <a key={plan.id} href={`/plans/${plan.id}/day/${plan.enrollment.current_day}`} className="cc-plan-item" onClick={onClose}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>{plan.title || plan.name}</p>
                      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-gold)", borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>Day {plan.enrollment.current_day}</span>
                  </a>
                )
              })}
            </>
          )}

          {/* Conversations */}
          {isAuth && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "10px 0 6px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 4px" }}>
                <p className="cc-drawer-label" style={{ padding: 0, margin: 0 }}>Conversations</p>
                <button onClick={() => { onNewConv(); onClose() }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 8, background: "rgba(240,192,96,0.08)", border: "1px solid rgba(240,192,96,0.15)", color: "rgba(240,192,96,0.7)", fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.12em", cursor: "pointer" }}>
                  <Icon.Plus /> NEW
                </button>
              </div>

              {conversations.length === 0 && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.18)", padding: "8px 10px", lineHeight: 1.5 }}>No previous conversations yet.</p>
              )}

              {conversations.map(conv => (
                <div key={conv.id} style={{ position: "relative" }}>
                  {renamingId === conv.id ? (
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onBlur={() => handleRenameSubmit(conv.id)}
                      onKeyDown={e => { if (e.key === "Enter") handleRenameSubmit(conv.id); if (e.key === "Escape") { setRenamingId(null); setRenameVal("") } }}
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(240,192,96,0.4)", borderRadius: 9, padding: "7px 10px", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontSize: "0.8rem", outline: "none", marginBottom: 2 }}
                    />
                  ) : (
                    /*
                     * FIX: was <button> containing a <button> (nested button = invalid HTML + hydration error).
                     * Changed outer element to <div role="button"> so the inner ⋯ button is valid.
                     */
                    <div
                      className={`cc-conv-item${conv.id === currentConvId ? " active" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => { onSelectConv(conv); onClose() }}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectConv(conv); onClose() } }}
                    >
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: conv.id === currentConvId ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                          {conv.is_pinned && <span style={{ color: "rgba(240,192,96,0.7)", marginRight: 4 }}>📌</span>}
                          {conv.title || "Untitled"}
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>
                          {formatRelativeTime(conv.updated_at || conv.created_at)}
                        </p>
                      </div>
                      {/* This button is now a valid child of a div, not a button */}
                      <button
                        style={{ width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s ease" }}
                        onClick={e => { e.stopPropagation(); setConvMenuId(convMenuId === conv.id ? null : conv.id) }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)" }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.2)" }}
                      >
                        <Icon.More />
                      </button>
                    </div>
                  )}
                  <ConvMenu
                    conv={conv}
                    isOpen={convMenuId === conv.id}
                    onToggle={() => setConvMenuId(v => v === conv.id ? null : conv.id)}
                    onRename={() => { setRenamingId(conv.id); setRenameVal(conv.title || "") }}
                    onPin={() => onPinConv(conv.id, !conv.is_pinned)}
                    onDelete={() => onDeleteConv(conv.id)}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* User chip */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          {isAuth ? (
            <a href="/account" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "8px 10px", borderRadius: 10, transition: "background 0.15s ease" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(240,192,96,0.2), rgba(200,140,40,0.2))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(240,192,96,0.8)", flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName?.split(" ")[0]}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>View account →</p>
              </div>
            </a>
          ) : (
            <a href="/login" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, textDecoration: "none", background: "rgba(240,192,96,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(240,192,96,0.15)", transition: "all 0.15s ease" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,192,96,0.1)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)" }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(240,192,96,0.06)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.15)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(240,192,96,0.7)" }}>Sign in</span>
            </a>
          )}
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────── */
function MobileNav({ onMenuOpen, currentPath }) {
  const items = [
    { label: "Menu",    Icon: Icon.Menu,    action: onMenuOpen, href: null },
    { label: "Saved",   Icon: Icon.Saved,   href: "/journey/saved" },
    { label: "Bible",   Icon: Icon.Bible,   href: "/bible" },
    { label: "Plans",   Icon: Icon.Plans,   href: "/plans" },
    { label: "Account", Icon: Icon.Account, href: "/account" },
  ]
  return (
    <nav className="cc-mobile-nav" aria-label="Mobile navigation">
      {items.map(item => {
        const active = item.href && (currentPath === item.href || currentPath.startsWith(item.href))
        const content = (
          <>
            <item.Icon />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.08em" }}>{item.label}</span>
          </>
        )
        return item.href ? (
          <a key={item.label} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", color: active ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.3)", minWidth: 44, minHeight: 44, justifyContent: "center", transition: "color 0.15s ease" }}>{content}</a>
        ) : (
          <button key={item.label} onClick={item.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", color: "rgba(255,255,255,0.3)", minWidth: 44, minHeight: 44, justifyContent: "center", cursor: "pointer" }}>{content}</button>
        )
      })}
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   SAVE CONVERSATION BAR
───────────────────────────────────────────────────────────── */
function SaveConversationBar({ messages, isAuth, conversationId, onSaveConversation, onSignInToSave }) {
  if (messages.filter(m => m.role === "assistant" && !m.isCapabilityFrame).length === 0) return null
  return (
    <div style={{ maxWidth: 720, margin: "0 auto 8px", display: "flex", justifyContent: "flex-end", paddingRight: 2 }}>
      <button onClick={isAuth ? onSaveConversation : onSignInToSave} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "rgba(240,192,96,0.07)", border: "1px solid rgba(240,192,96,0.18)", color: "rgba(240,192,96,0.7)", fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.15s ease" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,192,96,0.12)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.35)" }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(240,192,96,0.07)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.18)" }}>
        <Icon.Save />
        SAVE CONVERSATION
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPANION COMPONENT
───────────────────────────────────────────────────────────── */
export default function CompanionCore({ profile: _profile = null }) {
  const { settings, updateSetting } = useSettings()
  const { isAuth, profileId, loading: authLoading, user } = useAuthState()

  // ── Conversation state ──
  const [messages,         setMessages]         = useState([])
  const [input,            setInput]            = useState("")
  const [loading,          setLoading]          = useState(false)
  const [started,          setStarted]          = useState(false)
  const [newMsgIdx,        setNewMsgIdx]        = useState(null)
  const [conversationId,   setConversationId]   = useState(null)
  const [savedMsgIds,      setSavedMsgIds]      = useState(new Set())
  const [lastModelId,      setLastModelId]      = useState(null)

  // ── UI state ──
  const [showConsent,       setShowConsent]       = useState(false)
  const [drawerOpen,        setDrawerOpen]        = useState(false)
  const [showCapabilities,  setShowCapabilities]  = useState(false)
  const [pendingSave,       setPendingSave]       = useState(null)
  const [savingModal,       setSavingModal]       = useState(false)
  const [showInlineSignIn,  setShowInlineSignIn]  = useState(false)
  const [saveConvModal,     setSaveConvModal]     = useState(false)
  const [convPersistLoaded, setConvPersistLoaded] = useState(false)

  // ── Sidebar data ──
  const [votd,          setVotd]          = useState(null)
  const [activePlan,    setActivePlan]    = useState(null)
  const [enrolledPlans, setEnrolledPlans] = useState([])
  const [conversations, setConversations] = useState([])

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const textareaRef = useRef(null)

  const translation = settings.bibleTranslation || "WEB"
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/journey"

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null
  const initials  = userName ? userName.trim().split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase() : "K"

  // ── Expose new conversation handler globally for Rail button ──
  useEffect(() => {
    window.__kairosNewConversation = startNewConversation
    return () => { delete window.__kairosNewConversation }
  })

  // ── Consent ──
  useEffect(() => {
    const accepted = document.cookie.split("; ").find(r => r.startsWith("kairos_consent="))
    if (!accepted) setShowConsent(true)
  }, [])

  const handleConsentAccept = () => {
    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1)
    document.cookie = `kairos_consent=1; expires=${exp.toUTCString()}; path=/; SameSite=Lax`
    setShowConsent(false)
  }

  // ── Bible verse handoff from Bible reader ──
  useEffect(() => {
    try {
      const ctx = sessionStorage.getItem("kairos_verse_context")
      if (ctx) { sessionStorage.removeItem("kairos_verse_context"); setInput(ctx); setStarted(true) }
    } catch (_) {}
  }, [])

  // ── VotD ──
  useEffect(() => {
    const { ref, thought } = getTodaysVerse()
    setVotd({ ref, thought, text: null })
    fetch(`/api/bible/verse?ref=${encodeURIComponent(ref)}&translation=WEB`)
      .then(r => r.json())
      .then(d => { if (d.success) setVotd({ ref, thought, text: d.text }) })
      .catch(() => {})
  }, [])

  // ── Load plans + conversations when authenticated ──
  useEffect(() => {
    if (!isAuth || authLoading) return

    // Plans
    fetch("/api/plans")
      .then(r => r.json())
      .then(d => {
        const plans = d.plans || []
        const active = plans.find(p => p.enrollment?.status === "active")
        if (active) setActivePlan(active)
        setEnrolledPlans(plans.filter(p => p.enrollment?.status === "active"))
      })
      .catch(() => {})

    // Conversations
    fetch("/api/user/conversations?limit=30")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setConversations(d.conversations || [])
          // Auto-restore most recent conversation on first load
          if (!convPersistLoaded && d.conversations?.length > 0) {
            const latest = d.conversations[0]
            if (latest.messages?.length > 0) {
              restoreConversation(latest)
            }
          }
          setConvPersistLoaded(true)
        }
      })
      .catch(() => { setConvPersistLoaded(true) })
  }, [isAuth, authLoading, convPersistLoaded])

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // ── Restore a conversation from history ──
const restoreConversation = async (conv) => {
  if (!conv.messages?.length) {
    // Messages not in local state — fetch from server
    try {
      const r = await fetch(`/api/user/conversations?limit=30`)
      const d = await r.json()
      if (d.success) {
        const full = d.conversations?.find(c => c.id === conv.id)
        console.log("[Kairos] restoreConversation fetch:", conv.id, "found:", full?.id, "messages:", full?.messages?.length)
        if (full?.messages?.length) {
          setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, messages: full.messages } : c))
          restoreConversation(full)
        } else {
          // Conversation exists but genuinely has no messages — just switch context
          setMessages([])
          setConversationId(conv.id)
          setStarted(false)
        }
      }
    } catch {}
    return
  }
  const restored = conv.messages.map(m => ({
    role:         m.role,
    content:      m.content,
    wasTruncated: false,
  }))
  setMessages(restored)
  setConversationId(conv.id)
  setStarted(true)
  setNewMsgIdx(null)
}

  // ── Start a fresh conversation ──
  const startNewConversation = useCallback(() => {
    setMessages([])
    setInput("")
    setConversationId(null)
    setSavedMsgIds(new Set())
    setLastModelId(null)
    setStarted(false)
    setNewMsgIdx(null)
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // ── Conversation management ──
  const handleRenameConv = async (id, title) => {
    await fetch("/api/user/conversations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title }) })
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c))
  }

  const handlePinConv = async (id, is_pinned) => {
    await fetch("/api/user/conversations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_pinned }) })
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, is_pinned } : c)
      return [...updated].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
    })
  }

  const handleDeleteConv = async (id) => {
    await fetch(`/api/user/conversations?id=${id}`, { method: "DELETE" })
    setConversations(prev => prev.filter(c => c.id !== id))
    if (conversationId === id) startNewConversation()
  }

  // ── Input handling ──
  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
  }

  const fetchVerse = async (reference) => {
    try {
      const r = await fetch(`/api/bible/verse?ref=${encodeURIComponent(reference)}&translation=${translation}`)
      const d = await r.json()
      if (d.success) return d
    } catch {}
    return null
  }

  // ── Per-message save ──
  const handleSave         = (idx) => { if (!savedMsgIds.has(idx)) setPendingSave(idx) }
  const handleSignInToSave = (idx) => { setPendingSave(idx); setShowInlineSignIn(true) }
  const handleInlineSignInSuccess = () => setShowInlineSignIn(false)

  const handleSaveConfirm = async ({ title, entry_type }) => {
    const idx = pendingSave
    if (idx === null) return
    const msg = messages[idx]
    if (!msg) return
    setSavingModal(true)
    try {
      const scripture_ref = msg.verseData ? `${msg.verseData.reference} (${msg.verseData.translation})` : null
      const res = await fetch("/api/journey/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: msg.content, title, entry_type, scripture_ref, conversation_id: conversationId }) })
      const d = await res.json()
      if (d.success) setSavedMsgIds(prev => new Set([...prev, idx]))
    } catch (err) { console.error("[Kairos] Save error:", err.message) }
    finally { setSavingModal(false); setPendingSave(null) }
  }

  // ── Save entire conversation ──
  const handleSaveConversation = () => setSaveConvModal(true)
  const handleSaveConvConfirm  = async ({ title, entry_type }) => {
    setSavingModal(true)
    try {
      const content = messages
        .filter(m => !m.isCapabilityFrame)
        .map(m => `${m.role === "assistant" ? "Kairos" : "Me"}: ${m.content}`)
        .join("\n\n")
      const res = await fetch("/api/journey/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title, entry_type, conversation_id: conversationId }) })
      const d = await res.json()
      if (d.success) {
        const allIdxs = messages.reduce((acc, m, i) => { if (m.role === "assistant") acc.add(i); return acc }, new Set())
        setSavedMsgIds(allIdxs)
      }
    } catch (err) { console.error("[Kairos] Save conv error:", err.message) }
    finally { setSavingModal(false); setSaveConvModal(false) }
  }

  // ── Reflect from verse ──
  const handleReflectFromVerse = (prompt) => {
    setInput(prompt); setStarted(true)
    setTimeout(() => { inputRef.current?.focus(); if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px" } }, 50)
  }

  // ── Capability card click ──
  const handleCapabilityClick = (item) => {
    const frameMsg = { role: "assistant", content: item.frame, isCapabilityFrame: true, wasTruncated: false }
    setMessages([frameMsg]); setNewMsgIdx(0); setStarted(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ── Send message ──
  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setStarted(true); setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    const userMsg = { role: "user", content: text }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory); setNewMsgIdx(updatedHistory.length - 1); setLoading(true)
    try {
      const verseRef = detectVerseRequest(text)
      const isSearch = detectBibleSearch(text)
      let verseData = null
      if (verseRef) verseData = await fetchVerse(verseRef)
      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:      text,
          history:      messages.map(m => ({ role: m.role, content: m.content })),
          verseContext: verseData ? `Exact text already retrieved: "${verseData.text}" — ${verseData.reference} (${verseData.translation}). Reference this directly.` : null,
          isVerseRequest: !!verseRef,
          isSearch,
          lastModelId,
          conversationId,
        }),
      })
      const data = await res.json()

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
        setConversations(prev => [{
          id:         data.conversationId,
          title:      truncateText(text, 40),
          messages:   [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_pinned:  false,
        }, ...prev])
      }

      if (data.modelId) setLastModelId(data.modelId)

      const assistantMsg = {
        role:         "assistant",
        content:      data.reply || "Something stilled. Please try again.",
        escalated:    data.escalated || false,
        verseData,
        wasTruncated: data.wasTruncated || false,
      }
      const final = [...updatedHistory, assistantMsg]
      setMessages(final); setNewMsgIdx(final.length - 1)

      // Update conversation title in sidebar
      if (conversationId || data.conversationId) {
        setConversations(prev => prev.map(c => {
          if (c.id === (conversationId || data.conversationId) && (c.title === "Untitled conversation" || c.title === truncateText(text, 40))) {
            return { ...c, title: truncateText(text, 40), updated_at: new Date().toISOString() }
          }
          return c
        }))
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something stilled for a moment. Please share what is on your heart again." }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const pendingMsg    = pendingSave !== null ? messages[pendingSave] : null
  const showSaveModal = pendingSave !== null && isAuth && !showInlineSignIn
  const hasConvToSave = messages.filter(m => m.role === "assistant" && !m.isCapabilityFrame).length > 0

  return (
    <>
      <style>{css}</style>

      {/* ── Modals ── */}
      {showConsent      && <ConsentModal onAccept={handleConsentAccept} />}
      {showCapabilities && <CapabilityCardsOverlay onSelect={handleCapabilityClick} onClose={() => setShowCapabilities(false)} />}
      {showInlineSignIn && <InlineSignInModal onSuccess={handleInlineSignInSuccess} onCancel={() => { setShowInlineSignIn(false); setPendingSave(null) }} />}

      <SaveMomentModal
        isOpen={showSaveModal}
        content={pendingMsg?.content || ""}
        scriptureRef={pendingMsg?.verseData ? `${pendingMsg.verseData.reference} (${pendingMsg.verseData.translation})` : null}
        onConfirm={handleSaveConfirm}
        onCancel={() => setPendingSave(null)}
        saving={savingModal}
      />

      <SaveMomentModal
        isOpen={saveConvModal}
        content={messages.filter(m => !m.isCapabilityFrame).map(m => `${m.role === "assistant" ? "Kairos" : "Me"}: ${m.content}`).join("\n\n")}
        scriptureRef={null}
        onConfirm={handleSaveConvConfirm}
        onCancel={() => setSaveConvModal(false)}
        saving={savingModal}
        titlePlaceholder="Name this conversation…"
      />

      {/* ── Mobile menu button ── */}
      <button className="cc-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
        <Icon.Menu />
      </button>

      <div className="cc-layout" style={{ background: "var(--color-void)" }}>

        {/* ── RAIL ── */}
        <Rail onDrawerToggle={() => setDrawerOpen(v => !v)} drawerOpen={drawerOpen} currentPath={currentPath} />

        {/* ── DRAWER ── */}
        {drawerOpen && (
          <Drawer
            onClose={() => setDrawerOpen(false)}
            conversations={conversations}
            currentConvId={conversationId}
            onSelectConv={restoreConversation}
            onNewConv={startNewConversation}
            enrolledPlans={enrolledPlans}
            userName={userName}
            initials={initials}
            isAuth={isAuth}
            onCapabilityCards={() => setShowCapabilities(true)}
            onRenameConv={handleRenameConv}
            onPinConv={handlePinConv}
            onDeleteConv={handleDeleteConv}
          />
        )}

        {/* ── MAIN CHAT COLUMN ── */}
        <div className="cc-main">

          {/* Top bar */}
          <div className="cc-top-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 52, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(6,9,18,0.6)", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>Companion</p>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(100,220,100,0.7)", boxShadow: "0 0 6px rgba(100,220,100,0.5)", animation: "cc-pulse 2.5s ease-in-out infinite" }} />
              {conversationId && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.15)" }}>· {conversations.find(c => c.id === conversationId)?.title || "Active"}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {started && (
                <button onClick={startNewConversation} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.15s ease" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)" }}>
                  <Icon.Plus /> NEW
                </button>
              )}
              <select value={translation} onChange={e => updateSetting("bibleTranslation", e.target.value)} style={{ background: "rgba(255,255,255,0.04)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 10px", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.72rem", cursor: "pointer", outline: "none" }} onFocus={e => e.target.style.borderColor = "rgba(240,192,96,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}>
                {["WEB","KJV","ASV","BBE"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Messages area */}
          <div className="cc-messages">
            <div style={{ maxWidth: 720, margin: "0 auto" }}>

              {/* Pre-conversation screen */}
              {!started && messages.length === 0 && (
                <div style={{ animation: "cc-fade 0.7s ease" }}>
                  <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,192,96,0.45)", marginBottom: 14 }}>Your appointed moment</p>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.2, marginBottom: 10 }}>
                      {isAuth && userName ? getGreeting(userName) : "Welcome to Kairos"}
                    </h1>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
                      {isAuth ? getGreetingSubtitle() : "A Biblical companion for honest conversations. Sign in to save your journey."}
                    </p>
                  </div>

                  {settings.showVotD !== false && <VotDCard verse={votd} onReflect={handleReflectFromVerse} />}
                  {settings.showActivePlan !== false && <ActivePlanCard plan={activePlan} />}

                  {settings.showExamplePrompts !== false && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Where would you like to begin?</p>
                        <button onClick={() => setShowCapabilities(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.15s ease" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,192,96,0.25)"; e.currentTarget.style.color = "rgba(240,192,96,0.7)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)" }}>
                          <Icon.Grid /> SEE ALL 19
                        </button>
                      </div>
                      {CAPABILITIES.slice(0, 2).map(group => (
                        <div key={group.group} style={{ marginBottom: 16 }}>
                          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.16em", textTransform: "uppercase", color: group.color.replace("0.7", "0.5"), marginBottom: 7, paddingLeft: 2 }}>{group.group}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 6 }}>
                            {group.items.map(item => (
                              <button key={item.label} onClick={() => handleCapabilityClick(item)} style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontSize: "0.82rem", cursor: "pointer", textAlign: "left", lineHeight: 1.5, transition: "all 0.15s ease", minHeight: 44 }} onMouseEnter={e => { e.currentTarget.style.borderColor = group.color.replace("0.7", "0.3"); e.currentTarget.style.background = group.color.replace("0.7", "0.05"); e.currentTarget.style.color = "rgba(255,255,255,0.8)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)" }}>
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isNew={i === newMsgIdx}
                  verseData={msg.verseData || null}
                  isAuthenticated={isAuth}
                  saved={savedMsgIds.has(i)}
                  onSave={() => handleSave(i)}
                  onSignInToSave={() => handleSignInToSave(i)}
                  wasTruncated={msg.wasTruncated || false}
                  hideIndividualSave={false}
                />
              ))}

              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="cc-input-wrap" style={{ background: "var(--color-void)" }}>
            {started && hasConvToSave && (
              <SaveConversationBar
                messages={messages}
                isAuth={isAuth}
                conversationId={conversationId}
                onSaveConversation={handleSaveConversation}
                onSignInToSave={() => { setPendingSave(-1); setShowInlineSignIn(true) }}
              />
            )}
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div className="cc-input-bar">
                <textarea
                  ref={el => { textareaRef.current = el; inputRef.current = el }}
                  className="cc-textarea"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what is on your heart…"
                  rows={1}
                />
                <button
                  className="cc-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  style={{ background: input.trim() && !loading ? "var(--gradient-gold)" : "rgba(255,255,255,0.06)", cursor: input.trim() && !loading ? "pointer" : "not-allowed", boxShadow: input.trim() && !loading ? "var(--shadow-gold-sm)" : "none" }}
                  onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.opacity = "0.85" }}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {loading
                    ? <div style={{ width: 14, height: 14, border: "1.5px solid rgba(255,255,255,0.2)", borderTop: "1.5px solid rgba(255,255,255,0.7)", borderRadius: "50%", animation: "cc-spin 0.7s linear infinite" }} />
                    : <Icon.Send />
                  }
                </button>
              </div>
              <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "rgba(255,255,255,0.12)", marginTop: 8, letterSpacing: "0.02em" }}>
                Enter to send · Shift+Enter for new line · Grounded in Biblical truth
              </p>
            </div>
          </div>

        </div>{/* end cc-main */}
      </div>{/* end cc-layout */}

      <MobileNav onMenuOpen={() => setDrawerOpen(true)} currentPath={currentPath} />
    </>
  )
}