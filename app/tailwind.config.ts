import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        "panel-3": "var(--panel-3)",
        border: "var(--border)",
        "border-soft": "var(--border-soft)",
        text: "var(--text)",
        "text-mute": "var(--text-mute)",
        "text-dim": "var(--text-dim)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        green: "var(--green)",
        amber: "var(--amber)",
        blue: "var(--blue)",
        pink: "var(--pink)",
        danger: "var(--danger)"
      },
      borderColor: {
        DEFAULT: "var(--border)"
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Inter"', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', '"SFMono-Regular"', 'Menlo', 'monospace']
      },
      fontSize: {
        "display-xl": ["30px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["24px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "title": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["14px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-strong": ["14px", { lineHeight: "1.55", fontWeight: "500" }],
        "caption": ["12.5px", { lineHeight: "1.5", fontWeight: "400" }],
        "label": ["11.5px", { lineHeight: "1.4", letterSpacing: "0.12em", fontWeight: "600" }]
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        xxl: "32px"
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "12px",
        pill: "9999px"
      },
      boxShadow: {
        card: "var(--shadow-card)"
      }
    }
  }
} satisfies Config;
