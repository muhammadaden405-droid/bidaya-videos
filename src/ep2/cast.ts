import { Outfit } from "../cartoon/Rig";

// Episode 2 main cast. Owner's rule: main characters always look clearly distinct from everyone else.
// Crowds, guards and townsfolk stay in muted browns (FOLK / GUARD in cartoon/Trailer.tsx).

// The king: jewelled crown (owner's choice for this story), royal purple, gold trim, red cape with fur collar, dark beard.
export const KING_MAIN: Outfit = {
  skin: "#a8724f",
  robe: "#4a1f63",
  robeShade: "#2f1240",
  cape: "#9b1b26",
  royal: true,
  beard: "#2a1a12",
};

// The old sorcerer: hooded black-violet cloak, long white beard, pale grey skin, faint symbols on the robe, gnarled staff; sneers. (Owner: keep the magic subtle, no bright green glow or smoke.)
export const SORCERER_MAIN: Outfit = {
  skin: "#8f7f72",
  robe: "#1f1828",
  robeShade: "#120d18",
  hood: "#171020",
  beard: "#d9d4cb",
  longBeard: true,
  runes: "#6f7f74",
};

// The boy: pure white with a teal sash and a soft warm light around him; the only bright figure in any crowd.
export const BOY_MAIN: Outfit = {
  skin: "#b07a56",
  robe: "#fbf8f0",
  robeShade: "#ddd5c2",
  wrap: "#ffffff",
  sash: "#2a9d8f",
  aura: "#fff1c9",
};

// The monk: patched, undyed sand-coloured wool, short grey beard, simple grey cap; calm, with a slight smile.
export const MONK_MAIN: Outfit = { skin: "#b58a66", robe: "#dccba2", robeShade: "#b9a67c", wrap: "#a3a39c", beard: "#c9c9c2" };
// The king's companion: royal-blue courtier's robe, white turban, neat black beard.
export const COMPANION_MAIN: Outfit = { skin: "#a87650", robe: "#1f4fa3", robeShade: "#143672", wrap: "#f4f1e8", beard: "#17110e", sash: "#c9c9d2" };
// Shadows on a wall (the slap, the deaths): flat dark shapes, no faces.
export const SHADOW: Outfit = { skin: "#120a06", robe: "#120a06", robeShade: "#120a06" };
export const SHADOW_SORCERER: Outfit = { ...SHADOW, hood: "#120a06", beard: "#120a06", longBeard: true };
