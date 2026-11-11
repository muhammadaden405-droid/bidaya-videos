import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Series fonts, bundled in public/fonts (SIL Open Font License) so renders never depend on Google Fonts:
// Amiri for Arabic, Cormorant Garamond for English.
export const amiri = "Amiri";
export const serif = "Cormorant Garamond";
export const sans = "Montserrat"; // bold captions
export const display = "Cinzel"; // titles

const LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT = "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";
const ARABIC = "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC";

const faces: { family: string; file: string; range: string; style?: string; weight?: string }[] = [
  { family: amiri, file: "amiri-arabic-400-normal.woff2", range: ARABIC },
  { family: amiri, file: "amiri-latin-400-normal.woff2", range: LATIN },
  { family: amiri, file: "amiri-latin-ext-400-normal.woff2", range: LATIN_EXT },
  { family: serif, file: "cormorant-garamond-latin-500-normal.woff2", range: LATIN },
  { family: serif, file: "cormorant-garamond-latin-ext-500-normal.woff2", range: LATIN_EXT },
  { family: serif, file: "cormorant-garamond-latin-500-italic.woff2", range: LATIN, style: "italic" },
  { family: serif, file: "cormorant-garamond-latin-ext-500-italic.woff2", range: LATIN_EXT, style: "italic" },
  { family: sans, file: "montserrat-latin-800-normal.woff2", range: LATIN, weight: "800" },
  { family: sans, file: "montserrat-latin-ext-800-normal.woff2", range: LATIN_EXT, weight: "800" },
  { family: display, file: "cinzel-latin-700-normal.woff2", range: LATIN, weight: "700" },
  { family: display, file: "cinzel-latin-ext-700-normal.woff2", range: LATIN_EXT, weight: "700" },
];

for (const f of faces) {
  loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), style: f.style ?? "normal", weight: f.weight ?? "normal", unicodeRange: f.range });
}
