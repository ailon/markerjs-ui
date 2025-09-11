import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };
import generatePackageJson from "rollup-plugin-generate-package-json";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src/"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "markerjsUI",
      // the proper extensions will be added
      fileName: "markerjs-ui",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["@markerjs/markerjs3"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          "@markerjs/markerjs3": "markerjs3",
        },
      },
      plugins: [
        generatePackageJson({
          baseContents: (pkg) => {
            pkg.main = "./markerjs-ui.umd.cjs";
            pkg.module = "./markerjs-ui.js";
            pkg.types = "./markerjs-ui.d.ts";
            pkg.scripts = {};
            pkg.devDependencies = {};
            return pkg;
          },
        }),
      ],
    },
  },
  plugins: [
    dts({
      entryRoot: resolve(__dirname, "src/lib"),
      rollupTypes: true,
      insertTypesEntry: true,
    }),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "README.md",
          dest: "./",
        },
        {
          src: "LICENSE",
          dest: "./",
        },
        {
          src: "CHANGELOG.md",
          dest: "./",
        },
      ],
    }),
  ],
});
