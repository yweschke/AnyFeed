/** @type {import('tailwindcss').Config} */
module.exports = {
<<<<<<< HEAD
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enables dark mode using a "dark" class
  theme: {
    extend: {
      colors: {
        light: {
          "accent": "rgba(13, 27, 42, 1)",
          "text": "rgba(27, 38, 59, 1)",
          "text-muted": "rgba(65, 90, 119, 1)",
          "bg-secondary": "rgba(119, 141, 169, 1)",
          "bg-primary": "rgba(224, 225, 221, 1)",
        },
        dark: {
          "bg-primary": "rgba(3, 12, 20, 1)", // Darker variant
          "bg-secondary": "rgba(18, 24, 36, 1)", // Darker variant
          "accent": "rgba(50, 70, 100, 1)", // Darker variant
          "text-muted": "rgba(90, 110, 140, 1)", // Darker variant
          "text": "rgba(180, 180, 180, 1)", // Slightly dimmed white
=======
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
>>>>>>> 7df5e7457e454141c0c5a94044ca7d38b9f96e99
        },
      },
    },
  },
  plugins: [],
};
