import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0D1B3E",
          50: "#E8EBF3",
          100: "#C5CCE2",
          200: "#8F9DC4",
          300: "#5A6FA6",
          400: "#324B80",
          500: "#0D1B3E",
          600: "#0A1632",
          700: "#071025",
          800: "#040B18",
          900: "#02050B",
        },
        gold: {
          DEFAULT: "#C9A84C",
          50: "#FAF4E5",
          100: "#F3E5C0",
          200: "#E8CC88",
          300: "#DDB356",
          400: "#C9A84C",
          500: "#B08A2E",
          600: "#8D6D23",
          700: "#6A5119",
          800: "#47360F",
          900: "#231B07",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse at top, #1a2f5e 0%, #0D1B3E 60%)",
        "card-shine": "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-up-delay": "slideUp 0.6s ease-out 0.2s forwards",
        "slide-up-delay-2": "slideUp 0.6s ease-out 0.4s forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
