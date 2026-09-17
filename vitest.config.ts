import { defineConfig } from "vitest/config";

// Testes de backend/scripts + modulos puros de utils (sem imports de React Native).
export default defineConfig({
  test: {
    include: ["server/**/*.test.ts", "scripts/**/*.test.ts", "utils/**/*.test.ts"],
    environment: "node",
    globals: false,
  },
});
