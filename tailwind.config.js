/** @type {import('tailwindcss').Config} */

// Helper to avoid crashing dev server if optional Tailwind plugins
// (forms / typography / line-clamp) are not installed yet.
const optionalPlugin = (name) => {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(name);
  } catch {
    return () => {};
  }
};

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        // Base brand palette
        brand: {
          orange: "#F59E0B",
          orangeDark: "#EA580C",
          orangeLight: "#FFE8CF",
          gray: "#6B7280",
          bg: "#F3F4F6",
        },
        // Shorthands used throughout the UI (StackBlitz styles)
        primary: "#F59E0B",
        "primary-dark": "#EA580C",
        "primary-light": "#FFE8CF",
        secondary: "#6B7280",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.06)",
        card: "0 2px 12px rgba(0,0,0,0.05)",
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    optionalPlugin("@tailwindcss/forms"),
    optionalPlugin("@tailwindcss/typography"),
    optionalPlugin("@tailwindcss/line-clamp"),
  ],
};
