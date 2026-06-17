// Responsividade: verifica que o app renderiza corretamente em viewports distintos.
// Não testa layout pixel-perfect — foca em funcionalidade e ausência de conteúdo cortado.

import { test, expect } from "@playwright/test";
import { waitForApp } from "./helpers/nav";
import { clearAppStorage } from "./helpers/storage";

// Viewports testados
const VIEWPORTS = {
  desktop: { width: 1280, height: 800, label: "Desktop (1280×800)" },
  laptop: { width: 1024, height: 768, label: "Laptop (1024×768)" },
  tablet: { width: 768, height: 1024, label: "Tablet (768×1024)" },
  mobile: { width: 390, height: 844, label: "Mobile iPhone 14 (390×844)" },
  mobileSmall: { width: 375, height: 667, label: "Mobile SE (375×667)" },
} as const;


test.describe("Responsividade — múltiplos viewports", () => {
  for (const [key, vp] of Object.entries(VIEWPORTS)) {
    test(`[${vp.label}] app carrega e mostra tab bar`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await clearAppStorage(page);
      await page.reload();
      await waitForApp(page);

      // Tab bar deve ser visível em todos os tamanhos
      await expect(page.getByText("Perfil").first()).toBeVisible();
      await expect(page.getByText("Cadastros").first()).toBeVisible();
    });

    test(`[${vp.label}] Cadastros é acessível`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await waitForApp(page);

      await page.getByText("Cadastros").last().click();
      await page.waitForTimeout(400);

      await expect(page.getByText("Empresas").first()).toBeVisible({ timeout: 8_000 });
    });
  }

  test("[Mobile] Inspeções visível em tela pequena", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForApp(page);

    await page.getByText("Inspeções").last().click();
    await page.waitForTimeout(400);

    await expect(page.getByPlaceholder("Buscar inspeções...")).toBeVisible({ timeout: 8_000 });
  });

  test("[Desktop] layout não fica maior que a viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await waitForApp(page);

    // Verifica que não há scroll horizontal (indica overflow/layout quebrado)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll, "Scroll horizontal detectado — possível layout quebrado").toBe(false);
  });

  test("[Mobile] tab bar fica dentro da viewport (não cortado)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await waitForApp(page);

    // Tab "Perfil" deve estar visível (não cortado pela viewport)
    const perfilTab = page.getByText("Perfil").first();
    await expect(perfilTab).toBeInViewport();
  });

  test("[Tablet] formulário de empresa é usável", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await waitForApp(page);

    await page.getByText("Cadastros").last().click();
    await page.getByText("Empresas").first().waitFor({ timeout: 10_000 });
    await page.getByText("Empresas").first().click();
    await page.waitForTimeout(400);

    // FAB de adicionar empresa (PropertiesScreen, testID="fab-add" → data-testid no web)
    const fab = page.locator('[data-testid="fab-add"]');
    await expect(fab, "Esperava o FAB de adicionar em tela de Empresas").toBeVisible({ timeout: 5_000 });
  });
});
