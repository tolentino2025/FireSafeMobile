import { defineConfig } from "vitest/config";

// Inclui apenas testes do backend/scripts, para nao colidir com o app React Native.
export default defineConfig({
  test: {
    include: ["server/**/*.test.ts", "scripts/**/*.test.ts"],
    environment: "node",
    globals: false,
  },
});
