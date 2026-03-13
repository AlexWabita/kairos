"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

/* ── Particle Canvas ─────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles()
    }

    const initParticles = () => {
      const count = window.innerWidth < 768 ? 40 : 90
      particlesRef.current = Array.from({ length: count }, () => ({
        x:            Math.random() * canvas.width,
        y:            Math.random() * canvas.height,
        size:         Math.random() * 1.8 + 0.4,
        speedY:       -(Math.random() * 0.25 + 0.08),
        speedX:       (Math.random() - 0.5) * 0.15,
        opacity:      Math.random(),
        opacitySpeed: Math.random() * 0.004 + 0.001,
        isGold:       Math.random() > 0.65,
      }))
    }

    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx   = p.x - p2.x
          const dy   = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(212, 160, 64, ${0.07 * (1 - dist / 110)})`
            ctx.lineWidth   = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
      })

      particlesRef.current.forEach((p) => {
        p.x       += p.speedX
        p.y       += p.speedY
        p.opacity += p.opacitySpeed
        if (p.opacity > 1 || p.opacity < 0) p.opacitySpeed *= -1
        if (p.y < -10)               { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10)               p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10

        ctx.beginPath()
        ctx.fillStyle = p.isGold
          ? `rgba(240, 192, 96, ${p.opacity * 0.75})`
          : `rgba(200, 212, 240, ${p.opacity * 0.35})`
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        if (p.isGold && p.size > 1.2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(240, 192, 96, ${p.opacity * 0.04})`
          ctx.fill()
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
      }}
    />
  )
}

/* ── Glow Orb ─────────────────────────────────────────────── */
function GlowOrb({ size, left, top, color = "rgba(240,192,96,0.18)", delay = "0s" }) {
  return (
    <div
      style={{
        position:      "absolute",
        left,
        top,
        transform:     "translate(-50%, -50%)",
        width:         size,
        height:        size,
        background:    `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        borderRadius:  "50%",
        pointerEvents: "none",
        animation:     `breathe 4s ease-in-out ${delay} infinite`,
      }}
    />
  )
}

/* ── Scroll helper ───────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

/* ── Main Hero Component ──────────────────────────────────── */
export default function Hero() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      style={{
        position:       "relative",
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        overflow:       "hidden",
        background:     "var(--gradient-hero)",
      }}
    >
      {/* Background layers */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          background:    "radial-gradient(ellipse at 50% 60%, rgba(26,16,48,0.6) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow orbs */}
      <GlowOrb size="600px" left="50%"  top="45%"  color="rgba(240,192,96,0.10)"  delay="0s"   />
      <GlowOrb size="300px" left="15%"  top="25%"  color="rgba(64,144,208,0.08)"  delay="1.5s" />
      <GlowOrb size="200px" left="85%"  top="70%"  color="rgba(200,212,240,0.06)" delay="3s"   />
      <GlowOrb size="150px" left="75%"  top="20%"  color="rgba(240,192,96,0.08)"  delay="0.8s" />

      {/* Particle field */}
      <ParticleCanvas />

      {/* ── HERO CONTENT ─────────────────────────────────── */}
      <div
        className="kairos-container"
        style={{
          position:      "relative",
          zIndex:        10,
          textAlign:     "center",
          paddingTop:    "var(--space-16)",
          paddingBottom: "var(--space-16)",
        }}
      >
        {/* Section label */}
        <p
          className="kairos-section-label"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s var(--ease-divine) 0.1s, transform 0.6s var(--ease-divine) 0.1s",
          }}
        >
          Your appointed moment
        </p>

        {/* Main title */}
        <h1
          className="text-display-xl text-gold-gradient"
          style={{
            marginBottom: "var(--space-6)",
            opacity:      visible ? 1 : 0,
            transform:    visible ? "translateY(0)" : "translateY(24px)",
            filter:       visible ? "blur(0)" : "blur(6px)",
            transition:   "opacity 0.8s var(--ease-divine) 0.2s, transform 0.8s var(--ease-divine) 0.2s, filter 0.8s var(--ease-divine) 0.2s",
          }}
        >
          KAIROS
        </h1>

        {/* Subheading */}
        <p
          className="text-heading-md"
          style={{
            fontFamily:  "var(--font-heading)",
            fontWeight:  300,
            color:       "var(--color-soft)",
            maxWidth:    "560px",
            margin:      "0 auto var(--space-10)",
            lineHeight:  "var(--leading-relaxed)",
            opacity:     visible ? 1 : 0,
            transform:   visible ? "translateY(0)" : "translateY(16px)",
            transition:  "opacity 0.8s var(--ease-divine) 0.35s, transform 0.8s var(--ease-divine) 0.35s",
          }}
        >
          A companion grounded in truth — for anyone searching for light
          in the noise of the world.
        </p>

        {/* ── CTA Buttons ────────────────────────────────── */}
        <div
          style={{
            display:        "flex",
            gap:            "var(--space-4)",
            justifyContent: "center",
            flexWrap:       "wrap",
            opacity:        visible ? 1 : 0,
            transform:      visible ? "translateY(0)" : "translateY(12px)",
            transition:     "opacity 0.8s var(--ease-divine) 0.5s, transform 0.8s var(--ease-divine) 0.5s",
          }}
        >
          {/* Primary — goes to the companion */}
          <button
            className="kairos-btn-primary"
            onClick={() => router.push("/journey")}
            style={{ minHeight: "44px" }}
          >
            Begin Your Journey
          </button>

          {/* Secondary — scrolls to About section */}
          <button
            className="kairos-btn-secondary"
            onClick={() => scrollToSection("about")}
            style={{ minHeight: "44px" }}
          >
            Learn More
          </button>
        </div>

        {/* ── Scroll hint arrow ──────────────────────────── */}
        <button
          onClick={() => scrollToSection("about")}
          aria-label="Scroll to learn more"
          style={{
            marginTop:   "var(--space-16)",
            opacity:     visible ? 0.4 : 0,
            transition:  "opacity 1s var(--ease-sacred) 1.2s",
            animation:   visible ? "float 3s ease-in-out infinite" : "none",
            background:  "none",
            border:      "none",
            cursor:      "pointer",
            padding:     "var(--space-2)",
            display:     "block",
            marginLeft:  "auto",
            marginRight: "auto",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-gold-warm)"
            strokeWidth="1.5"
          >
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Bottom fade into next section */}
      <div
        style={{
          position:      "absolute",
          bottom:        0,
          left:          0,
          right:         0,
          height:        "200px",
          background:    "linear-gradient(to bottom, transparent, var(--color-void))",
          pointerEvents: "none",
        }}
      />
    </section>
  )
}