"use client"

/**
 * KAIROS — Settings Context
 *
 * Wraps the app in layout.jsx. Provides { settings, updateSetting } to
 * every component via useSettings(). Handles:
 * - Initial load from localStorage
 * - Sync from Supabase on authenticated load (cross-device)
 * - Applying CSS variables to :root on every change
 * - Listening for OS theme changes when theme = "system"
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  applySettings,
} from "@/lib/settings"
import { supabase } from "@/lib/supabase/client"

const SettingsContext = createContext(null)

/* ── Provider ────────────────────────────────────────────── */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS })
  const [userId,   setUserId]   = useState(null)

  // ── Init on mount ─────────────────────────────────────────
  useEffect(() => {
    // 1. Load from localStorage immediately
    const local = loadSettings()
    setSettings(local)
    applySettings(local)

    // 2. Check auth and sync from Supabase
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || user.is_anonymous) return

      const { data: profile } = await supabase
        .from("users")
        .select("id, settings")
        .eq("auth_id", user.id)
        .maybeSingle()

      if (!profile?.id) return
      setUserId(profile.id)

      // DB settings win over localStorage — they are the source of truth
      // for authenticated users (enables cross-device sync)
      if (profile.settings && Object.keys(profile.settings).length > 0) {
        const merged = { ...DEFAULT_SETTINGS, ...profile.settings }
        setSettings(merged)
        applySettings(merged)
        localStorage.setItem("kairos_settings", JSON.stringify(merged))
      }
    })
  }, [])

  // ── Listen for OS theme changes when theme = "system" ─────
  useEffect(() => {
    if (settings.theme !== "system") return
    const mq      = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applySettings(settings)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [settings])

  // ── Update a single setting key ───────────────────────────
  const updateSetting = useCallback(
    async (key, value) => {
      const updated = { ...settings, [key]: value }
      setSettings(updated)
      applySettings(updated)
      await saveSettings(updated, userId)
    },
    [settings, userId]
  )

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

/* ── Hook ────────────────────────────────────────────────── */
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}