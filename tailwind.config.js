/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "rgba(256, 256, 256, 1)", // bg-primary from first version (light)
          dark: "rgba(3, 12, 20, 1)",      // bg-primary from first version (dark)
        },
        secondary: {
          light: "rgba(256, 256, 256, 1)",
          dark: "rgba(18, 24, 36, 1)",     // bg-secondary from first version (dark)
        },
        textPrimary: {
          light: "rgba(27, 38, 59, 1)",    // text from first version (light)
          dark: "rgba(256, 256, 256, 1)",  // text from first version (dark)
        },
        textSecondary: {
          light: "rgba(65, 90, 119, 1)",   // text-muted from first version (light)
          dark: "rgba(90, 110, 140, 1)",   // text-muted from first version (dark)
        },
        accent: {
          light: "rgba(13, 27, 42, 0.5)",    // accent from first version (light)
          dark: "rgba(50, 70, 100, 0.5)",    // accent from first version (dark)
        },
      },
    },
  },
  plugins: [],
};
