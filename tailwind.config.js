/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void:     "#060912",
        deep:     "#0d1428",
        surface:  "#141d35",
        elevated: "#1c2845",
        border:   "#2a3a5c",
        gold: {
          bright: "#f0c060",
          warm:   "#d4a040",
          deep:   "#a07828",
        },
        divine:  "#fff8e8",
        soft:    "#c8d4f0",
        muted:   "#6878a8",
        ember:   "#e06030",
        peace:   "#4090d0",
        life:    "#40a870",
        crisis:  "#c03040",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        heading: ["Cormorant Garamond", "serif"],
        body:    ["Nunito", "sans-serif"],
      },
      boxShadow: {
        "gold-sm": "0 0 20px rgba(240, 192, 96, 0.10)",
        "gold-md": "0 0 40px rgba(240, 192, 96, 0.15)",
        "gold-lg": "0 0 80px rgba(240, 192, 96, 0.20)",
        "deep":    "0 20px 60px rgba(0, 0, 0, 0.50)",
        "card":    "0 4px 24px rgba(0, 0, 0, 0.40), 0 0 1px rgba(240, 192, 96, 0.10)",
      },
      animation: {
        "breathe":      "breathe 4s ease-in-out infinite",
        "float":        "float 6s ease-in-out infinite",
        "sacred-enter": "sacredEnter 0.8s ease forwards",
        "fade-up":      "fadeUp 0.6s ease forwards",
        "pulse-gold":   "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":       { opacity: "1",   transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        sacredEnter: {
          from: { opacity: "0", transform: "translateY(20px)", filter: "blur(4px)" },
          to:   { opacity: "1", transform: "translateY(0)",    filter: "blur(0)"   },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(240, 192, 96, 0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(240, 192, 96, 0.3)" },
        },
      },
      backgroundImage: {
        "hero":    "linear-gradient(135deg, #060912 0%, #0d1428 50%, #1a1030 100%)",
        "gold":    "linear-gradient(135deg, #f0c060 0%, #d4a040 50%, #a07828 100%)",
        "surface": "linear-gradient(180deg, #141d35 0%, #0d1428 100%)",
        "glow":    "radial-gradient(ellipse at center, rgba(240,192,96,0.2) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
}
