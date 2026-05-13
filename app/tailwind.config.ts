import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#201d1d",
        "ink-deep": "#0f0000",
        charcoal: "#302c2c",
        body: "#424245",
        mute: "#646262",
        stone: "#6e6e73",
        ash: "#9a9898",
        canvas: "#fdfcfc",
        "surface-soft": "#f8f7f7",
        "surface-card": "#f1eeee",
        "surface-dark": "#201d1d",
        "surface-dark-elev": "#302c2c",
        hairline: "rgba(15,0,0,0.12)",
        "hairline-strong": "#646262",
        accent: "#007aff",
        danger: "#ff3b30",
        warning: "#ff9f0a",
        success: "#30d158"
      },
      fontFamily: {
        mono: ['"Berkeley Mono"', '"JetBrains Mono"', '"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      fontSize: {
        "display-xl": ["38px", { lineHeight: "1.5", fontWeight: "700" }],
        "heading-md": ["16px", { lineHeight: "1.5", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-strong": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        "caption-md": ["14px", { lineHeight: "2", fontWeight: "400" }]
      },
      spacing: { section: "96px" },
      borderRadius: { sm: "4px" }
    }
  }
} satisfies Config;
