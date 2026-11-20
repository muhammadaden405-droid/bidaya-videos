import { Outfit } from "../cartoon/Rig";

// Episode 3 — The Blind Man, the Leper and the Bald Man. Main characters always read clearly apart from the crowd
// (crowds stay muted browns). Each man has a poor look (before) and a rich look (after the gift).

// The leper: poor = torn grey-brown robe, diseased skin; rich = deep crimson robe, gold sash, cream head-wrap.
export const LEPER_POOR: Outfit = { skin: "#b08560", robe: "#7d6f62", robeShade: "#5f5348", spots: 1, beard: "#3a2a1e" };
export const LEPER_RICH: Outfit = { skin: "#b08560", robe: "#8e1b2b", robeShade: "#64121e", sash: "#e3b341", wrap: "#f2e6c8", beard: "#3a2a1e" };
// The bald man: poor = bare shining head, faded olive robe; rich = thick dark hair, emerald robe with a gold sash.
export const BALD_POOR: Outfit = { skin: "#a87650", robe: "#7a7a52", robeShade: "#5c5c3c", shine: 1 };
export const BALD_RICH: Outfit = { skin: "#a87650", robe: "#1d6b4a", robeShade: "#124a33", sash: "#e3b341", hair: "#24170f", hairAmt: 1 };
// The blind man: poor = dark glasses and a stick, plain grey robe; rich = deep blue robe, white wrap, grey beard.
export const BLIND_POOR: Outfit = { skin: "#9c6d4b", robe: "#6e6a66", robeShade: "#524e4b", glasses: true, beard: "#8d8a84" };
export const BLIND_RICH: Outfit = { skin: "#9c6d4b", robe: "#1f3f8a", robeShade: "#142b60", wrap: "#ffffff", beard: "#8d8a84" };
// The angel, sent in the form of a man: clean undyed wool and a soft light (first visit).
export const ANGEL: Outfit = { skin: "#b38a68", robe: "#efe8d8", robeShade: "#d6ccb6", wrap: "#fbf8f0", aura: "#fff1c9" };
// In the test he comes in each man's old form and look, with only a faint light so viewers can follow him.
export const ANGEL_AS: Record<"leper" | "bald" | "blind", Outfit> = {
  leper: { ...LEPER_POOR, aura: "#fff1c9" },
  bald: { ...BALD_POOR, aura: "#fff1c9" },
  blind: { ...BLIND_POOR, aura: "#fff1c9" },
};
