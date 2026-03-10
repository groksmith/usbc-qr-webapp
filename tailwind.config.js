/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5d9fb5",
        heading: "#101010",
        "body-text": "#3f3f46",
        muted: "#64748b",
        positive: "#22c55e",
        negative: "#ef4444",
        "gradient-start": "#a1c4da",
        "gradient-end": "#c6dfe6",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        "card-inner": "20px",
        btn: "12px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04)",
        card: "0 4px 24px rgba(0, 0, 0, 0.06)",
        elevated: "0 8px 32px rgba(0, 0, 0, 0.08)",
        sidebar: "-4px 0 48px rgba(0, 0, 0, 0.10)",
      },
    },
  },
  plugins: [],
}

