/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f7f9",
        border: "#d9d9dd",
        blue: {
          DEFAULT: "#1f64c9",
        },
        grayx: {
          DEFAULT: "#c5c5c8",
          light: "#f3f3f6",
        },
        success: "#23b26e",
        warning: "#f0ad4e",
        neutral: "#6b7280",
      },
      borderRadius: {
        md: "10px",
      },
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        progress: "progress 2s ease-in-out infinite",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
        },
        ".scrollbar-none": {
          "scrollbar-width": "none",
        },
        ".scrollbar": {
          "&::-webkit-scrollbar": { width: "8px", height: "8px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "#d9d9dd",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#c1c1c6" },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
