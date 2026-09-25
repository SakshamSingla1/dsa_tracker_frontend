// Curated accent palettes. Deliberately kept to the blue/violet/pink/cyan family --
// difficulty and status colors (--easy green, --medium amber, --revise gold, --hard red)
// are fixed elsewhere, so an accent that strayed into green/amber/red would get
// confused with "done"/"medium"/"hard" at a glance.
export const ACCENTS = {
  indigo: {
    label: "Indigo",
    swatch: "#4a4fcf",
    light: { accent: "#4a4fcf", accentRgb: "74, 79, 207", accentInk: "#ffffff", accentSoft: "#e7e7fa", accentLine: "#c6c6f2", ringEnd: "#c15fd6" },
    dark: { accent: "#9498ff", accentRgb: "148, 152, 255", accentInk: "#12131c", accentSoft: "#262a4a", accentLine: "#3d4278", ringEnd: "#d88ee8" },
  },
  violet: {
    label: "Violet",
    swatch: "#7c3aed",
    light: { accent: "#7c3aed", accentRgb: "124, 58, 237", accentInk: "#ffffff", accentSoft: "#efe6fd", accentLine: "#d5c2f7", ringEnd: "#c2469a" },
    dark: { accent: "#b794f6", accentRgb: "183, 148, 246", accentInk: "#1a1330", accentSoft: "#322152", accentLine: "#4a3470", ringEnd: "#e08ec9" },
  },
  ocean: {
    label: "Ocean",
    swatch: "#0ea5e9",
    light: { accent: "#0ea5e9", accentRgb: "14, 165, 233", accentInk: "#ffffff", accentSoft: "#dff2fc", accentLine: "#b8e2f7", ringEnd: "#5b6fdb" },
    dark: { accent: "#7dd3fc", accentRgb: "125, 211, 252", accentInk: "#082a3a", accentSoft: "#123246", accentLine: "#1c4a63", ringEnd: "#93a3f0" },
  },
  rose: {
    label: "Rose",
    swatch: "#db2777",
    light: { accent: "#db2777", accentRgb: "219, 39, 119", accentInk: "#ffffff", accentSoft: "#fbe3ee", accentLine: "#f4bcd8", ringEnd: "#f2946a" },
    dark: { accent: "#f472b6", accentRgb: "244, 114, 182", accentInk: "#380f24", accentSoft: "#4a1830", accentLine: "#692445", ringEnd: "#f7b48c" },
  },
  cyan: {
    label: "Cyan",
    swatch: "#06b6d4",
    light: { accent: "#06b6d4", accentRgb: "6, 182, 212", accentInk: "#ffffff", accentSoft: "#dbf5fa", accentLine: "#a9e8f2", ringEnd: "#4a7fd6" },
    dark: { accent: "#67e8f9", accentRgb: "103, 232, 249", accentInk: "#08313a", accentSoft: "#113b45", accentLine: "#1a5763", ringEnd: "#8aa3f0" },
  },
  fuchsia: {
    label: "Fuchsia",
    swatch: "#c026d3",
    light: { accent: "#c026d3", accentRgb: "192, 38, 211", accentInk: "#ffffff", accentSoft: "#f7def9", accentLine: "#edb3f2", ringEnd: "#e0679a" },
    dark: { accent: "#e879f9", accentRgb: "232, 121, 249", accentInk: "#35103a", accentSoft: "#431449", accentLine: "#631d6b", ringEnd: "#f29ab8" },
  },
};

export const ACCENT_ORDER = ["indigo", "violet", "ocean", "rose", "cyan", "fuchsia"];
export const DEFAULT_ACCENT = "indigo";
