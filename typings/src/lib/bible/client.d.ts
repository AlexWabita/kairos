
/**
 * KAIROS — Bible API Dual Fallback Client
 *
 * Provider 1: rest.api.bible — full search, 2500+ translations
 * Provider 2: bible-api.com — no auth, always available, KJV/WEB
 *
 * Flow:
 *   1. Try rest.api.bible
 *   2. If it fails → automatically fall back to bible-api.com
 *   3. All failures logged to terminal — never shown to users
 *
 * Server-side only. API keys never reach the browser.
 */

const BASE_URL = "https://rest.api.bible/v1"

// ── TRANSLATION MAP ───────────────────────────────────────────
// rest.api.bible Bible IDs for common translations
declare interface TRANSLATION_IDSType {
	static WEB: any;
}

declare interface translationMapType {
	static reference: any;

	static text: any;

	static translation: any;

	static source: any;
}

declare interface bookMapType {}
