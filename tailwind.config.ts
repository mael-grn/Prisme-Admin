import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        backgroundHover: "var(--background-hover)",
        backgroundTransparent: "var(--background-transparent)",
        dark: "var(--dark)",
        darkHover: "var(--dark-hover)",
        foreground: "var(--foreground)",
        foregroundHover: "var(--foreground-hover)",
      },
    },
  },
  plugins: [],
} satisfies Config;
