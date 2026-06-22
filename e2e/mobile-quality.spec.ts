import { expect, test } from "@playwright/test";
import { clickTab, waitForApp } from "./helpers/nav";

test.describe("Qualidade mobile Android", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
  });

  test("shell e navegação não excedem horizontalmente a viewport", async ({ page }) => {
    for (const tab of ["Inicio", "Inspeções", "Agenda", "Cadastros", "Perfil"]) {
      await clickTab(page, tab);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `Overflow horizontal na aba ${tab}`).toBe(false);
    }
  });

  test("abas principais permanecem visíveis e com área de toque adequada", async ({ page }) => {
    // Diretriz de qualidade mobile: alvo de toque >= ~44px. Mede o BOTÃO tocável
    // (role=tab), não o nó de texto do rótulo, que é naturalmente baixo.
    const MIN_TOUCH = 40;
    for (const label of ["Inicio", "Inspeções", "Agenda", "Cadastros", "Perfil"]) {
      // O container tocável da aba (RN bottom-tabs => role="tab"); fallback no texto.
      const byRole = page.getByRole("tab", { name: new RegExp(label, "i") });
      const tab = (await byRole.count()) > 0 ? byRole.first() : page.getByText(label).last();
      await expect(tab).toBeInViewport();
      const box = await tab.boundingBox();
      expect(box, `${label} sem área de interação`).not.toBeNull();
      expect(box!.height, `${label} com alvo de toque pequeno`).toBeGreaterThanOrEqual(MIN_TOUCH);
    }
  });

  test("reload preserva um estado funcional (sem tela branca)", async ({ page }) => {
    await clickTab(page, "Inspeções");
    await page.reload();
    await waitForApp(page);
    // Asserção positiva: o shell volta a renderizar, não apenas <body> não-vazio.
    await expect(page.getByText("Perfil").last()).toBeVisible();
  });

  test("falha de rede não produz tela branca", async ({ page, context }) => {
    // App já carregado; corta a rede e exercita navegação offline.
    await context.setOffline(true);
    await clickTab(page, "Cadastros");
    await expect(page.locator("body")).toBeVisible();
    const text = (await page.locator("body").innerText()).trim();
    expect(text.length, "Offline produziu tela vazia").toBeGreaterThan(0);
    await context.setOffline(false);
  });
});
