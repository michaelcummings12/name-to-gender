import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  minify: true,
  // Bundle the JSON dataset into the output so consumers get a single file per format.
  loader: { ".json": "json" }
});
