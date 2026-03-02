/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F3D2E",
          foreground: "#FFFFFF",
          hover: "#165942"
        },
        secondary: {
          DEFAULT: "#D4AF37",
          foreground: "#1A1A1A",
          hover: "#E5C158"
        },
        accent: {
          DEFAULT: "#F2F7F5",
          foreground: "#0F3D2E"
        },
        background: "#F9FAF9",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        muted: {
          DEFAULT: "#F2F7F5",
          foreground: "#6B7280"
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        english: ['Outfit', 'sans-serif']
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
