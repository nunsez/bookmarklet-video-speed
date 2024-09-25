import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["./main.ts"],
  outfile: "./dist/bookmarklet-video-speed.js",
  bundle: true,
  format: "iife",
  charset: 'utf8',
  platform: 'browser',
  target: [
    "chrome58",
    "edge18",
    "firefox57",
    "safari11",
  ],
  minify: true
});

esbuild.stop();
