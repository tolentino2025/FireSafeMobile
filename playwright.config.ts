import { defineConfig, devices } from "@playwright/test";

// Config de E2E web do FireSafe ITM.
// O app web sobe via Expo (`npm run web`) na porta 8081 (Metro/web).
// O Playwright sobe o servidor automaticamente e espera ficar disponível.
const PORT = Number(process.env.E2E_PORT ?? 8081);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Exclui os helpers — não são specs
  testIgnore: ["**/helpers/**"],
  // Bundle Expo web pode demorar no primeiro acesso (cold start).
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Paralelo: cada worker tem localStorage isolado (contexto de browser próprio)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Em CI: reporter GitHub + HTML (publicado como artifact)
  // Local: lista + HTML interativo
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "on-failure" }]],
  use: {
    baseURL: BASE_URL,
    // O app detecta o idioma pelo locale do navegador (expo-localization →
    // navigator.language). Sem isto, o CI headless usa en-US e a UI sobe em
    // inglês (Home/Profile/...), quebrando os seletores PT (Perfil/Cadastros).
    // Forçamos pt-BR para uma UI determinística em português.
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // React Native Web: garante que eventos de toque/click funcionem
    actionTimeout: 15_000,
  },
  projects: [
    // Desktop Chromium — suite principal completa
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Mobile — apenas smoke + navigation + responsive
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: ["**/smoke.spec.ts", "**/navigation.spec.ts", "**/responsive.spec.ts"],
    },
    // iPhone para validação de viewports iOS
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
      testMatch: ["**/smoke.spec.ts", "**/responsive.spec.ts"],
    },
    {
      name: "pixel-5-compliance",
      use: { ...devices["Pixel 5"] },
      testMatch: ["**/playstore-compliance.spec.ts", "**/mobile-quality.spec.ts", "**/privacy-permissions.spec.ts"],
    },
    {
      name: "galaxy-s9-compliance",
      use: {
        ...devices["Galaxy S9+"],
        viewport: { width: 360, height: 740 },
      },
      testMatch: ["**/mobile-quality.spec.ts"],
    },
    {
      name: "android-tablet-compliance",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 800, height: 1280 },
        deviceScaleFactor: 1.5,
      },
      testMatch: ["**/mobile-quality.spec.ts"],
    },
    // ── Captura de elementos gráficos da loja (Play Store) ──
    // Telefone 9:16 -> 360x640 @3x = 1080x1920
    {
      name: "shots-phone",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 },
      testMatch: ["**/store-shots.spec.ts"],
    },
    // Tablet 10" 9:16 -> 540x960 @2x = 1080x1920 (layout mais largo)
    {
      name: "shots-tablet10",
      use: { ...devices["Pixel 5"], viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: false },
      testMatch: ["**/store-shots.spec.ts"],
    },
    // Tablet 7" 9:16 -> 360x640 @2x = 720x1280
    {
      name: "shots-tablet7",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: false },
      testMatch: ["**/store-shots.spec.ts"],
    },
  ],
  // Reaproveita um servidor já rodando em dev; na CI sobe um novo.
  // --non-interactive: evita prompts do Expo CLI no ambiente de CI.
  webServer: {
    command: process.env.CI
      ? "npx expo start --web --non-interactive"
      : "npm run web",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // O primeiro bundle do Expo web pode levar bastante; damos folga generosa.
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Desabilita o portão de auth: a suíte E2E roda em guest mode. Sem isto,
      // como a auth passou a ser obrigatória por padrão, o app subiria na tela
      // de login e todos os testes de fluxo (guest) quebrariam.
      EXPO_PUBLIC_AUTH_REQUIRED: "0",
      // Passa as variáveis de ambiente do processo atual para o servidor web
      ...(process.env.EXPO_PUBLIC_SUPABASE_URL
        ? { EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL }
        : {}),
      ...(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        ? { EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY }
        : {}),
    },
  },
});
