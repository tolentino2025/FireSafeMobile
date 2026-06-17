import { defineConfig, devices } from "@playwright/test";

// Config de E2E web do FireSafe ITM.
// O app web sobe via Expo (`npm run web`) na porta 8081 (Metro/web).
// O Playwright sobe o servidor automaticamente e espera ficar disponível.
const PORT = Number(process.env.E2E_PORT ?? 8081);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // O bundle web do Expo pode demorar no primeiro acesso (cold start).
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Reaproveita um servidor já rodando em dev; na CI sobe um novo.
  webServer: {
    command: "npm run web",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // O primeiro bundle do Expo web pode levar bastante; damos folga.
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
