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
        backgroundOpacity: "var(--background-opacity)",
        onBackground: "var(--on-background)",
        onBackgroundHover: "var(--on-background-hover)",
        foreground: "var(--foreground)",
        onForeground: "var(--on-foreground)",
        onForegroundHover: "var(--on-foreground-hover)",
        dangerous: "var(--dangerous)",
        dangerousHover: "var(--dangerous-hover)",
        safe: "var(--safe)",
        safeHover: "var(--safe-hover)",
      },
    },
  },
  plugins: [],
} satisfies Config;
