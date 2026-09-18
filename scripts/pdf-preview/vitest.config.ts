// Gera o HTML dos relatórios FORA do app, para revisar o PDF sem aparelho.
// Os módulos nativos (expo-*, react-native) viram stubs: os geradores só
// precisam dos dados e do CSS.
import { defineConfig } from "vitest/config";
import path from "node:path";

const repo = path.resolve(__dirname, "../..");
const stubs = path.resolve(__dirname, "stubs.ts");

export default defineConfig({
  define: { __DEV__: "false" },
  resolve: {
    alias: {
      "@/contexts/InspectionContext": stubs,
      "react-native": stubs,
      "expo-print": stubs,
      "expo-sharing": stubs,
      "expo-mail-composer": stubs,
      "expo-asset": stubs,
      "expo-file-system/legacy": stubs,
      "expo-image-manipulator": stubs,
      "expo-localization": stubs,
      "@": repo,
    },
  },
  test: {
    include: [path.resolve(__dirname, "*.spec.ts")],
    environment: "node",
    globals: false,
    testTimeout: 60_000,
  },
});
