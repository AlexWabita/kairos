export const metadata = {
  title: "Privacy Policy — Kairos",
}

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight:  "100vh",
      background: "var(--gradient-hero)",
      padding:    "var(--space-10) var(--space-5)",
    }}>
      <div style={{
        maxWidth:      "680px",
        margin:        "0 auto",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-8)",
      }}>

        {/* ── Header ───────────────────────────────────────── */}
        <div>
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color:         "var(--color-gold-warm)",
            marginBottom:  "var(--space-3)",
          }}>
            Kairos
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 300,
            color:      "var(--color-divine)",
            lineHeight: 1.3,
            marginBottom: "var(--space-3)",
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize:   "0.75rem",
            color:      "var(--color-muted)",
          }}>
            Last updated: March 2026
          </p>
        </div>

        {/* ── Intro ─────────────────────────────────────────── */}
        <Section>
          <p>
            Kairos is a place for honest, personal conversations. We take seriously what you share
            here — which is why we want to be equally honest about what we collect, how we use it,
            and what control you have over it.
          </p>
          <p>
            This policy is written in plain language. If something is unclear, contact us and we
            will explain it.
          </p>
        </Section>

        {/* ── What we collect ───────────────────────────────── */}
        <Section title="What we collect">
          <p>
            When you use Kairos, we store the following:
          </p>
          <Item label="Conversations">
            The messages you send and the responses Kairos gives. These are stored so the
            conversation can continue across sessions and to improve your experience over time.
          </Item>
          <Item label="Saved moments">
            Entries you choose to save from your conversations — including the title, content,
            and scripture reference you assign to them.
          </Item>
          <Item label="Profile information">
            If you create an account: your email address, display name, and any spiritual context
            you choose to share (faith background, current life season, primary need). This
            context is used only to personalise Kairos's responses to you.
          </Item>
          <Item label="Usage data">
            Basic technical data such as error logs and response times. We do not use analytics
            platforms that track your behaviour across the web.
          </Item>
        </Section>

        {/* ── What we don't collect ─────────────────────────── */}
        <Section title="What we do not collect">
          <p>
            We do not collect payment information. We do not sell your data. We do not show
            you advertisements. We do not share your conversations with third parties except as
            described below.
          </p>
        </Section>

        {/* ── Third parties ─────────────────────────────────── */}
        <Section title="Third-party services">
          <p>
            Kairos relies on the following third-party infrastructure:
          </p>
          <Item label="Supabase">
            Your data — conversations, saved entries, and account information — is stored in
            Supabase, a secure cloud database provider. Supabase processes data in accordance
            with GDPR and SOC 2 standards.
          </Item>
          <Item label="OpenRouter / AI providers">
            Your messages are sent to AI language model providers (including models from
            Meta, OpenAI, and Google) via OpenRouter in order to generate responses. These
            providers do not store your messages beyond what is required to generate a response.
            Conversations are not used to train external AI models.
          </Item>
          <Item label="Bible APIs">
            When you request scripture, we query public Bible API services to retrieve verified
            verse text. No personal data is sent in these requests.
          </Item>
        </Section>

        {/* ── Your rights ───────────────────────────────────── */}
        <Section title="Your rights">
          <Item label="Export your data">
            You can download a complete copy of your saved moments and profile at any time
            from your account page. The export is provided as a JSON file.
          </Item>
          <Item label="Delete your account">
            You can permanently delete your account and all associated data at any time from
            your account page. Deletion is immediate and cannot be undone.
          </Item>
          <Item label="Correct your information">
            You can update your profile information at any time from your account page.
          </Item>
        </Section>

        {/* ── Conversations ─────────────────────────────────── */}
        <Section title="A note on conversations">
          <p>
            The conversations you have with Kairos are personal. We do not read them as a
            matter of routine. They may be accessed only in the event of a serious reported
            safety concern, or as required by applicable law.
          </p>
          <p>
            Kairos is not a substitute for professional counselling, medical advice, or crisis
            support. If you are in crisis, please reach out to a qualified human being.
          </p>
        </Section>

        {/* ── Contact ───────────────────────────────────────── */}
        <Section title="Contact">
          <p>
            If you have questions about this policy or how your data is handled, a dedicated
            contact address will be provided here before Kairos launches publicly.
          </p>
        </Section>

        {/* ── Footer nav ────────────────────────────────────── */}
        <div style={{ paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
          <a
            href="/journey"
            style={{
              fontFamily:     "var(--font-body)",
              fontSize:       "0.75rem",
              color:          "var(--color-muted)",
              textDecoration: "none",
            }}
          >
            ← Back to Kairos
          </a>
        </div>

      </div>
    </div>
  )
}

/* ── Local components ────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{
      background:   "linear-gradient(135deg, rgba(20,29,53,0.8) 0%, rgba(13,20,40,0.8) 100%)",
      border:       "1px solid var(--color-border)",
      borderLeft:   "2px solid rgba(240,192,96,0.2)",
      borderRadius: "var(--radius-xl)",
      padding:      "var(--space-6)",
    }}>
      {title && (
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.6rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "var(--space-4)",
        }}>
          {title}
        </p>
      )}
      <div style={{
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-3)",
        fontFamily:    "var(--font-body)",
        fontSize:      "0.88rem",
        color:         "var(--color-soft)",
        lineHeight:    "var(--leading-relaxed)",
      }}>
        {children}
      </div>
    </div>
  )
}

function Item({ label, children }) {
  return (
    <div>
      <span style={{
        color:       "var(--color-divine)",
        fontWeight:  500,
        marginRight: "var(--space-2)",
      }}>
        {label} —
      </span>
      {children}
    </div>
  )
}