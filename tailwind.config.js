module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        carbon: "#080808",
        graphite: { DEFAULT: "#121212", 700: "#181716", 600: "#1F1D1B" },
        oxblood: "#260B10",
        maroon: "#3A0D15",
        burgundy: "#501018",
        gunmetal: "#77716A",
        steel: "#B0A69A",
        bone: "#D8D1C6"
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', "Impact", "sans-serif"],
        sans: ["Barlow", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"]
      },
      borderRadius: { none: "0", sm: "1px", DEFAULT: "2px", md: "2px", lg: "2px", xl: "2px", "2xl": "3px", "3xl": "3px", full: "2px" },
      boxShadow: { glow: "0 0 0 1px #501018, 0 18px 50px -20px rgba(80,16,24,0.9)" }
    }
  },
  plugins: []
};
