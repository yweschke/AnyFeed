/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "rgba(255, 255, 255, 1)",
          dark: "rgba(13, 27, 42, 1)",
        },
        secondary: {
          light: "rgba(119, 141, 169, 1)",
          dark: "rgba(27, 38, 59, 1)",
        },
        textPrimary: {
          light: "rgba(13, 27, 42, 1)",
          dark: "rgba(224, 225, 221, 1)",
        },
        textSecondary: {
          light: "rgba(65, 90, 119, 1)",
          dark: "rgba(119, 141, 169, 1)",
        },
        textMuted: {
          light: "rgba(119, 141, 169, 1)",
          dark: "rgba(65, 90, 119, 1)",
        },
        accent: {
          light: "rgba(50, 70, 100, 1)",
          dark: "rgba(90, 110, 140, 1)",
        },
      },
    },
  },
  plugins: [],
}
