"use client"

/**
 * KAIROS — ConfirmModal
 *
 * Reusable confirmation dialog for all destructive or sensitive actions.
 * Replaces the inline DeleteConfirm in account/page.jsx and is used
 * everywhere a confirmation is needed (delete, sign out, etc.)
 *
 * Usage:
 *   <ConfirmModal
 *     isOpen={showConfirm}
 *     title="Are you sure?"
 *     message="This will permanently delete your account."
 *     detail="This cannot be undone."
 *     confirmLabel="DELETE ACCOUNT"
 *     variant="danger"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *     loading={isDeleting}
 *   />
 *
 * variant: "danger" | "warning" | "neutral"
 */

export default function ConfirmModal({
  isOpen        = false,
  title         = "Are you sure?",
  message       = "",
  detail        = "",
  confirmLabel  = "Confirm",
  cancelLabel   = "Cancel",
  variant       = "danger",
  onConfirm,
  onCancel,
  loading       = false,
}) {
  if (!isOpen) return null

  // Variant colour map
  const V = {
    danger: {
      border:       "rgba(220,60,60,0.4)",
      titleColor:   "#f08080",
      btnBg:        "rgba(220,60,60,0.15)",
      btnBorder:    "rgba(220,60,60,0.4)",
      btnColor:     "#f08080",
    },
    warning: {
      border:       "rgba(240,160,64,0.4)",
      titleColor:   "var(--color-gold-warm)",
      btnBg:        "rgba(240,160,64,0.12)",
      btnBorder:    "rgba(240,160,64,0.4)",
      btnColor:     "var(--color-gold-warm)",
    },
    neutral: {
      border:       "var(--color-border)",
      titleColor:   "var(--color-soft)",
      btnBg:        "rgba(42,58,92,0.5)",
      btnBorder:    "var(--color-border-hover)",
      btnColor:     "var(--color-soft)",
    },
  }
  const v = V[variant] || V.danger

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(6,9,18,0.88)",
        backdropFilter: "blur(8px)",
        zIndex:         "var(--z-modal)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--space-5)",
      }}
    >
      <div style={{
        background:   "linear-gradient(135deg, rgba(20,29,53,0.98) 0%, rgba(13,20,40,0.98) 100%)",
        border:       `1px solid ${v.border}`,
        borderRadius: "var(--radius-xl)",
        padding:      "var(--space-8)",
        maxWidth:     "400px",
        width:        "100%",
        textAlign:    "center",
        boxShadow:    "var(--shadow-deep)",
      }}>

        {/* Title */}
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color:         v.titleColor,
          marginBottom:  "var(--space-4)",
        }}>
          {title}
        </p>

        {/* Main message */}
        {message && (
          <p style={{
            fontFamily:   "var(--font-heading)",
            fontSize:     "1.15rem",
            fontWeight:   300,
            color:        "var(--color-divine)",
            lineHeight:   1.5,
            marginBottom: detail ? "var(--space-3)" : "var(--space-7)",
          }}>
            {message}
          </p>
        )}

        {/* Detail / consequence text */}
        {detail && (
          <p style={{
            fontFamily:   "var(--font-body)",
            fontSize:     "0.8rem",
            color:        "var(--color-muted)",
            lineHeight:   "var(--leading-relaxed)",
            marginBottom: "var(--space-7)",
          }}>
            {detail}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "var(--space-3)" }}>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex:         1,
              padding:      "var(--space-3) var(--space-4)",
              background:   "none",
              border:       "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              color:        "var(--color-muted)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.82rem",
              cursor:       loading ? "not-allowed" : "pointer",
              opacity:      loading ? 0.5 : 1,
              transition:   "all 0.2s ease",
              minHeight:    "44px",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.borderColor = "var(--color-border-hover)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)"
            }}
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex:          1,
              padding:       "var(--space-3) var(--space-4)",
              background:    v.btnBg,
              border:        `1px solid ${v.btnBorder}`,
              borderRadius:  "var(--radius-lg)",
              color:         v.btnColor,
              fontFamily:    "var(--font-display)",
              fontSize:      "0.65rem",
              letterSpacing: "0.12em",
              cursor:        loading ? "wait" : "pointer",
              opacity:       loading ? 0.6 : 1,
              transition:    "all 0.2s ease",
              minHeight:     "44px",
            }}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>

        </div>
      </div>
    </div>
  )
}