
/**
 * KAIROS — Settings Utility
 *
 * Single source of truth for user preferences.
 * - Anonymous users: localStorage only
 * - Authenticated users: localStorage (cache) + Supabase users.settings (sync)
 *
 * applySettings() writes CSS variables directly onto :root so every
 * component that uses var(--font-body), var(--color-accent), etc.
 * updates automatically — no re-render needed.
 */

import { supabase } from "@/lib/supabase/client"

/* ── Defaults ────────────────────────────────────────────── */
declare interface DEFAULT_SETTINGSType {
	static theme: any;

	static accentColor: string;

	static fontFamily: string;

	static bibleTranslation: string;

	static language: any;
}

declare interface ACCENT_COLORSType {
	static covenant: {	};

	static stillwaters: {	};

	static crimsongrace: {	};

	static olivebranch: {	};

	static dawn: {	};

	static dusk: {	};

	static selah: {	};
}

declare interface FONT_FAMILIESType {
	static standard: {
	static label: string;

	static description: string;

	static heading: string;

	static body: string;

	static sample: string;
	};

	static scholar: {
	static label: string;

	static description: string;

	static heading: string;

	static body: string;

	static sample: string;
	};

	static pilgrim: {
	static label: string;

	static description: string;

	static heading: string;

	static body: string;

	static sample: string;
	};
}

declare interface mergedType {}
