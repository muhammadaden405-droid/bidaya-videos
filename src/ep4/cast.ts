import { Outfit } from "../cartoon/Rig";
import { Pose, STAND } from "../cartoon/Rig";

// Episode 4 — The Dead Man Who Named His Killer (the cow of al-Baqarah). Main characters always read clearly
// apart from the crowd (crowds stay muted browns). Mūsā ﵇ is never drawn as a person: only a golden light.
// None of the suspects is styled as a villain: the killer stays hidden until Part 7.

// The old man (the murdered man): very old and rich. Long white beard, deep plum robe, cream wrap with a gold band.
export const OLD: Outfit = { skin: "#b08a6a", robe: "#5a2f55", robeShade: "#3e1f3b", wrap: "#efe3c8", beard: "#f4f1ea", longBeard: true, sash: "#c9962e" };
// The nephew: young, loud, always near the body. Saffron robe, dark wrap, short black beard.
export const NEPHEW: Outfit = { skin: "#a06b48", robe: "#c9771f", robeShade: "#94540f", wrap: "#2e2420", beard: "#1e1510" };
// The man at whose door the body is found (the accused family): olive robe, white wrap, brown beard.
export const ACCUSED: Outfit = { skin: "#9c6d4b", robe: "#5e6b2e", robeShade: "#434d1f", wrap: "#f2ece0", beard: "#4a3320" };
// His family (wife and son), plain but clean.
export const ACCUSED_W: Outfit = { skin: "#a8774f", robe: "#7b5a7a", robeShade: "#5a405a", wrap: "#d9c6d6" };
export const ACCUSED_SON: Outfit = { skin: "#b07a56", robe: "#7d8a52", robeShade: "#5c6638", hair: "#2a1c12", hairAmt: 1 };
// The elder who speaks for the people: grey beard, dark blue robe, white wrap.
export const ELDER: Outfit = { skin: "#9a6a48", robe: "#24365e", robeShade: "#172440", wrap: "#f4efe2", beard: "#a9a59c", longBeard: true };
// The young man devoted to his father: sky blue robe, white wrap, soft light (the one cow's owner).
export const SON: Outfit = { skin: "#b07a56", robe: "#3f86b8", robeShade: "#2b6189", wrap: "#fbf8f0", aura: "#fff1c9" };
// His sleeping father: grey beard, brown robe.
export const FATHER: Outfit = { skin: "#a87650", robe: "#6b4a32", robeShade: "#4b3322", wrap: "#d8ccb0", beard: "#c9c4ba" };
// The pearl merchant: crimson robe, gold sash, tall dark turban.
export const MERCHANT: Outfit = { skin: "#8d5a3b", robe: "#8e1b2b", robeShade: "#64121e", sash: "#e3b341", wrap: "#2a2a40", beard: "#2a1c12" };

// poses (angles: 0 = hanging down, −90 = straight forward; R = near arm)
export const POINT: Pose = { ...STAND, armRU: -98, armRL: -4, lean: 3 };
export const PLEAD: Pose = { ...STAND, armLU: -70, armLL: -30, armRU: -76, armRL: -34, lean: 8, head: 6 };
export const ARMS_UP: Pose = { ...STAND, armLU: -150, armLL: -10, armRU: -156, armRL: -12, head: -6 };
export const SWORD_UP: Pose = { ...STAND, armRU: -160, armRL: -8, armLU: -30, armLL: -40, lean: -2 };
export const SWORD_READY: Pose = { ...STAND, armRU: -60, armRL: -40, lean: 4 };
export const KNEEL: Pose = { bob: 58, lean: 14, head: 10, armLU: -40, armLL: -40, armRU: -60, armRL: -30, legLU: -80, legLL: 150, legRU: -20, legRL: 100 };
export const HANDS_HEAD: Pose = { ...STAND, armLU: -150, armLL: -120, armRU: -150, armRL: -120, head: 10, lean: 8 };
export const BOW_HEAD: Pose = { ...STAND, head: 26, lean: 6 };
export const OFFER: Pose = { ...STAND, armRU: -70, armRL: -20, lean: 4 };
export const REFUSE: Pose = { ...STAND, armRU: -84, armRL: -80, armLU: 10, head: -4, lean: -4 };
export const SLEEP: Pose = { bob: 0, lean: 0, head: 0, armLU: -10, armLL: -20, armRU: -12, armRL: -24, legLU: 0, legLL: 0, legRU: 0, legRL: 0 };
