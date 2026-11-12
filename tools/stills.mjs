// node tools/stills.mjs <CompositionId> <outDir> <frame> [frame...]  — bundle once, render several check frames at half size
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const [id, out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable: "/usr/bin/google-chrome" });
for (const f of frames) {
  await renderStill({ composition, serveUrl, output: `${out}/f${String(f).padStart(5, "0")}.jpg`, frame: Number(f), imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, browserExecutable: "/usr/bin/google-chrome" });
}
console.log("done", frames.length);
